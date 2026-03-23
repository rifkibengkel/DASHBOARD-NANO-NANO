import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import {getLoginSession} from "@/lib/auth";
import * as model from "./_model"
import {parsingIdentity} from "@/lib/serverHelper";

interface editParams {
    id: number
    hp: string
    voucherId: number
    status: number
    userId: number
    ktpName?: string
    ktpNumber?: string
    coupon?: string
    approve?: number
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
            id: decryp.id,
            ktpName: decryp.ktpName,
            ktpNumber: decryp.ktpNumber,
            coupon: decryp.coupon,
            userId: +user?.[0]?.id || 0
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
        const ktpParsing = await parsingIdentity(decryp.ktpNumber)
        if (ktpParsing.idType !== 1) {
            return res.status(400).send({
                message: "Invalid KTP",
                status: 400,
                data: {
                    message: "Invalid KTP",
                    is_valid: 0
                },
                error: "Invalid KTP"
            })
        }
        const checkWinnerKtp = await model.checkKTPAnotherUser(getWinnerFew?.[0]?.userId, params.ktpNumber || "")
        if (checkWinnerKtp?.[0]?.cnt > 0) {
            return res.status(400).send({
                message: "Duplicate KTP",
                status: 400,
                data: {
                    message: "Invalid KTP",
                    is_valid: 0
                },
                error: "Duplicate KTP"
            })
        }

        const checkCoupon = await model.checkCoupon(getWinnerFew?.[0]?.userId, params.coupon || "")
        if (checkCoupon?.[0]?.cnt > 0) {
            return res.status(400).send({
                message: "Duplicate Coupon",
                status: 400,
                data: {
                    message: "Invalid Coupon",
                    is_valid: 0
                },
                error: "Duplicate Coupon"
            })
        }

        // if (ktpParsing.idType === 1) {
        //     await model.startTransaction()
        //     await model.editWinnerKTPOnly(params)
        //     await model.commitTransaction()
        // }
        return res.send({
            message: "Success",
            status: 200,
            data: {
                message: "",
                is_valid: 1
            },
        })
    } catch (error) {
        console.log("error", error)
        await model.rollback()
        return res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)