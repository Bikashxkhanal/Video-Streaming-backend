import {verifyJWT} from '../middlewares/auth.middleware.js'
import {
    create,
     remove, 
     addVideoInAPlaylist,
     removeVideoFromPlaylist

} from '../controllers/playlist.controller.js';

import { Router } from 'express';

const PlaylistRouter = new Router();

PlaylistRouter.route().post();

export {
    PlaylistRouter
}