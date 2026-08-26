type RemoteEnvironmentIdentity = {
  environment_id: number;
};

const remoteEnvironmentProfilePrefix = 'remote-env-';

export function remoteEnvironmentProfileId(
  environment: RemoteEnvironmentIdentity | number,
) {
  const environmentId =
    typeof environment === 'number' ? environment : environment.environment_id;

  return `${remoteEnvironmentProfilePrefix}${environmentId}`;
}

export function parseRemoteEnvironmentProfileId(profileId: string) {
  if (!profileId.startsWith(remoteEnvironmentProfilePrefix)) {
    return null;
  }

  const environmentId = Number(
    profileId.slice(remoteEnvironmentProfilePrefix.length),
  );

  return Number.isSafeInteger(environmentId) && environmentId > 0
    ? environmentId
    : null;
}
