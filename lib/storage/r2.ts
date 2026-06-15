import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadImage(key: string, buffer: Buffer, contentType: string): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function deleteImage(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  }));
}

export interface R2Image {
  key: string;
  url: string;
  size: number;
  lastModified: Date;
}

export async function listImages(prefix?: string): Promise<R2Image[]> {
  const images: R2Image[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await r2.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));

    for (const obj of response.Contents ?? []) {
      if (!obj.Key) continue;
      images.push({
        key: obj.Key,
        url: `${process.env.R2_PUBLIC_URL}/${obj.Key}`,
        size: obj.Size ?? 0,
        lastModified: obj.LastModified ?? new Date(),
      });
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return images;
}
