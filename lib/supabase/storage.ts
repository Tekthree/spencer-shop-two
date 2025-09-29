import { supabase } from '@/lib/supabase/client';

export interface StorageImage {
  id: string;
  name: string;
  bucket: string;
  path: string;
  url: string;
  metadata: {
    size: number;
    mimetype: string;
    width?: number;
    height?: number;
  };
  created_at: string;
}

interface ListOptions {
  path?: string;
  pageSize?: number;
}

/**
 * Recursively list all files for the provided bucket, returning fully qualified paths.
 */
export async function listBucketImages(
  bucket: string,
  { path = '', pageSize = 100 }: ListOptions = {}
): Promise<StorageImage[]> {
  const files: StorageImage[] = [];
  const foldersToVisit: string[] = [path];

  while (foldersToVisit.length > 0) {
    const currentPath = foldersToVisit.pop() ?? '';
    let offset = 0;

    // Supabase requires undefined instead of empty string for root listings
    const listPath = currentPath.length > 0 ? currentPath : undefined;

    // Paginate through files within the current folder
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(listPath, {
          limit: pageSize,
          offset,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        break;
      }

      const prefix = currentPath ? `${currentPath}/` : '';

      // Files include metadata, folders do not. Filter accordingly.
      const fileEntries = data.filter((item) => item.metadata && item.metadata.size !== null);
      const folderEntries = data.filter((item) => !item.metadata || item.metadata.size === null);

      for (const item of fileEntries) {
        const fullPath = `${prefix}${item.name}`;
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fullPath);

        files.push({
          id: `${bucket}/${fullPath}`,
          name: item.name,
          bucket,
          path: fullPath,
          url: publicUrlData.publicUrl,
          metadata: {
            size: Number(item.metadata?.size ?? 0),
            mimetype: item.metadata?.mimetype ?? 'unknown',
            width: item.metadata?.width ?? undefined,
            height: item.metadata?.height ?? undefined,
          },
          created_at: item.created_at ?? item.updated_at ?? new Date().toISOString(),
        });
      }

      for (const folder of folderEntries) {
        const folderPath = `${prefix}${folder.name}`;
        foldersToVisit.push(folderPath);
      }

      hasMore = data.length === pageSize;

      if (hasMore) {
        offset += pageSize;
      }
    }
  }

  return files;
}

export interface FetchBucketsResult {
  images: StorageImage[];
  errors: { bucket: string; error: Error }[];
}

/**
 * Fetch images for all provided buckets.
 */
export async function fetchImagesFromBuckets(buckets: string[]): Promise<FetchBucketsResult> {
  const images: StorageImage[] = [];
  const errors: { bucket: string; error: Error }[] = [];

  for (const bucket of buckets) {
    try {
      const bucketImages = await listBucketImages(bucket);
      images.push(...bucketImages);
    } catch (err) {
      errors.push({
        bucket,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  return { images, errors };
}
