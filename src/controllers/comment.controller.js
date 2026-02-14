import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Comment } from "../models/comments.model";
import { UserModel } from "../models/user.model";

//add comment to the videos(post)
const addComment = asyncHandler(async (req, res) => {
    //get the comment for request body (must be submitted through a form)
    const { comment, videoId } = req.body;

    if (!comment?.trim() && !videoId) {
        throw new ApiError(400, "Invalid request Comment and videoId both required");
    }

    //a user can add multiple comment to same videos 
    const createdComment = Comment.create({
        owner: req?.user?._id,
        comment,
        video: videoId
    });

    if (!createdComment) {
        throw new ApiError(400, "Failed to add comment");
    }

    return res.status(200).json(
        new ApiResponse(200, createdComment, "Comment added successfully")
    )
})

//remove comments 
const removeComment = asyncHandler(async (req, res) => {
    //get the delete request from the params with videoId, and comment Id 
    // (but sinnce comment id is unique so video id is not possiblly required)
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400, "Invalid request comment id required");
    }

    //if commentid is provided then 
    const commentStatus = await Comment.findByIdAndDelete();
    if (!commentStatus) {
        throw new ApiError(400, "Comment not found!");
    }

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Comment deleted Successfully!")
        )


})


//get all the comments of an video

const getAllVideoComment = asyncHandler(async (req, res) => {
    //getting all comments of a video 
    //must provide a video id through query
    //match the videoId in comment documents 
    // fetch the match results in pagination

    const { videoId, page = 1, limit = 10 } = req.query;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid request videoid is required");
    }

    const skip = (parseInt(page) - 1) * 10;
    limit = parseInt(limit);



    //then paginate the result based on page and limits and ORDER BY the comments by latest date added
    const comments = Comment.pipeline([
        //1. get all the comments of the given videoId
        {
            $match: {
                video: Schema.Types.ObjectId(videoId)
            }
        },
        //2. join with the users to get username and avatar 
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "commentOwners",
                pipeline: [
                    //only get the required field from the users 
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }

                ]
            }

        },

        //3 : order by latest comments 
        {
            $sort: {
                created_at: -1,
            }
        },

        //4 : filter by page and limits 
        {
            $skip: skip,
        },

        {
            $limit: 10,
        }
    ]);

    if (!comments) {
        throw new ApiError(400, "Faild to get comments!");
    }

    return res.status(200).json(
        new ApiResponse(200, { comments }, "Comments retrived Successfully!")
    )


})


export {
    addComment,
    removeComment,
    getAllVideoComment
}

