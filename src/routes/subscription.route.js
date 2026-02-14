import {
    getAllSubscribedChannel, 
    isChannelSubscribed, 
    togglesubcription,
} from '../controllers/subscription.controller.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'

import { Router } from 'express'

const subscriptionRouter = new Router();

subscriptionRouter.route("/all").get(verifyJWT, )

export {subscriptionRouter}