import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import cheerio from 'cheerio'
import {Telegraf} from 'telegraf'
import * as dotenv from 'dotenv'
import path, { resolve } from 'path'
import { Browser } from 'puppeteer'
import { LoadPage } from './PageContent/htmlLoader'
import { PostAPI } from './PageContent/pageContentFetcher'
import { Bot } from './TGbot'
import fs from 'fs'

//конфигурация .env файла
const envPath = path.resolve('.env')
dotenv.config({path: envPath})

//основные переменные
const TELEGRAM_API_KEY = process.env.TG_API_KEY as string;
const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL as string;
const DEBANK_BASELINK = process.env.DEBANK_BASELINK as string;

let BROUSER : Browser;


//инициализация тг бота

const bot = new Telegraf(TELEGRAM_API_KEY);

const fetchData = async(BROUSER: Browser, post: number) => {
    const postLink: string = `${DEBANK_BASELINK}/${post}`;
    const pageHTML = await LoadPage.getHTML(BROUSER,postLink);
    const postData = await PostAPI.data(pageHTML, post)
    return postData
}
async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const main = async (initialPostNumber: number) => {
    bot.launch()

    puppeteer.use(StealthPlugin())
    BROUSER = await puppeteer.launch({
        headless: 'new',
    });
    let currentPost: number = initialPostNumber;

    while(true){
        try{
            const postNumSub100 = currentPost + 100;
            if((await fetchData(BROUSER, postNumSub100)).postState.isExist == true){
                console.log(postNumSub100,'существует!!!!!')
                while(currentPost < postNumSub100){
                    const postData = await fetchData(BROUSER, currentPost)
                    const RewardPool = parseFloat(postData.reward.substring(1))
                    console.log(`Пост ${postData.number}, награда ${postData.reward}`)
                    if(RewardPool >= 5){
                        console.log('отправляем в тг', postData.number, 'награда', RewardPool)
                        await Bot.RewardPoolMsg(postData)
                    }
                    currentPost++ 
                }
            }
            else{
                console.log(`\nПост с номером ${postNumSub100} не существует.`);

                fs.writeFileSync('lastPost.json', JSON.stringify({ currentPost }));
                console.log('Сохранено значение curPost.');
                console.log('ждем 30 сек...')
                await delay(30000)
                continue
            }
        }catch (e:any) {
            console.log(e.message);
        }
    }
    //await BROUSER.close()
}
const start = async () => {
        const path = resolve('lastPost.json')
        const jsonData = JSON.parse(fs.readFileSync(path, 'utf-8'));
        console.log('Данные из JSON файла:', jsonData);
        
        await main(jsonData.currentPost)

}

start()

export default bot