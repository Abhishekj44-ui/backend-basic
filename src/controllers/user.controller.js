import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save({validateBeforeSave: false});
    return { accessToken, refreshToken }  

  } catch (error) {
      throw new ApiError(500,"Something went wrong while generating access and refresh token");
  }
}


const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  //check if user already exist - username,email
  //check for images and avatar
  //upload images and avatar in cloudinary
  //create user object - create entry in db
  //remove password and refresh token field from res
  //check for user creation
  //return res

  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{email},{username}]
  });
  if(existedUser) {
    throw new ApiError(409,"User with same email or username already exists")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if(!avatarLocalPath) {
    throw new ApiError(400,"Avatar is required");
  }
  
  // console.log("FILES:", req.files);
  // console.log("Avatar Path:", avatarLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!avatar)  {
    throw new ApiError(400,"Avatarx` is required")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if(!createdUser) {
    throw new ApiError(500,"Something went wrong while registering user");
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered successfully")
  )

 
});


const loginUser = asyncHandler(async (req,res) => { 
   // req body => data
   //check username or email is valid
   //find the user
   //check password
   //access and refrersh token
   //send cookie

   const { email, username, password} = req.body;

   if(!email && !username) {
     throw new ApiError(400,"username or email is required");
   }

   const user = await User.findOne({
     $or: [{username},{email}]
   });
   if(!user) {
    throw new ApiError(404,"user doesn't exist");
   }

   const isPasswordValid = await user.isPasswordCorrect(password);
   if(!isPasswordValid) {
    throw new ApiError(401,"Invalid user credentials");
   }

   //generate access/refresh tokens
   const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id); 

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

   const options = { //by default cookies are modifiable by anyone but after using this 
      httpOnly: true, // only we can modify cookie
      secure: true
   };

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,accessToken,refreshToken
        },
        "User logged In successfully"
      )
   )




});

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined
        }
      },
      {
        new: true
      }
    );
            

    const options = { //by default cookies are modifiable by anyone but after using this 
      httpOnly: true, // only we can modify cookie
      secure: true
   };
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200, {}, "User logged Out successfully")) 
});

const refreshAccessToken = asyncHandler(async (req,res) => {
  
  //get user's refresh token
  const incomingRefreshToken = await req.cookies?.refreshToken || req.body?.refreshToken;
  if(!incomingRefreshToken) {
    throw new ApiError(401,"Unauthorized User")
  }

  try {
    const decodedToken =  jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    
    //find who is this user
    const user = await User.findById(decodedToken._id);
    if(!user) {
      throw new ApiError(401,"Unauthorized user")
    }

    if(user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401,"Refersh token expired or used");
    }

    //regenerate tokens for user
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user?._id);
    const options = {
      httpOnly: true,
      secure: true
    }
    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,refreshToken},
        "Access token refreshed"
      )
    )

    
  } catch (error) {
      return new ApiError(401, error.message || "Invalid Refresh Token")
  }
})


export {
   registerUser,
   loginUser,
   logoutUser
};
