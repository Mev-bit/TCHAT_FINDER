import tmi from 'tmi.js'
import transmit from '@adonisjs/transmit/services/main'

export class TwitchService {
  static client: tmi.Client | null = null

  static getClient(streamerName: string){
    if(this.client === null) {
      this.client = new tmi.Client({
        channels: [streamerName],
        connection: {
            reconnect: true,
            secure: true,
        },
      })
      this.client.connect()
      this.client.on('message', (_channel: string, tags: any, message: string, self:boolean) => {
          if (self) return
          transmit.broadcast('chat:message', {
            user: tags['display-name'],
            message,
        })
    })
    }
    return this.client
  }

  static reset(){
    if(this.client){
      this.client.disconnect()
      this.client = null
    }
  }
}