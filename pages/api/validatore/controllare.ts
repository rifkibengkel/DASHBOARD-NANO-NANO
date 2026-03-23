import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import * as model from "./_modello";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import dayjs from 'dayjs';

const checkDate = (purchaseDate: string, startDate: string, endDate: string) => {
    return new Promise(async (resolve, reject) => {
        if (purchaseDate >= startDate && purchaseDate <= endDate) {
            // program start
            resolve(0)
        } else {
            if (purchaseDate < startDate) {
                // program not yet start
                resolve(8)
            } else {
                // program ended
                resolve(9)
            }
        }
    })
}

export async function CheckThisOne(rqs: any) {
    const decryp = JSON.parse(Buffer.from(rqs, 'base64').toString('ascii'))

    const entryId = decryp.entryId || 0
    const trx = decryp.trx || ""
    let purchaseDate = decryp.purchaseDate || ''
    const totalAmount = decryp.totalAmount || 0
    const products = decryp.products || []
    const invalidId = decryp.invalidId || 0
    // const isStamp = decryp.isStamp || 0
    const minimumPurchase: any = await model.getGeneralParameterById("9")

    if (invalidId && invalidId != 0) {
        const invalidReason: any = await model.getInvalidReason()
        for (let index = 0; index < invalidReason.length; index++) {
            // const id = invalidReason[index].id
            const reason = invalidReason[index].reason
            // const reply_id = invalidReason[index].reply_id
            if (invalidId == invalidReason[index].id) {
                let datas = {
                    is_valid: 0,
                    is_duplicate: 0,
                    // reply_id: reply_id,
                    invalid_id: invalidId,
                    invalid_reason: reason,
                    duplicate_img: []
                }
                return datas
            }
        }
    }

    const invalidReason: any = await model.getInvalidReason()
    let totalPrd = 0
    for (let i = 0; i < products.length; i++) {
        totalPrd = totalPrd + Number(products[i].quantity)
    }

    let periode: any = await model.getPeriode()
    let startDate = dayjs(periode[0].startDate).format('YYYY-MM-DD HH:mm:ss')
    let endDate = dayjs(periode[0].endDate).format('YYYY-MM-DD HH:mm:ss')
    let chkDate: any = await checkDate(purchaseDate, startDate, endDate)
    let datas = {
        is_valid: 0,
        is_duplicate: 0,
        reply_id: 0,
        invalid_id: 0,
        invalid_reason: "",
        duplicate_img: [] as any
    } 

    for (let index = 0, len=invalidReason.length; index < len; index++) {
        const { id, reason, reply_id } = invalidReason[index]

        if (id == 1) {
            if (chkDate == 8) {
                // datas.reply_id = reply_id
                datas.invalid_id = id
                datas.invalid_reason = reason
                return datas
            }
        }

        if (id == 2) {
            if (chkDate == 9) {
                // datas.reply_id = reply_id
                datas.invalid_id = id
                datas.invalid_reason = reason
                return datas
            }
        }
        
        // if (id == 15) {
        //     const entriesData: any = await model.getFewEntry(entryId)
        //     let rcvd_time = dayjs(entriesData[0].rcvd_time, "YYYY-MM-DD HH:mm:ss")
        //     purchaseDate = dayjs(purchaseDate, "YYYY-MM-DD HH:mm:ss")
        //     if (rcvd_time < purchaseDate) {
        //         datas.reply_id = reply_id
        //         datas.invalid_id = id
        //         datas.invalid_reason = reason
        //         return datas
        //     }
        // }

        // if (id == 11) {
        //     const purchaseDateMinimum = 14
        //     const entriesData: any = await model.getFewEntry(entryId)
        //     let rcvd_time = dayjs(entriesData[0].rcvd_time, "YYYY-MM-DD")
        //     purchaseDate = dayjs(purchaseDate, "YYYY-MM-DD")
        //     const diffDate = dayjs.duration(rcvd_time.diff(purchaseDate)).asDays();
        //     if (diffDate >= purchaseDateMinimum) {
        //         datas.reply_id = reply_id
        //         datas.invalid_id = id
        //         datas.invalid_reason = reason
        //         return datas
        //     }
        // }

        if (id == 11) {
            if (totalAmount < minimumPurchase[0].param) {
                datas.reply_id = reply_id
                datas.invalid_id = id
                datas.invalid_reason = reason
                return datas
            }
        }
        
        if (id == 15) {
            // cek duplicate
            purchaseDate = dayjs(purchaseDate).format('YYYY-MM-DD HH:mm:ss')
            let checkDuplicate: any = await model.checkDuplicate(trx, purchaseDate, entryId)
            if (checkDuplicate.length > 0) {
                // let duplicateData: any = await model.getDuplicateData(entryId)
                let duplicateData: any = await model.getDuplicateData(checkDuplicate[0].id)

                datas.is_duplicate = 1
                datas.invalid_id = id
                datas.invalid_reason = reason
                // datas.duplicate_img = duplicateData[0].url
                datas.duplicate_img = duplicateData
                return datas
            }
        }

        if (index == invalidReason.length - 1) {
            break
        }
    }

    datas.is_valid = 1
    return datas
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
        const datas = await CheckThisOne(data)

        return res.json(datas)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler);
