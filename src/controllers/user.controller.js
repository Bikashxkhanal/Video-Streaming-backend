import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { UserModel } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.files.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    // console.log(user, "From access and refresh token");

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Cannot generate refresh and access token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validates the details
  //checks all required field are added or not
  //upload the image in cloudinary
  //get the url
  //create an user object
  //save the entry in db
  //check the entry
  //return the rrquired data, filtering the data that should not be send like (password,  refresh token ) etc

  //input from fronted
  const { fullName, username, email, password } = req.body;
  if (fullName === "") throw new ApiError(400, "Full name is required");

  //validation part
  if (
    [fullName, username, email, password]?.some((entry) => entry.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //check the user existance
  const existedUser = await UserModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImgLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath); //returns url
  const coverImage =
    coverImgLocalPath !== null
      ? await uploadOnCloudinary(coverImgLocalPath)
      : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await UserModel.create({
    fullName,
    username: username.toLowerCase(),
    avatar,
    email,
    password,
    coverImage: coverImage.url || "",
  });

  const createdUser = await UserModel.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //user data from fronted req-> body == data
  //username or email login
  //validates data
  //check the user existance in the db
  //if user exist check password
  //if valid , create an access token and refresh token ,
  //pass the access & refresh token with the user and save the refresh token in the db
  //send  cookies
  //grant login with response

  console.log(req.body);

  const { username, email, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await UserModel.findOne({
    $or: [{ email }, { username }],
  });
  console.log(user);

  if (!user) {
    throw new ApiError(404, "No user of such detail");
  }
  const status = await user.isPasswordCorrect(password);

  if (status === false) {
    throw new ApiError(401, "Invalid user credintials");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const loggedUser = await UserModel.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log(loggedUser);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User loggedin successfully!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await UserModel.findByIdAndUpdate(req.user?._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req?.cookies?.refreshToken || req?.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorised request");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decodedToken) {
    throw new ApiError(401, "Invalid request token");
  }

  const user = await UserModel.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid request token");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "refresh token is expired");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user?._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token generated successfully"
      )
    );
});

const changeCurrentpassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await UserModel.findById(req?.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userId: req?.user?._id },
        "User retrieved successfully"
      )
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields required");
  }

  const user = await UserModel.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req?.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar update failed");
  }

  const user = await UserModel.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: { avatar },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "UserName is missing");
  }
  // console.log(username);

  const channel = await UserModel.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subsriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subsriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },

    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);

  // console.log(channel);
  if (!channel?.length) {
    throw new ApiError(404, "No channel with such {watch history} username");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channel?.[0],
        "User channel data fetched successfully!"
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  console.log("Bikash");

  console.log(req.user || "Bikash");
  const { userName } = req.params;
  if (userName?.trim() === "") {
    throw new ApiError(400, "Username is missing");
  }

  if (userName !== req.user?._id) {
    throw new ApiError(404, "Page not found");
  }

  const user = await UserModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req?.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  console.log(user[0].watchHistory);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history retrived successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentpassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getUserChannelProfile,
  getWatchHistory,
};
