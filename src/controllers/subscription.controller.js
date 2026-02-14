import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/apiError";
import { Subscription } from "../models/subscriptions.model";


const togglesubcription = asyncHandler(async (req, res) => {
    //user cliks on someone a/c to subscribe 
    //must get the subscribed user a/c from body and subscriber a/c -> from req.user
    const {subscribedId} = req.body;
    const {subscriberId} = req?.user?._id;

    //checking is the a/c already been subscribed, if exist delete the documenet 
 const isSubscriberDeleted = await Subscription.findOneAndDelete(
    //find by subscriber and channel 
    {
        subscriber : subscriberId, 
        channel : subscribedId, 
    } )
//if not subscribed add a document of subcription
   if(!isSubscriberDeleted){
  const subscriptionStatus =   await Subscription.create({
        subscriber : subscriberId, 
        channel : subscribedId
    })
    console.log(subscriptionStatus);
   }
console.log(isSubscriberDeleted);

   return res.status(200).json(
    new ApiResponse(200, {}, "Subscription status changed successfully" )
   )

})

const getAllSubscribedChannel = asyncHandler(async (req, res) => {
    //get all the channel you have subscribed 
    //steps....
    //get the current user 
    
    const userId = req?.user?._id;

    //agreegation pipeline to filter out the channels being subcribed , and its name, username , and avatar

    const subscribedChannels =await Subscription.pipeline([

        //first match the userId with subscriber 
        {
            $match : {
                subscriber : userId
            }
        }, 
        // this gives all the documents which has the logged in user as subscriber 
        //get the channel information for each channels , avatar, username and Full Name

        {
            //this will gives the channel inforation
            $lookup : {
                from : "users",
                localField : "channel",
                foreignField : "_id", 
                as : "ChannelInfo"
            }
        }, 
        {
            $unwind : "$ChannelInfo"
        }, 
        // fields added
        {
            $addFields : {
                channelFullName : "$ChannelInfo.fullName", 
                channelUsername : "$ChannelInfo.username",
                channelAvatar : "ChannelInfo.avatar",
            }
        },

        //only extract required fields 
        {
            $project : {
                channelFullName : 1, 
                channelUsername : 1, 
                channelAvatar : 1, 

            }
        }
    ])


    return res.status(200).json(
        new ApiResponse(200, subscribedChannels, "Subcribed channel retrieved successfully!")
    )


});

const isChannelSubscribed = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!channelId?.trim()){
        throw new ApiError(400, "Channel is required");
    }

    const channelStatus = await Subscription.find({
        subscriber : req?.user?._id,
        channel : channelId,
    });

    const status =  channelStatus ? {status : "1"} : {status : "0"};


    return res.status(200).json(
        new ApiResponse(
            200, status,  "Status retrieved Successfully"
        )
    )
});

export {
    togglesubcription, 
    getAllSubscribedChannel, 
    isChannelSubscribed
}
