import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse";
import { Video } from "../models/video.model.js";
import { isNumberObject } from "util/types";
import mongoose from "mongoose";

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

  if (userId?.trim() !== "") {
    //first pipeLine to filter the vides if the userId is given(if userId is there filter videos and pass the videso of that uesr only based on that, if not pass all the videos to next stage)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid userid");
      return;
    }
    pipeline.push({
      $match: {
        $expr: {
          $or: [
            {
              $eq: [userId, null],
            },
            {
              $eq: ["owner", new mongoose.Types.ObjectId(userId)],
            },
          ],
        },
      },
    });
  }

  if (query?.trim() !== "") {
    //second pipeline sorting by query on title or discripiont
    pipeline.push({
      $match: {
        $text: {
          $search: query,
        },
      },
    });
  }

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
  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "All videos are retrieved!"));
});

const getVideoById = asyncHandler(async (req, res) => {});

const publishAVideo = asyncHandler(async (req, res) => {});

const updateVideo = asyncHandler(async (req, res) => {});

const deleteVideo = asyncHandler(async (req, res) => {});

export { getAllVideos, getAVideo };
