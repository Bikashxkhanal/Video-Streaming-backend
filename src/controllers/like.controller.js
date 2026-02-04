import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Like } from "../models/likes.model.js";
import { Video } from "../models/video.model.js";
import { UserModel } from "../models/user.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //check the video exist or not
  //check if the user exist there or not in likedBy
  //if not exist , add a like
  //if exist then removes the like from the like document

  if (videoId?.trim() === "") {
    throw new ApiError(400, "No video ");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  //checking the db
  const videoStatus = await Video.findById(videoId);
  if (!videoStatus) {
    throw new ApiError(400, "Invalid reqest, no video of such ID");
  }

  //if video exist then do the user exist in the like document for that video
  const userStatus = await Like.findOne({
    likedBy: req?.user?._id,
  });

  if (!userStatus) {
    const likedStatus = await Like.create({
      video: videoId,
      likeBy: req?.user?._id,
    });
    if (!likedStatus) {
      throw new ApiError(500, "Failed to add like");
    }
  }
  const unlikeStatus = await Like.findOneAndDelete({
    likedBy: req?.user?._id,
  });

  if (!unlikeStatus) {
    throw new ApiError(500, "Failed to remove like");
  }

  return res
    .staus(200)
    .json(new ApiResponse(200, {}, "VideoLike Toggle successfull!"));
});
const toggleCommentLike = asyncHandler(async (req, res) => {});

const toggleTweetLike = asyncHandler(async (req, res) => {});
const getLikedVideos = asyncHandler(async (req, res) => {});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
