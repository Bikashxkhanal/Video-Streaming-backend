import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },

    //comment owner not video owner
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export { Comment };
