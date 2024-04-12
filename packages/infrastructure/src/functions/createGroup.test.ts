import {
  CognitoIdentityProviderClient,
  CreateGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { MutationCreateGroupArgs } from '../types/gql';
import { handler } from './createGroup';

const cognitoMock = mockClient(CognitoIdentityProviderClient);
mockClient(DynamoDBClient);
const ddbDocMock = mockClient(DynamoDBDocumentClient);

const matchUuuid = expect.stringMatching(
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
);

describe('createGroup', () => {
  beforeEach(() => {
    ddbDocMock.reset();
    process.env.USER_POOL_ID = 'eu-central-1_xxxxxxxxx';
    process.env.TABLE_NAME = 'table';
  });

  afterEach(() => {
    process.env.USER_POOL_ID = undefined;
    process.env.TABLE_NAME = undefined;
  });

  test('throw if not authorized', async () => {
    await expect(
      handler({
        identity: {
          groups: ['7d626751-4c09-448e-9a39-0970b0160396'],
        },
        arguments: {
          input: {
            name: 'Test group',
          },
        } as MutationCreateGroupArgs,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any),
    ).rejects.toThrowError('Not authorized');
  });

  test('resolve successfully', async () => {
    cognitoMock
      .on(CreateGroupCommand)
      .resolves({ Group: { GroupName: 'test group' } });

    const result = await handler({
      identity: {
        groups: ['admin'],
      },
      arguments: {
        input: {
          name: 'Test group',
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(cognitoMock).toHaveReceivedCommandWith(CreateGroupCommand, {
      Description: 'Test group',
      GroupName: matchUuuid,
    });

    expect(ddbDocMock).toHaveReceivedCommandWith(PutCommand, {
      Item: {
        id: matchUuuid,
        kind: 'group',
        name: 'Test group',
      },
      TableName: 'table',
    });

    expect(result).toEqual({
      name: 'Test group',
      id: matchUuuid,
    });
  });
});
