import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { MutationCreateImagesArgs } from '../types/gql';
import { handler } from './createImages';

mockClient(DynamoDBClient);
const ddbDocMock = mockClient(DynamoDBDocumentClient);

const matchImageUuuid = expect.stringMatching(
  /^(image_)[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
);

describe('createImages', () => {
  beforeEach(() => {
    ddbDocMock.reset();
    process.env.TABLE_NAME = 'table';
  });

  afterEach(() => {
    process.env.TABLE_NAME = undefined;
  });

  test('resolve successfully', async () => {
    const result = await handler({
      arguments: {
        input: {
          fileNames: ['a.jpg', 'b.png'],
          id: '70848e90-3a6f-403a-9054-8e939ddfb3df',
        },
      } as MutationCreateImagesArgs,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(ddbDocMock).toHaveReceivedCommandWith(BatchWriteCommand, {
      RequestItems: {
        table: [
          {
            PutRequest: {
              Item: {
                fileName: 'a.jpg',
                id: '70848e90-3a6f-403a-9054-8e939ddfb3df',
                kind: matchImageUuuid,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                fileName: 'b.png',
                id: '70848e90-3a6f-403a-9054-8e939ddfb3df',
                kind: matchImageUuuid,
              },
            },
          },
        ],
      },
    });

    expect(result).toEqual(['a.jpg', 'b.png']);
  });
});
