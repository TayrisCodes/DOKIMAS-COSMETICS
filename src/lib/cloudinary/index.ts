import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!,
});

export default cloudinary;

// Helper function to upload image
export async function uploadImage(
  file: File | Buffer,
  folder: string = "dokimas-products"
): Promise<{ url: string; public_id: string }> {
  try {
    const result = await cloudinary.uploader.upload(file as any, {
      folder,
      resource_type: "auto",
      quality: "auto",
      fetch_format: "auto",
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
}

// Helper function to delete image
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image");
  }
}

// Helper function to extract public_id from URL
export function extractPublicId(url: string): string | null {
  const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/);
  return match ? match[1] : null;
}