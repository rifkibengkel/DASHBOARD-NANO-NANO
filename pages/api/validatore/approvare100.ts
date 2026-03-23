import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import * as model from "./_modello";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
// import dayjs from 'dayjs';
// import axios from 'axios';
import { randomString, send100ToMail, sendCouponToMail, validateUploadS3 } from '@/lib/serverHelper';
import Jimp from 'jimp'
import * as fs from "fs"
const appRoot = require("app-root-path")

const generateImageFromBuffer = (buffer: any) => {
    let _buffer = Buffer.from(buffer, 'base64');
    return _buffer.toString('base64');
};

export async function approveThis(rqs: any, session: any) {

    const decryp = JSON.parse(Buffer.from(rqs, 'base64').toString('ascii'))
    const getUser: any = await model.getUser(session.username)

    const entryId = decryp.entryId || '0'

    if (entryId === '0') {
        return {
            error: {
                type: 'error',
                message: 'No Entry ID',
                description: 'Error'
            }
        }
    }

    let chkApprove: any = await model.checkApproveAdmin(entryId)

    if (chkApprove[0].is_approved_admin == 0 || chkApprove[0].is_approved_admin == 2) {
        return {
            error: {
                type: 'error',
                message: 'Entry Data is not yet processed',
                description: 'Error'
            }
        }
    }

    let chkWinnerExistByUser = await model.checkWinnerByUser(chkApprove[0].userId)

    if (chkWinnerExistByUser.length > 0) {
        return {
            error: {
                type: 'error',
                message: 'Winner by User already exist.',
                description: 'Error'
            }
        }
    }

    const getBrandId = await model.getBrandId()

    const chkMaxFirstSubmitter = await model.getMax()

    let maxP = Number(chkMaxFirstSubmitter[0].value)
    const fewEntry: any = await model.getFewEntry(entryId)
    let { name, userId, purchase_amount_admin, sender } = fewEntry[0]
    let insWinner: any
    try {
        await model.startTransaction()
        
        const minimumPurchase: any = await model.getGeneralParameterById("9")
        let getTotC = Number(purchase_amount_admin) / Number(minimumPurchase[0].param)
        //first 100 winner gets pulsa
        const countWinnerFirst100 = await model.countFirst100()
        
        const check1Winner1User = await model.checkUniqueUserOnWinner(userId)
        if (Number(countWinnerFirst100[0].total) < maxP) {
            if (check1Winner1User[0].counts < 1) {
                insWinner = await model.insertPulsaWinner(entryId, userId, sender, getBrandId[0].id)
                //email 100 pemenang pulsa
                await send100ToMail(name, sender, fewEntry[0].email, insWinner.id)
            }
        }
        await model.commitTransaction()
        return 'Saved'
    } catch (error) {
        console.log(error)
        await model.rollback()
        console.log('err', error)
        return {
            error: {
                type: 'error',
                message: error,
                description: error
            }
        }
    } finally {
        console.log("now send email")
        send100ToMail(name, sender, fewEntry[0].email, insWinner.id)
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== 'POST') {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const data = req.body.data
        const datas: any = await approveThis(data, session)

        if (datas.error) {
            res.status(400).json({ status: 400, error: datas.error.message })
        } else {
            return res.json({ status: 200, datas })
        }
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler);
