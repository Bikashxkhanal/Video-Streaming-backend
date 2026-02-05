import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Like } from "../models/likes.model.js";
import { Video } from "../models/video.model.js";
import { UserModel } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

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
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (commentId?.trim() === "") {
    throw new ApiError(400, "Invalid comment");
  }

  const commentStatus = await Comment.findById(commentId);

  if (!commentStatus) {
    throw new ApiError(400, "Comment doesnot exist with such id");
  }

  //if the comment exist then check where the likes exist on that comment or not
  const likeStatus = await Like.findOneAndDelete({
    comment: commentId,
  });

  //if the document is not fould , returns NULL so add the like to comment
  if (!likeStatus) {
    await Like.create({
      comment: commentId,
      likedBy: req?.user?._id,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment like status changed!"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (tweetId?.trim() === "") {
    throw new ApiError(400, "Invalid tweet Id");
  }

  //check wether the tweet exist or not
  const tweetStatus = await Tweet.findById(tweetId);
  if (!tweetStatus) {
    throw new ApiError(400, "Invalid tweet Id");
  }

  //check if the tweetlike exist then delete if not , addd new like to tweet
  const tweetLikeStatus = await Tweet.findOneAndDelete({
    tweet: tweetId,
  });
  if (!tweetLikeStatus) {
    await Tweet.create({
      tweet: tweetId,
      likedBy: req?.user?._id,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet Like changed successfully!"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //get all the liked videos of the current user
  //get the user
  //check how many videos exist the user has liked,
  //lookup the vides and add the video details
  //look up to creator who added the video and add the crator necessary information
  //list of video document which has video details and the crator details

  const userId = mongoose.Types.ObjectId.isValid(req?.user?._id)
    ? new mongoose.Types.ObjectId(req?.user?._id)
    : null;

  if (!userId) {
    throw new ApiError(400, "Not logged In");
  }

  const likedVideos = await Like.pipeline([
    //filter the user likes by the user and the only liked videos
    {
      $match: {
        likedBy: userId,
        tweet: null,
        comment: null,
      },
      $project: {
        likedBy: 1,
        video: 1,
      },
    },

    //recives only liked videos by the usser

    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "LikesVideos",
        pipeline: [
          //get the user details of each videos
          {
            $project: {
              title: 1,
              discription: 1,
              avatar: 1,
              videoFile: 1,
              duration: 1,
              owner: 1,
            },
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "videoOwnerDetails",
              pipeline: [
                {
                  $addFields: {
                    ownerDetails: {
                      $first: "$videoOwnerDetails",
                    },
                  },
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },

            $,
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully!")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
