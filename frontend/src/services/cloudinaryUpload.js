import { cloudinary_url } from '../config';

/**
 * Uploads an image file to the backend which then uploads to Cloudinary.
 * @param {File} file - The image file to upload.
 * @returns {Promise<Object>} - Resolves to { filename, cloudinary_url } on success.
 */
// Accepts FormData directly (already constructed in frontend)
export async function uploadImageToCloudinary(formData) {
  // Endpoint for backend to handle file upload to Cloudinary
  const endpoint = `${cloudinary_url}/generate-image-file`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Image upload failed');
  }

  return response;
}

/**
 * Calls the backend endpoint to generate an image from a sketch (image URL),
 * and returns the Cloudinary URL of the generated image.
 * @param {string} imageUrl - The URL of the sketch image to send.
 * @returns {Promise<string>} - Resolves to the Cloudinary URL of the generated image.
 */
export async function generateImageFromSketch(imageUrl) {
  const endpoint = `${cloudinary_url}/generate-image`;
  const body = JSON.stringify({ image_url: imageUrl });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Image generation failed');
  }

  const result = await response.json();
  return result.cloudinary_url;
}



