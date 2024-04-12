import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { AppSyncResolverEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { MutationCreateImagesArgs } from '../types/gql';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: AppSyncResolverEvent<MutationCreateImagesArgs>,
) => {
  const { id, fileNames } = event.arguments.input;

  const items = fileNames.map((fileName) => ({
    PutRequest: {
      Item: {
        id,
        kind: `image_${uuidv4()}`,
        fileName,
      },
    },
  }));

  const command = new BatchWriteCommand({
    RequestItems: {
      [process.env.TABLE_NAME!]: items,
    },
  });

  await docClient.send(command);

  return fileNames;
};
