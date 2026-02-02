import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserAvatar,
  updateAccountDetails,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  changeCurrentpassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(loginUser);

//protected routes

userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/refresh-token").post(refreshAccessToken);

userRouter.route("/current-user").get(verifyJWT, getCurrentUser);

userRouter
  .route("/update-account-details")
  .patch(verifyJWT, updateAccountDetails);

userRouter
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

userRouter.route("/change-password").post(verifyJWT, changeCurrentpassword);

userRouter.route("/").post(verifyJWT, getUserChannelProfile);
userRouter.route("/").post(verifyJWT, getWatchHistory);

export default userRouter;
