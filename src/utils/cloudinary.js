import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError";

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
}) 


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null; 
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type: "auto"
            }
        )
        //file uploaded successfully
        console.log("file uploaded successfully on cloudinary ",(await response).url);
        
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);//remove locally saved temporary file as upload operation got failed 
        return null;
    }
}

const deleteFromcloudinary = async(publicId) => {
    try {
        if(!publicId) {
            return null;
        }
        const res = await cloudinary.uploader.destroy(publicId);
        return res;
        
    } catch (error) {
        console.log("cloudinary delete error: ",error);
        return null;
    }
}
export {uploadOnCloudinary, deleteFromcloudinary}