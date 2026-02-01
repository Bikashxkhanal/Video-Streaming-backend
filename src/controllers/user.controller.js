import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { UserModel } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.files.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
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

  let user = await UserModel.create({
    fullName,
    username: username.toLowerCase(),
    avatar,
    email,
    password,
    coverImage: coverImage || "",
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

  const { email, username, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = UserModel.findOne({
    $or: [{ email }, { username }],
  });

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

  const loggedUser = UserModel.findById(user._id).select(
    "-password -refreshToken "
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

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
export { registerUser, loginUser };
