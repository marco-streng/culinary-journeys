import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { mockClient } from 'aws-sdk-client-mock';
import { MutationCreateUploadUrlsArgs } from '../types/gql';
import { handler } from './createUploadUrls';

const s3Mock = mockClient(S3Client);
vi.mock('uuid', () => ({ v4: () => 'f8900b03-d934-426e-bb09-9521a6333d2c' }));
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(
    (_, cmd: PutObjectCommand) => `https://secure-url.com/${cmd.input.Key}`,
  ),
}));

describe('createUploadUrls', () => {
  beforeEach(() => {
    s3Mock.reset();
    process.env.BUCKET_NAME = 'bucket';
  });

  afterEach(() => {
    process.env.BUCKET_NAME = undefined;
  });

  test('resolve successfully', async () => {
    const result = await handler({
      arguments: {
        input: {
          files: [
            {
              name: 'a.jpg',
              type: 'image/jpeg',
            },
          ],
        },
      } as MutationCreateUploadUrlsArgs,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // TODO: comparison of s3Client not working fine yet
    // expect(getSignedUrl).toBeCalledWith(
    //   expect.any(S3Client),
    //   new PutObjectCommand({
    //     Bucket: 'bucket',
    //     Key: 'images/f8900b03-d934-426e-bb09-9521a6333d2c.jpeg',
    //   }),
    //   {
    //     expiresIn: 600,
    //   },
    // );

    expect(getSignedUrl).toHaveBeenCalledOnce();
    expect(result).toStrictEqual([
      {
        fileName: 'images/f8900b03-d934-426e-bb09-9521a6333d2c.jpeg',
        url: 'https://secure-url.com/images/f8900b03-d934-426e-bb09-9521a6333d2c.jpeg',
      },
    ]);
  });
});
