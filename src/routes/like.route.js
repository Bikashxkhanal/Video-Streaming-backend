import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller";
import { verify } from "jsonwebtoken";

const LikeRouter = Router();

LikeRouter.route("/toggle-comment-like").patch(verifyJWT, toggleCommentLike);
LikeRouter.route("/toggle-tweet-like").patch(verifyJWT, toggleTweetLike);
LikeRouter.route("/toggle-video-like").patch(verifyJWT, toggleVideoLike);

LikeRouter.route("/liked-videos").get(verifyJWT, getLikedVideos);

export { LikeRouter };
