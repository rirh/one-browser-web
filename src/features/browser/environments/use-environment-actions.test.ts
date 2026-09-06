import { beforeEach, expect, it, vi } from 'vitest';
import type { RemoteEnvironmentResource } from './types';

const harness = vi.hoisted(() => ({
  slots: [] as unknown[],
  index: 0,
  get: vi.fn(),
  error: vi.fn(),
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => {
    const slot = harness.index++;
    if (!(slot in harness.slots)) harness.slots[slot] = initial;
    return [
      harness.slots[slot],
      (value: unknown) => {
        harness.slots[slot] =
          typeof value === 'function' ? value(harness.slots[slot]) : value;
      },
    ];
  },
  useRef: (initial: unknown) => {
    const slot = harness.index++;
    if (!(slot in harness.slots)) harness.slots[slot] = { current: initial };
    return harness.slots[slot];
  },
  useMemo: (factory: () => unknown) => factory(),
  useCallback: (callback: unknown) => callback,
  useLayoutEffect: (effect: () => void, deps: unknown[]) => {
    const slot = harness.index++;
    if (JSON.stringify(harness.slots[slot]) !== JSON.stringify(deps)) {
      harness.slots[slot] = deps;
      effect();
    }
  },
}));
vi.mock('./api', () => ({ getRemoteEnvironment: harness.get }));
vi.mock('./queries', () => {
  const mutation = () => ({
    isPending: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  });
  return {
    useCreateRemoteEnvironmentMutation: mutation,
    useUpdateRemoteEnvironmentMutation: mutation,
    useDeleteRemoteEnvironmentMutation: mutation,
    useRemoteEnvironmentStatusMutation: mutation,
    useRemoteEnvironmentRuntimeMutation: mutation,
  };
});
vi.mock('@/lib/desktop', () => ({ isTauriRuntime: () => false }));
vi.mock('@/lib/desktop/app-gate', () => ({
  useDesktopAppGate: () => ({ requireDesktopApp: vi.fn() }),
}));
vi.mock('../status/queries', () => ({ useAppStatusQuery: () => ({}) }));
vi.mock('../runtime/open-progress-toast', () => ({}));
vi.mock('sonner', () => ({ toast: { error: harness.error } }));
import { useEnvironmentActions } from './use-environment-actions';

function EnvironmentActionsHarness(team: number) {
  harness.index = 0;
  return useEnvironmentActions({
    environments: [],
    filteredEnvironments: [],
    localRuntimeEnvironmentIds: new Set(),
    selectedTeamId: team,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canChangeStatus: true,
  });
}
function deferred() {
  let resolve!: (record: RemoteEnvironmentResource) => void;
  const promise = new Promise<RemoteEnvironmentResource>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
beforeEach(() => {
  harness.slots = [];
  harness.index = 0;
  harness.get.mockReset();
});

it('discards a detail response when the selected team changes while awaiting it', async () => {
  const request = deferred();
  harness.get.mockReturnValue(request.promise);
  const pending = EnvironmentActionsHarness(1).openEditor(42);
  EnvironmentActionsHarness(2);
  request.resolve({
    environment_id: 42,
    team_id: 1,
  } as RemoteEnvironmentResource);
  await pending;
  expect(EnvironmentActionsHarness(2).dialogState).toBeNull();
  expect(EnvironmentActionsHarness(2).loadingDetailId).toBeNull();
});

it('keeps the latest edit when two detail responses arrive out of order', async () => {
  const first = deferred();
  const second = deferred();
  harness.get
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const actions = EnvironmentActionsHarness(1);
  const old = actions.openEditor(1);
  const latest = actions.openEditor(2);
  second.resolve({
    environment_id: 2,
    team_id: 1,
  } as RemoteEnvironmentResource);
  await latest;
  first.resolve({ environment_id: 1, team_id: 1 } as RemoteEnvironmentResource);
  await old;
  expect(EnvironmentActionsHarness(1).dialogState?.record?.environment_id).toBe(
    2,
  );
});

it('does not reopen an editor dismissed while its detail request was pending', async () => {
  const request = deferred();
  harness.get.mockReturnValue(request.promise);
  const actions = EnvironmentActionsHarness(1);
  const pending = actions.openEditor(42);
  actions.closeEditor();
  request.resolve({
    environment_id: 42,
    team_id: 1,
  } as RemoteEnvironmentResource);
  await pending;
  expect(EnvironmentActionsHarness(1).dialogState).toBeNull();
});
