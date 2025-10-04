import * as Minio from 'minio';
import type internal from 'stream';

// Create a new Minio client with the S3 endpoint, access key, and secret key
export const s3Client = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT || 'localhost',
  port: process.env.S3_PORT ? Number(process.env.S3_PORT) : 9090,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
  useSSL: process.env.S3_USE_SSL === 'true',
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'media';

export async function createBucketIfNotExists(bucketName: string) {
  const bucketExists = await s3Client.bucketExists(bucketName);
  if (!bucketExists) {
    console.log('Creating bucket', bucketName);
    await s3Client.makeBucket(bucketName);
    console.log('Bucket created', bucketName);
  }
}

export async function saveFileInBucket({
  bucketName,
  fileName,
  file,
}: {
  bucketName: string;
  fileName: string;
  file: Buffer | internal.Readable;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName);

  // check if file exists
  const fileExists = await checkFileExistsInBucket({
    bucketName,
    fileName,
  });

  if (fileExists) {
    throw new Error('File already exists');
  }

  // Upload image to S3 bucket
  await s3Client.putObject(bucketName, fileName, file);
}

export async function checkFileExistsInBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  try {
    await s3Client.statObject(bucketName, fileName);
  } catch {
    return false;
  }
  return true;
}

export async function getFileFromBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  try {
    await s3Client.statObject(bucketName, fileName);
  } catch (error) {
    console.error('Error getting file from bucket:', error);
    return null;
  }
  return await s3Client.getObject(bucketName, fileName);
}

export async function deleteFileFromBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  try {
    await s3Client.removeObject(bucketName, fileName);
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
}

export async function createPresignedUrlToUpload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string;
  fileName: string;
  expiry?: number;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName);

  return await s3Client.presignedPutObject(bucketName, fileName, expiry);
}

export async function createPresignedUrlToDownload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string;
  fileName: string;
  expiry?: number;
}) {
  return await s3Client.presignedGetObject(bucketName, fileName, expiry);
}

export async function listFilesInBookstoreFolder({
  bucketName,
  bookstoreSlug,
}: {
  bucketName: string;
  bookstoreSlug: string;
}) {
  try {
    const objectsList: string[] = [];
    const objectsStream = s3Client.listObjects(
      bucketName,
      bookstoreSlug + '/',
      true
    );

    return new Promise<string[]>((resolve, reject) => {
      objectsStream.on('data', (obj) => {
        if (obj.name) {
          objectsList.push(obj.name);
        }
      });

      objectsStream.on('end', () => {
        resolve(objectsList);
      });

      objectsStream.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

export async function getBookstoreImageUrl({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string;
  fileName: string;
  expiry?: number;
}) {
  return await createPresignedUrlToDownload({
    bucketName,
    fileName,
    expiry,
  });
}
