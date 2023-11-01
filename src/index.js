import puppeteer from 'puppeteer'
import cheerio from 'cheerio'
import { pageContent } from './parse/pageHTML.js'
import { getPost } from './parse/getPostInfo.js'
import {Telegraf} from 'telegraf'
import { tg } from './Telegram.js'
import { LAUNCH_PUPPETEER_OPTS } from './parse/pageHTML.js'
import * as dotenv from 'dotenv'
import path from 'path'

let pathToken = path.resolve('.env')
dotenv.config({path: pathToken})

const bot = new Telegraf(process.env.TG_API_KEY);
const debankChannel = '@debank_earn'
const Link = 'https://debank.com/stream/'

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const main = async (postNum) => {
    const browser = await puppeteer.launch({
     headless:false});
    let curPost = postNum
    try{
        while(true) {
            const post100Delay = curPost+100
            if(await getPost.checkPostExist(browser,`${Link}${post100Delay}`, post100Delay)){
                console.log(post100Delay,'Существует')
                while(curPost<post100Delay){
                    const postLink = `${Link}${curPost}`
                    const pageHTML = await pageContent.getHTML(browser,postLink)
                    let postData = await getPost.data(pageHTML, curPost)

                    //Oтправляем сообщение если подходят условия
                    if(parseFloat(String(postData.reward).substring(1)) >= 0){console.log(postData.post, postData.reward)}

                    if(parseFloat(String(postData.reward).substring(1)) >= 1){
                        console.log('отправляем в тг', postData.post, 'награда',postData.reward)
                        await tg.sendPoolMessage(bot,postData)
                    }
                    curPost++
                }
                
            }else{
                console.log('Проверочный', curPost+100, "Не существует")
                await getPost.freezeScript(curPost)
                await delay(30000);
                continue;
            }
            
        }

    }catch(err){
        console.log(err.message)
    }
}

async function start() {
    console.log('start')
    const storedData = await getPost.lastPost()
    bot.launch()
    main(storedData.curPost)
}
start()

