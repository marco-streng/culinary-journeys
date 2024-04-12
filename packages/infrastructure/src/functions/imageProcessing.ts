import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { AvailableFormatInfo, FormatEnum } from 'sharp';
import sharp = require('sharp');

const s3Client = new S3Client({});

const S3_ORIGINAL_IMAGE_BUCKET = process.env.originalImageBucketName;
const S3_TRANSFORMED_IMAGE_BUCKET = process.env.transformedImageBucketName;
const TRANSFORMED_IMAGE_CACHE_TTL = process.env.transformedImageCacheTTL;
const SECRET_KEY = process.env.secretKey;

type LambdaFunctionUrlEvent = {
  requestContext: {
    http: {
      method: string;
      path: string;
    };
  };
  headers: Record<string, unknown>;
};

type ProcessParapms = {
  width?: string;
  height?: string;
  format?: keyof FormatEnum | AvailableFormatInfo;
};

type ProcessConfig = {
  width?: number;
  height?: number;
  format?: keyof FormatEnum | AvailableFormatInfo;
};

export const handler = async (event: LambdaFunctionUrlEvent) => {
  if (
    !event.headers['x-origin-secret-header'] ||
    !(event.headers['x-origin-secret-header'] === SECRET_KEY)
  )
    return sendError(403, 'Request unauthorized');

  if (event.requestContext.http.method !== 'GET') {
    return sendError(400, 'Only GET method is supported');
  }

  const imagePathArray = event.requestContext.http.path?.split('/');
  const operationsPrefix = imagePathArray.pop();
  imagePathArray.shift();
  const originalImagePath = imagePathArray.join('/');

  let originalImage;
  let contentType;
  let bufferedTransformedImage: Buffer;

  const getOriginalImageCommand = new GetObjectCommand({
    Bucket: S3_ORIGINAL_IMAGE_BUCKET,
    Key: originalImagePath,
  });

  try {
    const result = await s3Client.send(getOriginalImageCommand);
    contentType = result.ContentType;
    originalImage = await result.Body?.transformToByteArray();
  } catch (error) {
    return sendError(500, 'error downloading original image');
  }

  let transformedImage = sharp(originalImage, {
    failOn: 'none',
    animated: true,
  });

  const imageMetadata = await transformedImage.metadata();
  const operationsJSON: ProcessParapms = Object.fromEntries(
    (operationsPrefix || '')
      .split(',')
      .map((operation) => operation.split('=')),
  );

  try {
    const resizingOptions: ProcessConfig = {
      ...(operationsJSON?.width && { width: parseInt(operationsJSON.width) }),
      ...(operationsJSON?.height && {
        height: parseInt(operationsJSON.height),
      }),
      ...(operationsJSON?.format && {
        format: operationsJSON.format,
      }),
    };

    transformedImage = transformedImage.resize(resizingOptions);

    if (imageMetadata.orientation) transformedImage = transformedImage.rotate();

    if (resizingOptions.format) {
      transformedImage = transformedImage.toFormat(resizingOptions.format);
    }

    bufferedTransformedImage = await transformedImage.toBuffer();
  } catch (error) {
    return sendError(500, 'error transforming image');
  }

  if (S3_TRANSFORMED_IMAGE_BUCKET) {
    const putTransformedImageCommand = new PutObjectCommand({
      Body: transformedImage,
      Bucket: S3_TRANSFORMED_IMAGE_BUCKET,
      Key: originalImagePath + '/' + operationsPrefix,
      ContentType: contentType,
      CacheControl: TRANSFORMED_IMAGE_CACHE_TTL,
    });

    try {
      await s3Client.send(putTransformedImageCommand);
    } catch (error) {
      sendError(
        'APPLICATION ERROR',
        'Could not upload transformed image to S3',
      );
    }
  }

  return {
    statusCode: 200,
    body: bufferedTransformedImage.toString('base64'),
    isBase64Encoded: true,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': TRANSFORMED_IMAGE_CACHE_TTL,
    },
  };
};

const sendError = (statusCode: number | string, body: string) => {
  return { statusCode, body };
};
