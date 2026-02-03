import { Router } from "express";
import {
  getAllVideos,
  getVideoById,
  publishAVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const videoRouter = new Router();

//not protected as everybody should able to see the public videos
videoRouter.route("/videos").get(getAllVideos);

//proteced routes
//to publish a video a user must be logged in and the url should match the logged in username
videoRouter.route("/:username/publish-video").post(verifyJWT, publishAVideo);

//to watch a video a user must be logged in
videoRouter.route("/videos/:videoId").get(verifyJWT, getVideoById);

export { videoRouter };
