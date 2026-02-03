import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { isNumberObject } from "util/types";
import mongoose from "mongoose";
import { pipeline } from "stream";
import { uploadOnCloudinary } from "../utils/Cloudinary.files.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "asc",
    userId,
  } = req.query;
  //get Videos first, if userId is given then filter of that vidoes only
  //sort by query find words similar to query in title and discription of videos (backend, fronted) , sortBy apply like (video type ) and sortType either asc, desc, date,

  const pipeline = [];

  //first pipeLine to filter the vides if the userId is given(if userId is there filter videos and pass the videso of that uesr only based on that, if not pass all the videos to next stage)
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid userid");
    }
  }
  pipeline.push({
    $match: {
      $expr: {
        $or: [
          {
            $eq: [userId, null],
          },
          {
            $eq: ["owner", userId],
          },
        ],
      },
    },
  });
  // TODO: $match and $text are not accepted in second pipeline, need to rethink about this
  // if (query?.trim() !== "") {
  //   //second pipeline sorting by query on title or discripiont
  //   pipeline.push({
  //     $match: {
  //       $text: {
  //         $search: query,
  //       },
  //     },
  //   });
  // }

  if (sortBy?.trim() !== "") {
    //third pipeline sorting by sortBy and using the direction on
    const sortDirection = sortType === "asc" || "" ? 1 : -1;
    pipeline.push({
      $sort: {
        sortBy: sortDirection,
        _id: sortDirection,
      },
    });
  }

  const startPoint = (Number(page) - 1) * 10;

  pipeline.push(
    {
      $skip: startPoint,
    },
    {
      $limit: Number(limit),
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        discription: 1,
      },
    }
  );

  const allVideos = await Video.aggregate(pipeline);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        meta: {
          page,
          limit,
          query,
          sortBy,
          sortType,
        },
        data: allVideos,
      },
      "All videos are retrieved!"
    )
  );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video Id is needed");
  }
  if (videoId?.trim() === "") {
    throw new ApiError(400, "Video Id is needed");
  }

  if (!mongoose.Types.ObjectId(videoId)) {
    throw new ApiError(400, "Video Id is invalid");
  }
  const video = await video.pipeline([
    //match the vides from the given Id
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },

    //lookup for the owner of the video
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "videoOwner",
        pipeline: [
          {
            $project: {
              avatar: 1,
              username: 1,
              fullName: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },

    {
      $addField: {
        $first: "$videoOwner",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video retrieved Successfully!"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, discription } = req.body;
  //get detail about video from form
  //upload thumbnail and video handles by multer
  //get cloudinary url of thumbnail and video
  //get userId from req.user

  //get details ,
  //upload on cloudingary image and video ,
  // get urls
  //validates all things
  //create a video object
  //add on db

  if (title?.trim() === "" || discription?.trim() === "") {
    throw new ApiError(400, "Title and discription are required");
  }

  //get video and thumbnail from the server
  const thumbnailLoalPath = req.files?.thumbnail?.[0]?.path;
  const videoLocalPath = req.files?.video?.[0]?.path;

  if (!thumbnailLoalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  if (!videoLocalPath) {
    throw new ApiError(400, "Video is required");
  }

  //upload on cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailLoalPath);
  const video = await uploadOnCloudinary(videoLocalPath);

  if (!thumbnail && !video) {
    throw new ApiError(500, "Error uploading thumbnail and videos");
  }

  await Video.create({
    owner: user._id,
    thumbnail: thumbnail.url,
    videoFile: video.url,
    title,
    discription,
    duration: video.duration,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Video uploaded successfully!"));
});

const updateVideo = asyncHandler(async (req, res) => {});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (videoId?.trim() === "") {
    throw new ApiError(400, "Invalid video Id");
  }

  const videoStatus = await Video.findByIDAndDelete(videoId);
  if (!videoStatus) {
    throw new ApiError(400, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully!"));
});

export { getAllVideos, getVideoById, publishAVideo, updateVideo, deleteVideo };
