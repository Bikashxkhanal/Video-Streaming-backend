import {
    getAllVideoComment, 
    addComment,
    removeComment,
}  from '../controllers/comment.controller.js';

import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';


const CommentRouter = new Router();

//all protected routes
CommentRouter.route('/getAllComments').get(verifyJWT, getAllVideoComment);
CommentRouter.route('/addComment').post(verifyJWT, addComment);
CommentRouter.route('/:commentId').delete(verifyJWT, removeComment);


export {CommentRouter};