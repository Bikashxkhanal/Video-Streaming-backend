import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { UserModel } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.files.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  const existedUser = UserModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }

  const avatarLocalPath = req?.files.avatar[0]?.path;
  const coverImgLocalPath = req?.files.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath); //returns url
  if (coverImgLocalPath) {
    const coverImage = await uploadOnCloudinary(coverImgLocalPath);
  }

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await UserModel.create({
    fullName,
    username: username.toLowerCase(),
    avatar,
    email,
    password,
    coverImage: coverImage || "",
  });

  if (!user._id) {
    throw new ApiError(400, "Faild to register. Please try again!");
  }

  console.log(user);
  return res
    .status(201)
    .json(new ApiResponse(200, user, "User created successfully"));
});

export { registerUser };
