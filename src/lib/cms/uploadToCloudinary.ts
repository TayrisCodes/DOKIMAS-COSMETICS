import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Upload image to Cloudinary
 * @param base64OrFilePath - Base64 encoded image or file path
 * @param opts - Cloudinary upload options
 * @returns Secure URL of uploaded image
 */
export async function uploadImage(
  base64OrFilePath: string,
  opts: Record<string, any> = {}
): Promise<string> {
  try {
    const result = await cloudinary.v2.uploader.upload(base64OrFilePath, {
      folder: "dokimas-cms",
      ...opts,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
}


