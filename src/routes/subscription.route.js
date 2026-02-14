import {
    getAllSubscribedChannel, 
    isChannelSubscribed, 
    togglesubcription,
} from '../controllers/subscription.controller.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'

import { Router } from 'express'

const subscriptionRouter = new Router();

subscriptionRouter.route("/all").get(verifyJWT, getAllSubscribedChannel );
subscriptionRouter.route("/:id").get(verifyJWT, isChannelSubscribed);
subscriptionRouter.route("/subscribe").post(verifyJWT, togglesubcription);
subscriptionRouter.route("/unsubscribe").delete(verifyJWT, togglesubcription);

export {subscriptionRouter}