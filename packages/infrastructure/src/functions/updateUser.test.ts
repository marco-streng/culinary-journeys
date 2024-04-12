import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { MutationUpdateUserArgs } from '../types/gql';
import { handler } from './updateUser';

const cognitoMock = mockClient(CognitoIdentityProviderClient);
mockClient(DynamoDBClient);
const ddbDocMock = mockClient(DynamoDBDocumentClient);

describe('updateUser', () => {
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
      handler(
        {
          identity: {
            groups: ['7d626751-4c09-448e-9a39-0970b0160396'],
          },
          arguments: {
            input: {
              id: 'decaef00-9f80-41b2-a7c8-8f9f88a12ab8',
              addGroupIds: ['a42de485-d4d2-45df-b2f6-b4c32dec7422'],
            },
          } as MutationUpdateUserArgs,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        {} as never,
      ),
    ).rejects.toThrowError('Not authorized');
  });

  test('resolve successfully', async () => {
    ddbDocMock.on(GetCommand).resolves({
      Item: {
        name: 'lorem ipsum',
        groupIds: ['f150e6d1-5cb9-470c-91d3-b07297f9382a'],
      },
    });

    ddbDocMock.on(UpdateCommand).resolves({
      Attributes: {
        groupIds: [
          'f150e6d1-5cb9-470c-91d3-b07297f9382a',
          'a42de485-d4d2-45df-b2f6-b4c32dec7422',
        ],
      },
    });

    const result = await handler(
      {
        identity: {
          groups: ['admin'],
        },
        arguments: {
          input: {
            id: 'decaef00-9f80-41b2-a7c8-8f9f88a12ab8',
            addGroupIds: ['a42de485-d4d2-45df-b2f6-b4c32dec7422'],
          },
        } as MutationUpdateUserArgs,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      {} as never,
    );

    expect(ddbDocMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: 'table',
      Key: {
        id: 'decaef00-9f80-41b2-a7c8-8f9f88a12ab8',
        kind: 'user',
      },
    });

    expect(cognitoMock).toHaveReceivedCommandWith(AdminAddUserToGroupCommand, {
      UserPoolId: 'eu-central-1_xxxxxxxxx',
      GroupName: 'a42de485-d4d2-45df-b2f6-b4c32dec7422',
      Username: 'lorem ipsum',
    });

    expect(ddbDocMock).toHaveReceivedCommandWith(UpdateCommand, {
      Key: {
        id: 'decaef00-9f80-41b2-a7c8-8f9f88a12ab8',
        kind: 'user',
      },
      TableName: 'table',
      ExpressionAttributeValues: {
        ':addGroupIds': ['a42de485-d4d2-45df-b2f6-b4c32dec7422'],
        ':empty_list': [],
      },
    });

    expect(result).toEqual({
      groupIds: [
        'f150e6d1-5cb9-470c-91d3-b07297f9382a',
        'a42de485-d4d2-45df-b2f6-b4c32dec7422',
      ],
      name: 'lorem ipsum',
    });
  });
});
