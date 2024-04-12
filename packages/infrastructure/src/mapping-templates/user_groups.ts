import { Context, DynamoDBBatchGetItemRequest, util } from '@aws-appsync/utils';
import type { Group, User } from '../types/gql';

export const request = (
  ctx: Context<never, never, never, { groupIds?: string[] }>,
): DynamoDBBatchGetItemRequest => {
  const { groupIds = [] } = ctx.source ?? {};

  return {
    operation: 'BatchGetItem',
    tables: {
      [ctx.env.TABLE_NAME]: {
        keys: groupIds
          .filter((id) => id !== 'admin')
          .map((id) => ({
            id: util.dynamodb.toDynamoDB(id),
            kind: util.dynamodb.toDynamoDB('group'),
          })),
      },
    },
  };
};

export const response = (
  ctx: Context<never, never, never, never, { data: Record<string, Group[]> }>,
): User['groups'] => ctx.result.data[ctx.env.TABLE_NAME];
