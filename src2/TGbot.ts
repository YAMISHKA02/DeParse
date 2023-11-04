import { postRef } from "./PageContent/pageContentFetcher";
import bot from "./index";
import * as emoji from "node-emoji"

const debankChannel = '@debank_earn'
const Link = 'https://debank.com/stream/'

type postData = typeof postRef


class cusTomBotFunctions{
    async RewardPoolMsg(postData: postData){
        try{
            const postLink = `${Link}${postData.number}`
            const refLink = `${postLink}?t=${Date.now()}&r=74835`
            const reward = postData.reward.substring(1)+"$"
    
            const textMessage =`*RawardPool:* ${reward} \n_Interact to earn:_\n ${emoji.get('large_orange_diamond')}Trust, Comment, Repost${emoji.get('large_orange_diamond')}`
            const textButton =  `${emoji.get('gift')} ${reward}`
            
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

        } 
        catch(err){
            throw err
        } 
    }
}

export const Bot = new cusTomBotFunctions()