import * as cheerio from 'cheerio';
import fs from 'fs'
import { pageContent } from './pageHTML.js';

const postNotExistSelector = '.db-empty-table'
const authorSelector = '.DetailContainer_author__1KHp0'
const rewardSelector = '.DetailContainer_tabItemDepositValue__Intgq'
const timeSelector = '.DetailContainer_createdAt__3ixC4'
const hidenSelector = '#root > div > div.DesktopFrame_mainContainer__2V8Re > div.container_mainSubContainer__39U6P > div > div.DetailContainer_stream__2efLF > div > div > div > div:nth-child(1)'

class getPostInfo{
    constructor(){}
    
    lastPost = async ()=> {
        const lastPost = fs.existsSync('lastPost.json')
        ? JSON.parse(fs.readFileSync('lastPost.json'))
        : { curPost: 840000 };
        console.log(lastPost)
        return lastPost
    }

    freezeScript = async (curPost) => {
        console.log(`Пост с номером ${curPost} не существует. Ожидаем...`);

        fs.writeFileSync('lastPost.json', JSON.stringify({ curPost }));
        console.log('Сохранено значение curPost.');
    }

    checkPostExist = async (browser,postLink, curPost) => {
        const pageHTML = await pageContent.getHTML(browser,postLink)
        let postData = await getPost.data(pageHTML, curPost)
        return postData.postExist
    }


    data = async (html, postNumber) =>{
        try{
            const $ = cheerio.load(html)
            var post={
                author: 0,
                reward: '0$',
                creation: 0,
                post: postNumber,
                postExist: false,
                isHidden: false
            }
            if($(hidenSelector).text() == 'This post has been hidden by the author'){
                post.postExist = true
            }
            if($(postNotExistSelector).length > 0){
                return post
            }
            if($(rewardSelector).length > 0){
                post.author = $(authorSelector).text()
                post.reward = $(rewardSelector).text()
                post.creation = $(timeSelector).text()
            }
            post.postExist = true
            return post

        }catch(err){
            throw err
        }
    }

}

export const getPost = new getPostInfo()