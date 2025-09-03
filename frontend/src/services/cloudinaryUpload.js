import { cloudinary_url } from '../config';

/**
 * Calls the backend endpoint to generate an image from a sketch (file),
 * and returns the Cloudinary URL of the generated image.
 * 
 * @param {File} file - The image file (sketch) to upload and process.
 * @returns {Promise<string>} - Resolves to the Cloudinary URL of the generated image.
 */
export async function generateImageFromSketch(formData) {
  const endpoint = `${cloudinary_url}/generate-image`;

  // Send file as FormData
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Image generation failed');
  }

  const result = await response.json();
  return result.cloudinary_url; // only final Cloudinary URL
}
