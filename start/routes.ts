/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { TwitchService } from '#services/twitch_service'
import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
router.on('/').renderInertia('home')


import transmit from '@adonisjs/transmit/services/main'
transmit.registerRoutes()
router.post('/connect', ({request, response} : HttpContext) => {
    const streamerName =  request.input('streamerName')
    TwitchService.getClient(streamerName)
    return response.noContent()
})

router.post('/disconnect', ({response} : HttpContext) => {
    TwitchService.reset()
    return response.noContent()
})

