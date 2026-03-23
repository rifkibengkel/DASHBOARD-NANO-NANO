import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import {getLoginSession} from "@/lib/auth";
import * as model from "./_model"
import { send100ToMailSuccess } from "@/lib/serverHelper";
import { getFewEntry } from "../validatore/_modello";
// import {parsingIdentity} from "@/lib/serverHelper";

interface editParams {
    id: number
    entriesId: number
    hp: string
    voucherId: number
    prizeId: number
    status: number
    userId: number
    ktpName?: string
    ktpNumber?: string
    accountNumber?: string
    coupon?: string
    approve?: number
    promoId: string | number
    userType: string
    codeTopup?: number
    amount?: number
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({message: "Unauthorized!"})
        }

        if (req.method !== 'POST') {
            return res.status(403).json({message: "Forbidden!"})
        }

        const ectrd = req.body.data
        const decryp = JSON.parse(Buffer.from(ectrd, 'base64').toString('ascii'))

        const user: any = await model.getUser(session?.username)


        const params = {
            id: parseInt(decryp.id),
            ktpName: decryp.ktpName,
            ktpNumber: decryp.ktpNumber,
            accountNumber: decryp.account_number,
            prizeId: decryp.prizeId,
            // coupon: decryp.coupon,
            // voucherId: decryp.prizeType,
            userId: +user?.[0]?.id || 0,
            promoId: decryp.promoId,
            // userType: decryp.userType
        } as editParams
        const getWinnerFew: any = await model.getWinnerFw(params.id)
        if (getWinnerFew.length < 1) {
            return res.status(400).send({
                message: "winner not found",
                status: 400,
                data: {},
                error: "winner not found"
            })
        }
        const {id, masterBrandId} = getWinnerFew[0]

        const getVoucherId = await model.getVoucherId(params.prizeId)

        params.voucherId = getVoucherId[0].voucherId
        params.codeTopup = getVoucherId[0].codes
        params.amount = getVoucherId[0].amount

        const fewEntry: any = await getFewEntry(getWinnerFew[0].entriesId)
        let { name, email, id_number, userId, purchase_amount_admin, sender, rcvd_time } = fewEntry[0]

        if (decryp?.approve === 1) {
            // approve mode
            await send100ToMailSuccess(name, sender, fewEntry[0].email, getVoucherId[0].name)
            const x = await model.setPrizeForWinner(params)
            const y = await model.fillKTPAndName(params, getWinnerFew[0].entriesId)
            const pushUrl: any = await model.getTopupURL()

            let response = await fetch(pushUrl[0].push, {
                method: 'POST',
                body: JSON.stringify({
                    winnerId:params.id,
                    brandId:masterBrandId,
                    userId:session?.id
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (response.status >= 400) {
                throw new Error("error")
            }
            return res.send({
                message: "Success",
                status: 200,
                data: {}
            })
        }
        return res.send({
            message: "Success",
            status: 200,
            data: {}
        })
    } catch (error) {
        console.log("error", error)
        return res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)