import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import * as model from "./_modello";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import dayjs from 'dayjs';
// import axios from 'axios';
import { randomString, sendCouponToMail, validateUploadS3 } from '@/lib/serverHelper';
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

    try {
        await model.startTransaction()
        const fewEntry: any = await model.getFewEntry(entryId)
        let { name, email, purchase_amount_admin, sender, rcvd_time } = fewEntry[0]

        const minimumPurchase: any = await model.getGeneralParameterById("9")
        let getTotC = Number(purchase_amount_admin) / Number(minimumPurchase[0].param)

        let totalCouponsAllowed = Math.floor(getTotC)

        //first 100 winner gets pulsa
        let coupon
        let findExisting
        let couponStack: any[] = []

        for (let x = 0; x < totalCouponsAllowed; x++) {
            coupon = await randomString(6, '34679QWERTYUPADFGHJKLXCVNM')
            findExisting = await model.findCouponExist(coupon)
            if (findExisting.length < 1) {
                if (!(couponStack.indexOf(coupon) !== -1)) {
                    couponStack.push(coupon)
                } else {
                    x--
                }
            } else {
                x--
            }
        }
        console.log(couponStack)
        const approve = await model.approveEntryAdminSetCoupon(getUser[0].id, couponStack.toString(), entryId)

        const [mainText] = await Promise.all([Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)]);

        //process multi img
        let mailAttachments: any[] = []
        let imgSets: any = []
        for (let x = 0; x < couponStack.length; x++) {
            let processImage = (await Jimp.read(`${appRoot}/../acnemedCoupon.png`)).resize(400, 225);
            processImage.print(mainText, 200, 110, couponStack[x]);


            let bufferImage: Buffer = await processImage.getBufferAsync(processImage._originalMime);
            let filename = `${email}-${couponStack[x]}.png`
            let locPath = `${appRoot}/../public/coupons`
            let apiImage = `${filename}`

            const entriesCo = await model.insertEntriesCoupon(entryId, filename)

            if (!fs.existsSync(locPath)) {
                fs.mkdirSync(locPath, { recursive: true })
            }
            fs.writeFileSync(`${locPath}/${filename}`, bufferImage)
            await validateUploadS3(filename, generateImageFromBuffer(bufferImage) as unknown as string)

            mailAttachments.push({
                filename: filename,
                path: `${locPath}/${filename}`,
                cid: `uni${x}@cid` //same cid value as in the html img src
            })
            imgSets.push(`uni${x}@cid`)
        }
        const sendMail = await sendCouponToMail(name, sender, imgSets, rcvd_time, fewEntry[0].email, mailAttachments)

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
