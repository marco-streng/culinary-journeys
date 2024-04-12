import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppSyncResolverEvent } from 'aws-lambda';
import { extension } from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { MutationCreateUploadUrlsArgs } from '../types/gql';

const client = new S3Client({});

export const handler = async (
  event: AppSyncResolverEvent<MutationCreateUploadUrlsArgs>,
) => {
  const keys = event.arguments.input.files.map(
    (file) => `images/${uuidv4()}.${extension(file.type)}`,
  );

  const commands = keys.map(async (key) => {
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(client, command, { expiresIn: 600 });
  });

  const urls = await Promise.all(commands);

  return urls.map((url, index) => ({
    fileName: keys[index],
    url,
  }));
};
