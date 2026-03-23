import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import {getLoginSession} from "@/lib/auth";
import * as model from "./_model"
// import {parsingIdentity} from "@/lib/serverHelper";

interface editParams {
    id: number
    entriesId: number
    hp: string
    voucherId: number
    status: number
    userId: number
    ktpName?: string
    ktpNumber?: string
    accountNumber?: string
    coupon?: string
    approve?: number
    promoId: string | number
    userType: string
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
            coupon: decryp.coupon,
            voucherId: decryp.prizeType,
            userId: +user?.[0]?.id || 0,
            promoId: decryp.promoId,
            userType: decryp.userType
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
        if (decryp?.approve === 1) {
            // approve mode
            await model.editAndApproveWinnerKTPOnly2(1, params)
            await model.updateKtpUser(getWinnerFew?.[0]?.userId, params.ktpNumber || "", 1)

            const pushUrl: any = await model.getApproveURLpush()
            let response = await fetch(pushUrl[0].push, {
                method: 'POST',
                body: JSON.stringify({
                    winnerId: params.id,
                    promoId: params.promoId
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
        // const ktpParsing = await parsingIdentity(decryp.ktpNumber)
        // if (ktpParsing.idType !== 1) {
        //     return res.status(400).send({
        //         message: "Invalid KTP",
        //         status: 400,
        //         data: {},
        //         error: "Invalid KTP"
        //     })
        // }
        // const checkWinnerKtp = await model.checkKTPAnotherUser(getWinnerFew?.[0]?.userId, params.ktpNumber || "")
        // if (checkWinnerKtp?.[0]?.cnt > 0) {
        //     return res.status(400).send({
        //         message: "Duplicate KTP",
        //         status: 400,
        //         data: {},
        //         error: "Duplicate KTP"
        //     })
        // }
        // if (ktpParsing.idType === 1) {
        //     await model.startTransaction()
        //     await model.editWinnerKTPOnly(params)
        //     await model.commitTransaction()
        // }
        return res.send({
            message: "Success",
            status: 200,
            data: {}
        })
    } catch (error) {
        console.log("error", error)
        await model.rollback()
        return res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)