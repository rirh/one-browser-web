import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/responsive-dialog';
import { SystemResourceTable } from '@/components/system-resource-table';
import type { SystemRecord } from '@/components/system-resource-table/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/auth-gate';
import {
  hasButtonPermission,
  hasPermission,
} from '@/features/auth/permissions';
import { toBrowserErrorMessage } from '@/features/browser/errors';
import {
  getRemoteTeamRole,
  listRemoteTeamRolePermissions,
  updateRemoteTeamRole,
} from '@/features/browser/organization/roles/api';
import { RoleDialog as TeamRoleDialog } from '@/features/browser/organization/roles/components/role-dialog';
import { remoteRoleQueryKeys } from '@/features/browser/organization/roles/query-keys';
import type { RemoteTeamRolePayload } from '@/features/browser/organization/roles/types';
import { formatDateTimeTitle, formatDisplayDateTime } from '@/lib/date-time';
import { http } from '@/lib/http';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  Edit02Icon,
  ListChevronsDownUpIcon,
  ListTreeIcon,
  MoreHorizontalIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';
import { toast } from 'sonner';

type StatusFlag = '0' | '1';

type RoleResource = {
  role_id: number;
  team_id: number | null;
  role_name: string;
  role_key: string;
  role_sort: number;
  data_scope: string;
  status: StatusFlag;
  system_role: boolean;
  protected: boolean;
  created_at: string;
  remark: string | null;
};

type MenuResource = {
  menu_id: number;
  menu_name: string;
  parent_id: number | null;
  order_num: number;
  menu_type: 'M' | 'C' | 'F';
  permission_scope: 'S' | 'T' | 'G';
  status: StatusFlag;
  perms: string | null;
};

type AppPermissionResource = {
  permission_id: number;
  permission_name: string;
  parent_id: number | null;
  order_num: number;
  permission_type: 'M' | 'C' | 'F';
  status: StatusFlag;
  permission_code: string | null;
  assignable: boolean;
};

type PermissionOption = {
  id: number;
  name: string;
  parentId: number | null;
  order: number;
  type: 'M' | 'C' | 'F';
  status: StatusFlag;
  permissionCode: string | null;
  assignable: boolean;
  source: 'menu' | 'app';
};

type PermissionNode = PermissionOption & { children: PermissionNode[] };
type RolePermissions = { menu_ids: number[]; app_permission_ids: number[] };
type PageResponse<T> = { list: T[]; total: number };
type RoleEditorState =
  | { mode: 'create' }
  | { mode: 'edit'; role: RoleResource }
  | { mode: 'edit-team'; role: RoleResource };

const ROLES_QUERY_KEY = ['system-resource', '/system/roles'] as const;

export default function RolePage() {
  const { access } = useAuth();
  const queryClient = useQueryClient();
  const canCreate = hasButtonPermission(access, 'system:role:create');
  const canUpdate = hasButtonPermission(access, 'system:role:update');
  const canDelete = hasButtonPermission(access, 'system:role:delete');
  const canUpdateStatus = hasButtonPermission(access, 'system:role:status');
  const [editor, setEditor] = React.useState<RoleEditorState | null>(null);
  const [deletingRole, setDeletingRole] = React.useState<RoleResource | null>(
    null,
  );
  const [disablingRole, setDisablingRole] = React.useState<RoleResource | null>(
    null,
  );

  const statusMutation = useMutation({
    mutationFn: ({
      role,
      status,
    }: {
      role: RoleResource;
      status: StatusFlag;
    }) => updateRoleStatus(role, status),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: remoteRoleQueryKeys.roles(),
        }),
      ]);
      toast.success(variables.status === '0' ? '角色已启用' : '角色已停用');
      if (variables.status === '1') {
        setDisablingRole(null);
      }
    },
    onError: (error) => toast.error(toBrowserErrorMessage(error)),
  });

  const renderCell = React.useCallback(
    (field: string, value: unknown, record: SystemRecord) => {
      const role = record as RoleResource;
      if (field === 'status') {
        return (
          <Switch
            size="sm"
            checked={role.status === '0'}
            disabled={
              role.protected || !canUpdateStatus || statusMutation.isPending
            }
            aria-label={`${role.role_name}角色状态`}
            onCheckedChange={(checked) => {
              if (checked) {
                statusMutation.mutate({ role, status: '0' });
              } else {
                setDisablingRole(role);
              }
            }}
          />
        );
      }
      if (field === 'data_scope') {
        return (
          <Badge variant="outline">
            {role.system_role || role.data_scope === '1'
              ? '全部数据'
              : '仅本人'}
          </Badge>
        );
      }
      if (field === 'permissions') {
        return (
          <Badge variant="outline">
            {role.system_role ? '全部权限' : '按角色配置'}
          </Badge>
        );
      }
      if (field === 'created_at') {
        return (
          <span
            className="text-muted-foreground"
            title={formatDateTimeTitle(role.created_at)}
          >
            {formatDisplayDateTime(role.created_at)}
          </span>
        );
      }
      return undefined;
    },
    [canUpdateStatus, statusMutation],
  );

  const renderRowActions = React.useCallback(
    (record: SystemRecord) => {
      const role = record as RoleResource;
      if (role.protected) return null;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`${role.role_name}操作`}
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuGroup>
              {canUpdate ? (
                <DropdownMenuItem
                  onSelect={() =>
                    setEditor({
                      mode: role.team_id === null ? 'edit' : 'edit-team',
                      role,
                    })
                  }
                >
                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                  编辑角色
                </DropdownMenuItem>
              ) : null}
              {canDelete && role.team_id === null ? (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeletingRole(role)}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                  删除角色
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    [canDelete, canUpdate],
  );

  return (
    <>
      <SystemResourceTable
        config={{
          title: '角色管理',
          description: '管理系统角色及其 Web、App 权限。',
          endpoint: '/system/roles',
          serverPagination: true,
          columns: [
            'role_name',
            'role_key',
            'data_scope',
            'permissions',
            'status',
            'created_at',
          ],
        }}
        renderCell={renderCell}
        renderRowActions={canUpdate || canDelete ? renderRowActions : undefined}
        toolbarActions={
          canCreate ? (
            <Button size="sm" onClick={() => setEditor({ mode: 'create' })}>
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              新增角色
            </Button>
          ) : undefined
        }
      />

      {editor?.mode === 'edit-team' ? (
        <TeamRoleEditorDialog
          role={editor.role}
          onClose={() => setEditor(null)}
        />
      ) : editor ? (
        <RoleEditorDialog
          state={editor}
          access={access}
          onClose={() => setEditor(null)}
        />
      ) : null}
      <RoleDeleteDialog
        role={deletingRole}
        onClose={() => setDeletingRole(null)}
      />
      <DisableRoleDialog
        role={disablingRole}
        isPending={statusMutation.isPending}
        onClose={() => setDisablingRole(null)}
        onConfirm={() => {
          if (disablingRole) {
            statusMutation.mutate({ role: disablingRole, status: '1' });
          }
        }}
      />
    </>
  );
}

function TeamRoleEditorDialog({
  role,
  onClose,
}: {
  role: RoleResource;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const teamId = role.team_id ?? 0;
  const roleQuery = useQuery({
    queryKey: [...remoteRoleQueryKeys.roles(), 'detail', teamId, role.role_id],
    queryFn: () => getRemoteTeamRole(role.role_id, teamId),
    enabled: teamId > 0,
  });
  const permissionsQuery = useQuery({
    queryKey: remoteRoleQueryKeys.permissions(teamId),
    queryFn: () => listRemoteTeamRolePermissions(teamId),
    enabled: teamId > 0,
  });
  const mutation = useMutation({
    mutationFn: (payload: RemoteTeamRolePayload) =>
      updateRemoteTeamRole(role.role_id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: remoteRoleQueryKeys.roles(),
        }),
      ]);
      toast.success('角色已更新');
      onClose();
    },
    onError: (error) => toast.error(toBrowserErrorMessage(error)),
  });

  if (roleQuery.isLoading || roleQuery.isError) {
    return (
      <ResponsiveDialog open onOpenChange={(open) => !open && onClose()}>
        <ResponsiveDialogContent className="sm:max-w-lg">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>编辑角色</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              加载团队角色和权限范围。
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            <p
              className={cn(
                'text-sm',
                roleQuery.isError
                  ? 'text-destructive'
                  : 'text-muted-foreground',
              )}
            >
              {roleQuery.isError
                ? toBrowserErrorMessage(roleQuery.error)
                : '正在加载角色…'}
            </p>
          </ResponsiveDialogBody>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  return (
    <TeamRoleDialog
      mode="edit"
      record={roleQuery.data}
      teamId={teamId}
      teamName={`团队 ${teamId}`}
      permissionOptions={permissionsQuery.data ?? []}
      isLoadingPermissions={permissionsQuery.isLoading}
      hasPermissionError={permissionsQuery.isError}
      onRetryPermissions={() => void permissionsQuery.refetch()}
      isSaving={mutation.isPending}
      onOpenChange={(open) => !open && !mutation.isPending && onClose()}
      onSubmit={(payload) => mutation.mutate(payload)}
    />
  );
}

function RoleEditorDialog({
  state,
  access,
  onClose,
}: {
  state: { mode: 'create' } | { mode: 'edit'; role: RoleResource };
  access: ReturnType<typeof useAuth>['access'];
  onClose: () => void;
}) {
  const role = state.mode === 'edit' ? state.role : null;
  const menusQuery = useQuery({
    queryKey: ['system', 'menus', 'role-options'],
    queryFn: listSystemMenus,
  });
  const appPermissionsQuery = useQuery({
    queryKey: ['system', 'app-permissions', 'role-options'],
    queryFn: listAppPermissions,
  });
  const bindingsQuery = useQuery({
    queryKey: ['system', 'roles', role?.role_id, 'permissions'],
    queryFn: () => getRolePermissions(role?.role_id ?? 0),
    enabled: Boolean(role),
  });
  const isLoading =
    menusQuery.isLoading ||
    appPermissionsQuery.isLoading ||
    (Boolean(role) && bindingsQuery.isLoading);
  const error =
    menusQuery.error ?? appPermissionsQuery.error ?? bindingsQuery.error;

  if (isLoading || error) {
    return (
      <ResponsiveDialog open onOpenChange={(open) => !open && onClose()}>
        <ResponsiveDialogContent className="sm:max-w-lg">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {role ? '编辑角色' : '新增角色'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              加载角色权限范围。
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            <p
              className={cn(
                'text-sm',
                error ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {error ? toBrowserErrorMessage(error) : '正在加载权限…'}
            </p>
          </ResponsiveDialogBody>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  const permissionOptions = markAssignableOptions(
    mergePermissionOptions(
      (menusQuery.data ?? [])
        .filter((menu) => menu.permission_scope === 'S')
        .map(menuOption),
      (appPermissionsQuery.data ?? []).map(appPermissionOption),
    ),
    access,
  ).filter((option) => option.assignable);

  return (
    <LoadedRoleEditorDialog
      role={role}
      permissionOptions={permissionOptions}
      initialPermissions={
        bindingsQuery.data ?? { menu_ids: [], app_permission_ids: [] }
      }
      onClose={onClose}
    />
  );
}

function LoadedRoleEditorDialog({
  role,
  permissionOptions,
  initialPermissions,
  onClose,
}: {
  role: RoleResource | null;
  permissionOptions: PermissionOption[];
  initialPermissions: RolePermissions;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { access } = useAuth();
  const [roleName, setRoleName] = React.useState(role?.role_name ?? '');
  const [roleKey, setRoleKey] = React.useState(role?.role_key ?? '');
  const [remark, setRemark] = React.useState(role?.remark ?? '');
  const [permissionIds, setPermissionIds] = React.useState(
    () =>
      new Set([
        ...initialPermissions.menu_ids,
        ...initialPermissions.app_permission_ids,
      ]),
  );
  const mutation = useMutation({
    mutationFn: async () => {
      const roleId = role
        ? role.role_id
        : await createRole({
            role_name: roleName,
            role_key: roleKey,
            remark,
            data_scope: access.is_super_admin ? '1' : '5',
          });
      if (role) {
        await updateRole(role, {
          role_name: roleName,
          role_key: roleKey,
          remark,
        });
      }
      await setRolePermissions(roleId, {
        menu_ids: permissionOptions
          .filter(
            (option) =>
              option.source === 'menu' && permissionIds.has(option.id),
          )
          .map((option) => option.id),
        app_permission_ids: permissionOptions
          .filter(
            (option) => option.source === 'app' && permissionIds.has(option.id),
          )
          .map((option) => option.id),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      toast.success(role ? '角色已更新' : '角色已创建');
      onClose();
    },
    onError: async (error) => {
      toast.error(toBrowserErrorMessage(error));
      // Creating the role may succeed before its permission request fails.
      await queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && !mutation.isPending && onClose()}
    >
      <ResponsiveDialogContent className="sm:max-w-3xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {role ? '编辑角色' : '新增角色'}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            配置当前角色可以使用的全部权限。
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <RoleField label="角色名称">
              <Input
                value={roleName}
                maxLength={64}
                onChange={(event) => setRoleName(event.target.value)}
              />
            </RoleField>
            <RoleField label="角色标识">
              <Input
                value={roleKey}
                maxLength={100}
                onChange={(event) => setRoleKey(event.target.value)}
              />
            </RoleField>
          </div>
          <PermissionTreePanel
            title="角色权限"
            options={permissionOptions}
            selectedIds={permissionIds}
            onChange={setPermissionIds}
          />
          <RoleField label="备注">
            <Textarea
              value={remark}
              maxLength={500}
              onChange={(event) => setRemark(event.target.value)}
            />
          </RoleField>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            disabled={mutation.isPending || !roleName.trim() || !roleKey.trim()}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? '保存中…' : '保存'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function PermissionTreePanel({
  title,
  options,
  selectedIds,
  onChange,
}: {
  title: string;
  options: PermissionOption[];
  selectedIds: Set<number>;
  onChange: React.Dispatch<React.SetStateAction<Set<number>>>;
}) {
  const tree = React.useMemo(() => buildTree(options), [options]);
  const expandableIds = React.useMemo(() => collectExpandableIds(tree), [tree]);
  const [expandedIds, setExpandedIds] = React.useState(
    () => new Set(expandableIds),
  );
  const assignableIds = React.useMemo(
    () =>
      options.filter((option) => option.assignable).map((option) => option.id),
    [options],
  );
  const allSelected =
    assignableIds.length > 0 &&
    assignableIds.every((id) => selectedIds.has(id));
  const allExpanded =
    expandableIds.length > 0 &&
    expandableIds.every((id) => expandedIds.has(id));

  return (
    <div className="bg-background overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!expandableIds.length}
            onClick={() =>
              setExpandedIds(allExpanded ? new Set() : new Set(expandableIds))
            }
          >
            <HugeiconsIcon
              icon={allExpanded ? ListChevronsDownUpIcon : ListTreeIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {allExpanded ? '全部收起' : '全部展开'}
          </Button>
          <label className="text-muted-foreground flex items-center gap-2 text-xs">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) =>
                onChange(checked ? new Set(assignableIds) : new Set())
              }
            />
            全选
          </label>
        </div>
      </div>
      <ScrollArea className="h-64">
        <div className="p-2">
          {tree.length ? (
            tree.map((node) => (
              <PermissionNodeRow
                key={node.id}
                node={node}
                depth={0}
                selectedIds={selectedIds}
                onChange={onChange}
                expandedIds={expandedIds}
                onToggleExpanded={(id) =>
                  setExpandedIds((current) => {
                    const next = new Set(current);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
              />
            ))
          ) : (
            <p className="text-muted-foreground py-10 text-center text-xs">
              暂无可分配权限
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function PermissionNodeRow({
  node,
  depth,
  selectedIds,
  onChange,
  expandedIds,
  onToggleExpanded,
}: {
  node: PermissionNode;
  depth: number;
  selectedIds: Set<number>;
  onChange: React.Dispatch<React.SetStateAction<Set<number>>>;
  expandedIds: Set<number>;
  onToggleExpanded: (id: number) => void;
}) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const inputId = React.useId();
  const descendantIds = collectAssignableIds(node);
  const selectedCount = descendantIds.filter((id) =>
    selectedIds.has(id),
  ).length;
  const checked =
    selectedCount === 0
      ? false
      : selectedCount === descendantIds.length
        ? true
        : 'indeterminate';

  return (
    <div>
      <div
        className="hover:bg-muted/70 flex min-h-8 items-center gap-1.5 rounded-md pr-2 text-xs"
        style={{ paddingLeft: 4 + depth * 16 }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={!hasChildren}
          aria-label={expanded ? '收起权限节点' : '展开权限节点'}
          onClick={() => onToggleExpanded(node.id)}
        >
          {hasChildren ? (
            <HugeiconsIcon
              icon={expanded ? ArrowDown01Icon : ArrowRight01Icon}
              strokeWidth={2}
            />
          ) : null}
        </Button>
        <label
          htmlFor={inputId}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
        >
          <Checkbox
            id={inputId}
            checked={checked}
            disabled={!descendantIds.length}
            onCheckedChange={(value) =>
              onChange((current) => {
                const next = new Set(current);
                descendantIds.forEach((id) =>
                  value === true ? next.add(id) : next.delete(id),
                );
                return next;
              })
            }
          />
          <span
            className={cn(
              'truncate',
              node.status === '1' && 'text-muted-foreground',
            )}
          >
            {node.name}
          </span>
          <Badge variant="outline" className="h-4 px-1.5">
            {permissionTypeLabel(node.type)}
          </Badge>
        </label>
      </div>
      {hasChildren && expanded
        ? node.children.map((child) => (
            <PermissionNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              onChange={onChange}
              expandedIds={expandedIds}
              onToggleExpanded={onToggleExpanded}
            />
          ))
        : null}
    </div>
  );
}

function DisableRoleDialog({
  role,
  isPending,
  onClose,
  onConfirm,
}: {
  role: RoleResource | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ResponsiveDialog
      open={Boolean(role)}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>确认停用角色</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {`停用后，已分配“${role?.role_name ?? '该角色'}”的用户或成员将不再通过该角色获得相应权限。是否继续？`}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <Button variant="outline" disabled={isPending} onClick={onClose}>
            取消
          </Button>
          <Button
            variant="destructive"
            disabled={isPending || !role}
            onClick={onConfirm}
          >
            {isPending ? '停用中…' : '确认停用'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function RoleDeleteDialog({
  role,
  onClose,
}: {
  role: RoleResource | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteRole(role?.role_id ?? 0),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      toast.success('角色已删除');
      onClose();
    },
    onError: (error) => toast.error(toBrowserErrorMessage(error)),
  });
  return (
    <ResponsiveDialog
      open={Boolean(role)}
      onOpenChange={(open) => !open && !mutation.isPending && onClose()}
    >
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>确认删除角色</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            删除后无法恢复。是否删除 {role?.role_name}？
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? '删除中…' : '确认删除'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function RoleField({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <Label className="mb-1.5">{label}</Label>
      {children}
    </div>
  );
}

function buildTree(options: PermissionOption[]) {
  const nodes = new Map<number, PermissionNode>();
  const roots: PermissionNode[] = [];
  options.forEach((option) =>
    nodes.set(option.id, { ...option, children: [] }),
  );
  options.forEach((option) => {
    const node = nodes.get(option.id);
    if (!node) return;
    const parent = option.parentId ? nodes.get(option.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  const sort = (items: PermissionNode[]) => {
    items.sort((left, right) => left.order - right.order || left.id - right.id);
    items.forEach((item) => sort(item.children));
  };
  sort(roots);
  return roots;
}

function markAssignableOptions(
  options: PermissionOption[],
  access: ReturnType<typeof useAuth>['access'],
) {
  if (access.is_super_admin) {
    return options.map((option) => ({ ...option, assignable: true }));
  }

  const routeIds = new Set<number>();
  const collectRouteIds = (routes: typeof access.routes) => {
    routes.forEach((route) => {
      routeIds.add(route.id);
      collectRouteIds(route.children ?? []);
    });
  };
  collectRouteIds(access.routes);

  return options.map((option) => {
    if (option.source === 'app') return option;
    return {
      ...option,
      assignable:
        routeIds.has(option.id) ||
        Boolean(
          option.permissionCode && hasPermission(access, option.permissionCode),
        ),
    };
  });
}

function collectAssignableIds(node: PermissionNode): number[] {
  return [
    ...(node.assignable ? [node.id] : []),
    ...node.children.flatMap(collectAssignableIds),
  ];
}

function collectExpandableIds(nodes: PermissionNode[]): number[] {
  return nodes.flatMap((node) => [
    ...(node.children.length ? [node.id] : []),
    ...collectExpandableIds(node.children),
  ]);
}

function menuOption(menu: MenuResource): PermissionOption {
  return {
    id: menu.menu_id,
    name: menu.menu_name,
    parentId: menu.parent_id,
    order: menu.order_num,
    type: menu.menu_type,
    status: menu.status,
    permissionCode: menu.perms,
    assignable: true,
    source: 'menu',
  };
}

function appPermissionOption(
  permission: AppPermissionResource,
): PermissionOption {
  return {
    id: permission.permission_id,
    name: permission.permission_name,
    parentId: permission.parent_id,
    order: permission.order_num,
    type: permission.permission_type,
    status: permission.status,
    permissionCode: permission.permission_code,
    assignable: permission.assignable,
    source: 'app',
  };
}

function mergePermissionOptions(
  menuOptions: PermissionOption[],
  appOptions: PermissionOption[],
) {
  const optionById = new Map(menuOptions.map((option) => [option.id, option]));
  appOptions.forEach((option) => {
    const existing = optionById.get(option.id);
    if (!existing || option.assignable) {
      optionById.set(option.id, option);
    }
  });
  return Array.from(optionById.values());
}

function permissionTypeLabel(type: PermissionOption['type']) {
  return type === 'M' ? '目录' : type === 'C' ? '菜单' : '按钮';
}

async function listSystemMenus() {
  const menus: MenuResource[] = [];
  for (let page = 1; ; page += 1) {
    const response = await http.get<PageResponse<MenuResource>>(
      '/system/menus',
      { page, page_size: 100 },
    );
    menus.push(...response.data.list);
    if (menus.length >= response.data.total || response.data.list.length === 0)
      return menus;
  }
}

async function listAppPermissions() {
  const response = await http.get<AppPermissionResource[]>(
    '/system/app-permissions',
  );
  return response.data;
}

async function getRolePermissions(roleId: number) {
  const response = await http.get<RolePermissions>(
    `/system/roles/${roleId}/permissions`,
  );
  return response.data;
}

async function createRole(values: {
  data_scope: string;
  role_name: string;
  role_key: string;
  remark: string;
}) {
  const response = await http.post<{ id: number }, Record<string, unknown>>(
    '/system/roles',
    {
      ...values,
      status: '0',
    },
  );
  return response.data.id;
}

async function updateRole(
  role: RoleResource,
  values: Partial<
    Pick<RoleResource, 'role_name' | 'role_key' | 'status' | 'remark'>
  >,
) {
  await http.put(`/system/roles/${role.role_id}`, {
    role_name: values.role_name ?? role.role_name,
    role_key: values.role_key ?? role.role_key,
    data_scope: role.data_scope,
    status: values.status ?? role.status,
    remark: values.remark ?? role.remark,
  });
}

async function updateRoleStatus(role: RoleResource, status: StatusFlag) {
  if (role.team_id === null) {
    await updateRole(role, { status });
    return;
  }

  const teamRole = await getRemoteTeamRole(role.role_id, role.team_id);
  await updateRemoteTeamRole(role.role_id, {
    team_id: teamRole.team_id,
    role_name: teamRole.role_name,
    role_key: teamRole.role_key,
    role_sort: teamRole.role_sort,
    status,
    remark: teamRole.remark ?? '',
    menus: teamRole.menus,
    permissions: teamRole.permissions,
  });
}

async function setRolePermissions(
  roleId: number,
  permissions: RolePermissions,
) {
  await http.put(`/system/roles/${roleId}/permissions`, permissions);
}

async function deleteRole(roleId: number) {
  await http.delete(`/system/roles/${roleId}`);
}
