import * as cheerio from 'cheerio';
import fs from 'fs'
import { link } from 'telegraf/typings/format';
import path, { resolve } from 'path';
const authorSelector = '.DetailContainer_author__1KHp0'
const rewardSelector = '.DetailContainer_tabItemDepositValue__Intgq'
const timeSelector = '.DetailContainer_createdAt__3ixC4'
const postNotExistSelector = '.db-empty-table'
const hidenSelector = '#root > div > div.DesktopFrame_mainContainer__2V8Re > div.container_mainSubContainer__39U6P > div > div.DetailContainer_stream__2efLF > div > div > div > div:nth-child(1)'


export const postRef = {
    author: null as string | null,
    reward: '0$',
    creationDate: null as string | null,
    number: null as number | null,
    type: null as string | null,
    LuckyDraw: {
        drawReward: null as number | null,
        drawRestrictions: [] as string[] | null,
    },
    postState: {
        isHidden: null as boolean | null,
        isExist: false as boolean,
    }
  };

class getPostInfo{
    async data(HTML:string, currentPostNumber: number){
        const postRef = {
            author: null as string | null,
            reward: '0$',
            creationDate: null as string | null,
            number: null as number | null,
            type: null as string | null,
            LuckyDraw: {
                drawReward: null as number | null,
                drawRestrictions: [] as string[] | null,
            },
            postState: {
                isHidden: null as boolean | null,
                isExist: false as boolean,
            }
          };
        
        
        try{
            const $ = cheerio.load(HTML)
            let post = postRef
            post.number = currentPostNumber
            
            const existMark: string = $('.db-empty-title > div:first').text()
            switch(existMark){
                case ('This post has been hidden by the author'):{
                    console.log(post.number+'пост скрыт')
                    post.postState.isHidden == true;

                    break
                }
                case('This page does not exist.'):{ 
                    console.log(post.number+'поста не существует')
                    return post
                }

                default: {
                    post.author = $(authorSelector).text()
                    post.reward = $(rewardSelector).text()
                    post.creationDate = $(timeSelector).text()
                    //проверка на лаки драв
                    if($('.DrawCard_drawCard__2Vs3X')){
                        const requirements = $('.RestrictionTip_tipContent__1_e2s').find('div')
                        let arr=[]
                        requirements.each((index,element)=>{
                            arr.push($(element).text())
                        })
                        post.LuckyDraw.drawRestrictions = arr
                    }
                    break
                }
            }
            //TODO нахождение rewardPools и тд.
            /* 
            post.type = "Post"
            if($('.DrawCard_drawCard__2Vs3X')) post.type = 'RewardPool';
            //$('.DrawCard_drawCard__2Vs3X')? post.type = 'RewardPool': {} TODO добавить другой тип

            switch(post.type){
                case "RewardPool":{
                    const requirements = $('.RestrictionTip_tipContent__1_e2s').find('div')
                    requirements.each((index,element)=>{
                        post.drawRestrictions.push($(element).text())
                    })
                    const drawInfo = $('.DrawCard_prizeDetail__2hswn').find('')
                    
                }
            }
            */
            post.postState.isExist = true
            return post

        }catch(err){
            throw err
        }
        
    }

    
}


export const PostAPI = new getPostInfo()