/**
 * Azure Blob Storage integration for post image uploads.
 * 
 * Requires environment variables:
 * - AZURE_STORAGE_CONNECTION_STRING
 * - AZURE_STORAGE_CONTAINER_NAME (defaults to 'post-images')
 * 
 * Install: npm install @azure/storage-blob
 */

import { BlobServiceClient } from '@azure/storage-blob';

const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'post-images';

/**
 * Uploads a base64-encoded image to Azure Blob Storage and returns the public URL.
 * 
 * @param base64Image - Base64-encoded image string (with or without data URI prefix)
 * @returns Public URL of the uploaded image
 * @throws Error if upload fails
 */
export async function uploadImageToAzure(base64Image: string): Promise<string> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is not set');
  }

  try {
    // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,...")
    const base64Data = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    // Decode base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = 'jpg'; // Default extension, could be determined from MIME type
    const blobName = `post-${timestamp}-${random}.${extension}`;

    // Initialize BlobServiceClient
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    // Ensure container exists
    await containerClient.createIfNotExists({
      access: 'blob', // Public read access
    });

    // Upload blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(imageBuffer, imageBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: 'image/jpeg',
      },
    });

    // Return public URL
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading image to Azure Blob Storage:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uploads multiple images and returns their URLs.
 * 
 * @param base64Images - Array of base64-encoded image strings
 * @returns Array of public URLs in the same order
 */
export async function uploadImagesToAzure(base64Images: string[]): Promise<string[]> {
  const uploadPromises = base64Images.map(img => uploadImageToAzure(img));
  return Promise.all(uploadPromises);
}
