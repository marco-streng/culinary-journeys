import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchGetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { QueryGroupsArgs } from '../types/gql';
import { handler } from './groups';

mockClient(DynamoDBClient);
const ddbDocMock = mockClient(DynamoDBDocumentClient);

describe('groups', () => {
  beforeEach(() => {
    ddbDocMock.reset();
    process.env.TABLE_NAME = 'table';
  });

  afterEach(() => {
    process.env.TABLE_NAME = undefined;
  });

  test('resolve successfully', async () => {
    ddbDocMock.on(BatchGetCommand).resolves({
      Responses: {
        table: [
          {
            id: '5f6b4e5a-892f-4a6a-b7e7-ba083e42724d',
            name: 'lorem ipsum',
          },
        ],
      },
    });

    const result = await handler({
      identity: {
        groups: ['admin'],
      },
      arguments: {
        ids: [
          '7fc0791e-2c73-4f65-853a-8d50b9196b1c',
          '5f6b4e5a-892f-4a6a-b7e7-ba083e42724d',
        ],
      } as QueryGroupsArgs,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(ddbDocMock).toHaveReceivedCommandWith(BatchGetCommand, {
      RequestItems: {
        table: {
          Keys: [
            {
              id: '7fc0791e-2c73-4f65-853a-8d50b9196b1c',
              kind: 'group',
            },
            {
              id: '5f6b4e5a-892f-4a6a-b7e7-ba083e42724d',
              kind: 'group',
            },
          ],
        },
      },
    });

    expect(result).toStrictEqual([
      {
        id: '5f6b4e5a-892f-4a6a-b7e7-ba083e42724d',
        name: 'lorem ipsum',
      },
    ]);
  });
});
