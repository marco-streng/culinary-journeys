import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBGetItemRequest,
  util,
} from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import type { Query, QueryUserArgs, User } from '../types/gql';

export const request = (
  ctx: Context<QueryUserArgs>,
): DynamoDBGetItemRequest => {
  const { id } = ctx.args;
  const { groups, sub } = ctx.identity as AppSyncIdentityCognito;

  if (id !== sub && !groups?.includes('admin')) {
    util.error('operation not allowed');
  }

  return ddb.get({
    key: {
      id: ctx.args.id,
      kind: 'user',
    },
  });
};

export const response = (
  ctx: Context<QueryUserArgs, never, never, never, User>,
): Query['user'] => ctx.result;
