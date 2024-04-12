import { Context, DynamoDBGetItemRequest } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import { Restaurant, User } from '../types/gql';

export const request = (
  ctx: Context<never, never, { createdBy?: string }>,
): DynamoDBGetItemRequest => {
  const { createdBy } = ctx.source;

  return ddb.get({
    key: {
      id: createdBy,
      kind: 'user',
    },
  });
};

export const response = (
  ctx: Context<never, never, never, never, User>,
): Restaurant['createdBy'] => ctx.result;
