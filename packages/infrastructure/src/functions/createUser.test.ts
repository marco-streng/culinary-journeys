import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { MutationCreateUserArgs } from '../types/gql';
import { handler } from './createUser';

const cognitoMock = mockClient(CognitoIdentityProviderClient);
mockClient(DynamoDBClient);
const ddbDocMock = mockClient(DynamoDBDocumentClient);

describe('createUser', () => {
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
            email: 'lorem@ipsum.com',
            groupIds: [
              '89db32cf-6673-4682-abe6-d8eba62f6246',
              '5f6b4e5a-892f-4a6a-b7e7-ba083e42724d',
            ],
            name: 'lorem ipsum',
          },
        } as MutationCreateUserArgs,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any),
    ).rejects.toThrowError('Not authorized');
  });

  test('resolve successfully', async () => {
    cognitoMock.on(AdminCreateUserCommand).resolves({
      User: {
        Username: 'lorem ipsum',
        Attributes: [
          { Name: 'sub', Value: '2fe0f64f-1541-475e-9ce8-f81e4459ba54' },
        ],
      },
    });

    const result = await handler({
      identity: {
        groups: ['admin'],
      },
      arguments: {
        input: {
          email: 'lorem@ipsum.com',
          groupIds: [
            '89db32cf-6673-4682-abe6-d8eba62f6246',
            '5f6b4e5a-892f-4a6a-b7e7-ba083e42724d',
          ],
          name: 'lorem ipsum',
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(cognitoMock).toHaveReceivedCommandWith(AdminCreateUserCommand, {
      Username: 'lorem ipsum',
      UserPoolId: 'eu-central-1_xxxxxxxxx',
      UserAttributes: [
        { Name: 'email', Value: 'lorem@ipsum.com' },
        { Name: 'email_verified', Value: 'true' },
      ],
    });

    expect(cognitoMock).toHaveReceivedCommandWith(AdminAddUserToGroupCommand, {
      Username: 'lorem ipsum',
      GroupName: '89db32cf-6673-4682-abe6-d8eba62f6246',
      UserPoolId: 'eu-central-1_xxxxxxxxx',
    });

    expect(cognitoMock).toHaveReceivedCommandWith(AdminAddUserToGroupCommand, {
      Username: 'lorem ipsum',
      GroupName: '5f6b4e5a-892f-4a6a-b7e7-ba083e42724d',
      UserPoolId: 'eu-central-1_xxxxxxxxx',
    });

    expect(ddbDocMock).toHaveReceivedCommandWith(PutCommand, {
      Item: {
        email: 'lorem@ipsum.com',
        groupIds: [
          '89db32cf-6673-4682-abe6-d8eba62f6246',
          '5f6b4e5a-892f-4a6a-b7e7-ba083e42724d',
        ],
        id: '2fe0f64f-1541-475e-9ce8-f81e4459ba54',
        kind: 'user',
        name: 'lorem ipsum',
      },
      TableName: 'table',
    });

    expect(result).toEqual({
      email: 'lorem@ipsum.com',
      groupIds: [
        '89db32cf-6673-4682-abe6-d8eba62f6246',
        '5f6b4e5a-892f-4a6a-b7e7-ba083e42724d',
      ],
      id: '2fe0f64f-1541-475e-9ce8-f81e4459ba54',
      name: 'lorem ipsum',
    });
  });
});
