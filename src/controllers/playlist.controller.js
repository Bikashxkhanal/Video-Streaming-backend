import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Playlist } from "../models/playlist.model";


const create = asyncHandler(async (req, res) => {
    //create a playlist , name and discripition , and add some song duirng creation 
    //to create a playlist requirements : add some video during creation 
    //first : get videos list , with tille and discription 
    //get the user 
    //title shoud be unique for that user (so that we can retrieve the videos easily of that playlist using userid and title)

    const {name , discription, videos} = req.body;
    if(!name?.trim() || !discription?.trim()){
        throw new ApiError(400, "Both name and discriptions required");
    }

    const isPlayListNameExist = await Playlist.findOne({
        name,
        owner : req?.user?._id
    });

    if(isPlayListNameExist){
        throw new ApiError(400, "Playlist with this name already exist");
    }

   const validatedVideos =   videos?.filter((video) => mongoose.Types.ObjectId.isValid(video.trim()));

    const playlist =  await Playlist.create({
        name, 
        discription, 
        videos : validatedVideos,
        owner : req?.user?._id
    });
if(!playlist){
    throw new ApiError(500, "Failed to create playlist");
}

return res.status(200).json(
    new ApiResponse(
        200, 
        {}, 
        "Playlist created successfully!"
    )
)

});

const remove = asyncHandler(async (req, res) => {
    //delete the playlist 
    const {name} = req.query;
    
    const isplaylistExist = await Playlist.findOneAndDelete({
        owner : req?.user?._id,
        name
    });

    if(!isplaylistExist){
        throw new ApiError(400, "No playlist with this name");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "playlist deleted successfully!")
    )
});


const addVideoInAPlaylist = asyncHandler(async (req, res) => {
    //add a video in a playlist 
    const {name, videoId} = req.query;
    if(!name || !videoId){
        throw new ApiError(400, "Both video and title is required");
    }

    //check playlist exist or not 
    const isPlaylistExists =    await Playlist.findOne({
        name, 
        owner : req?.user?._id
    });

    if(!isPlaylistExists){
        throw new ApiError(401, "Playlist doesnot exist");
    }

   const updatedDocument =  await Playlist.findOneAndUpdate(
    //filter
    {
         name, 
        owner : req?.user?._id

    }, 
    {
        $addToSet : {
          videos : videoId
        }
    },

    {
        returnDocument : "after"
    }
)

return res.status(200).json(
    new ApiResponse(200, updatedDocument, "Video added to playlist successfully!")
)

});
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    //remove a video from a playlist
    const {name, videoId} = req.query;
    if(!name || !videoId){
        throw new ApiError(400, "Both video and playlist name is required");
    }

    //finding the videoId exist on that playlist of the user or not 
        const isVideoExistOnPlaylist =    await Playlist.findOneAndDelete({
        name, 
        owner : req?.user?._id,
        videos : videoId,
    })

    if(!isVideoExistOnPlaylist){
        throw new ApiError(401, "No such video on this playlist");
    }
    return res.status(200).json(
        new ApiResponse(200, {}, "Video removed from playlist successfully!")
    )
});



export {
    create, 
    remove, 
    addVideoInAPlaylist,
    removeVideoFromPlaylist
}
