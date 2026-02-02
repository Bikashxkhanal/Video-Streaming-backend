import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader
      .upload(localFilePath, {
        resource_type: "auto",
      })
      .catch((error) => {
        console.log(error);
        throw error;
      });

    fs.unlinkSync(localFilePath);
    console.log("File Upload ", uploadResult);
    return uploadResult.url;
  } catch (error) {
    fs.unlinkSync(localFilePath); // unlink the temporty file saved in local server when the upload fails
    console.log(error);
    return null;
  }
};

export { uploadOnCloudinary };
