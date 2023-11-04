import puppeteer from "puppeteer-extra";
import { Browser, Page } from "puppeteer";
import * as dotenv from 'dotenv'
import path from 'path'
import { transform } from "typescript";
import StealthPlugin from 'puppeteer-extra-plugin-stealth'



const envPath = path.resolve('.env')
dotenv.config({path: envPath})

const rewardpoolInfo = '#root > div > div.DesktopFrame_mainContainer__2V8Re > div.container_mainSubContainer__39U6P > div > div.DetailContainer_stream__2efLF > div.Card_card__3JaBr.Card_isShadow__2I3Nz.DetailContainer_streamMain__AJvS3 > div > div.ArticleContent_articleMain__2EFKB.DetailContainer_content__1v_bX > div.RichTextView_articleMain__2gDyW > div.RichTextView_drawCardWrapper__3S_Xy > div > div > div.DrawCard_footer__2mh2M > span > svg'

class pageLoad {
    async getHTML(BROUSER: Browser, Link: string){

        const pageDownloadedSelector = process.env.PAGE_DOWNLOADED_SELECTOR as string 
        const page: Page = await BROUSER.newPage()

        try{
            await page.setRequestInterception(true);

            page.on('request', (request) => {
                if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            await page.goto(Link)
        
            //ждем загрузки страницы, если она не существует или скрыта, прерывает вызов чтобы не тратить ресурсы
            try{
                await page.waitForSelector(pageDownloadedSelector, {timeout: 3000})
                if(await page.$(rewardpoolInfo)!= null){
                    await page.hover(rewardpoolInfo)            
                }
            }
            catch{}

            const content: string = await page.content()
            page.close()
            return content
        }
        catch(err){
            page.close()
            throw err
        }
    }
}

export const LoadPage = new pageLoad()