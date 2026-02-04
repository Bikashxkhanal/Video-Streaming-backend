import { Router } from "express";
import {
  deleteAVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  updateAVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const videoRouter = new Router();

//not protected as everybody should able to see the public videos
videoRouter.route("/videos").get(getAllVideos);

//proteced routes
//to publish a video a user must be logged in and the url should match the logged in username
videoRouter.route("/publish-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

//to watch a video a user must be logged in
videoRouter.route("/:Id").get(verifyJWT, getVideoById);

//to delete a video
videoRouter.route("/:Id").delete(verifyJWT, deleteAVideo);

//to update a video details
videoRouter.route("/:Id").patch(verifyJWT, updateAVideo);
export { videoRouter };
