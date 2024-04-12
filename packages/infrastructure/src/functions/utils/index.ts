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
