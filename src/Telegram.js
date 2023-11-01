import { Telegraf } from "telegraf"
import emojis from "./emoji/emoji.js"
import * as emoji from "node-emoji"

const debankChannel = '@debank_earn'
const Link = 'https://debank.com/stream/'

class Telegram {

    sendPoolMessage = async(bot,postData)=>{
      try{
        const postLink = `${Link}${postData.post}`
        const refLink = `${postLink}?t=${Date.now()}&r=74835`
        const reward = String(postData.reward).substring(1)+"$"
        
        const textMessage =`*RawardPool:* ${reward} \n_Interact to earn:_\n ${emoji.get(emojis.orangeDiamond)}Trust, Comment, Repost${emoji.get(emojis.orangeDiamond)}`
        const textButton =  `${emoji.get(emojis.gift)} ${reward}`
        
        
        
        const kb = {
          inline_keyboard: [
            [
              {
                text: textButton,
                url: refLink
              }
            ]
          ]
        };


        await bot.telegram.sendMessage(debankChannel,textMessage,{
          reply_markup: kb,
          parse_mode: 'Markdown'
        })
      } catch(err){
        throw err
      } 
    }
}

export const tg = new Telegram()