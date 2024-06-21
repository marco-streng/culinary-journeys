import { AppSyncIdentityCognito } from 'aws-lambda';

export const restrictAdminAccess = (
  identity?: AppSyncIdentityCognito | null,
) => {
  if (
    !identity ||
    !(identity as AppSyncIdentityCognito).groups?.includes('admin')
  ) {
    throw new Error('Not authorized');
  }

  return true;
};

export const restrictUserAccess = (
  sub: string,
  identity?: AppSyncIdentityCognito | null,
) => {
  if (!identity || (identity as AppSyncIdentityCognito).sub !== sub) {
    throw new Error('Not authorized');
  }

  return true;
};
