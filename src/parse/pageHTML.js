import puppeteer from "puppeteer"

export const LAUNCH_PUPPETEER_OPTS ={
    args:[
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
    ]
};

export const PAGE_PUPPETEER_OPTS = {
    networkIdleTimeout: 5000,
    waitUntil: 'networkidle2',
    timeout: 3000000
}

const downloadSelector = '#root > div > div.DesktopFrame_mainContainer__2V8Re > div.container_mainSubContainer__39U6P > div > div.DetailContainer_stream__2efLF > div.StickySide_stickySide__1e8C7.DetailContainer_sidebar__2Bm9-'

class PageContent{
    constructor(){}

    async getHTML(browser,url){
        try{
            const page = await browser.newPage()
            await page.goto(url)
            try{
                await page.waitForSelector(downloadSelector, {timeout: 3000})
            }catch{}
            const content = await page.content()
            page.close()
            return content
        }catch(err){
            throw err
        }
    }
}

export const pageContent = new PageContent()