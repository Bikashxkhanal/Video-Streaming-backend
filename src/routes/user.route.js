import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserAvatar,
  updateAccountDetails,
  getCurrentUser,
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
  .put(verifyJWT, updateAccountDetails);

userRouter.route("/update-avatar").post(
  verifyJWT,
  upload.single({
    name: avatar,
    maxCount: 1,
  }),
  updateUserAvatar
);

export default userRouter;
