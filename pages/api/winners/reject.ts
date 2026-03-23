import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model"
import axios from "axios";
import { send100ToMailFailed } from "@/lib/serverHelper";
import { getFewEntry } from "../validatore/_modello";

interface editParams {
    id: number
    hp: string
    voucherId: number
    status: number
    userId: number
    ktpName?: string
    ktpNumber?: string
    approve?: number
    reject?: string
    promoId?: string | number
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== 'POST') {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const ectrd = req.body.data
        const decryp = JSON.parse(Buffer.from(ectrd, 'base64').toString('ascii'))

        const user: any = await model.getUser(session?.username)
        const params = {
            id: decryp.id,
            ktpName: decryp.ktpName,
            ktpNumber: decryp.ktpNumber,
            userId: +user?.[0]?.id || 0,
            reject: decryp.reject,
            promoId: decryp.promoId
        } as editParams
        const winner: any = await model.getWinnerFw(params.id)
        if (winner.length < 1) {
            return res.status(400).send({
                message: "Invalid Winner",
                status: 400,
                data: {}
            })
        }

        const fewEntry: any = await getFewEntry(winner[0].entriesId)
        let { name, email, id_number, userId, purchase_amount_admin, sender, rcvd_time } = fewEntry[0]
        // const historyId = await model.getHistoryId(params.id)
        // const pushUrl: any = await model.getRejectURLpush()
        // let response = await fetch(pushUrl[0].push, {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         winnerId: params.id,
        //         rejectId: params.reject,
        //         promoId: params.promoId
        //     }),
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }
        // })
        // if (response.status >= 400) {
        //     throw new Error("error")
        // }
        
        // const chkAgain: any = await model.getWinnerFw(params.id)
        // if(chkAgain[0].totalReject == 2) {
        //     await model.rejectWinner(params.id, params.userId, params.reject || "")
        //     await model.revertAllocation(winner?.[0]?.allocationId)
        // }
        // await model.rejectWinner(params.id, params.userId, params.reject || "")
        // await model.addHistoryDetail(historyId[0].id, 'Rejected By Admin')

        // const rejectDesc: any = await model.getRejectDesc(Number(params.reject))

        // const pushNotif: any = await model.getPushNotif()

        // const respSucc: any = await model.getRej(winner[0].prz_name, rejectDesc[0].name)

        // const pushUrl: any = await model.getApproveURLpush()

        // let response = await fetch(pushUrl[0].push, {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         winnerId: params.id,
        //         status: 2,
        //         approvedById: params.userId,
        //         invalidReason: params.reject
        //     }),
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }
        // })
        // if (response.status >= 400) {
        //     throw new Error("error")
        // }

        await send100ToMailFailed(name, sender, fewEntry[0].email, params.id.toString())
        const y = await model.fillKTPAndName(params, winner[0].entriesId)
        await model.rejectWinner(params.id, params.userId, Number(params.reject))

        return res.send({
            message: "Success",
            status: 200,
            data: {}
        })
    } catch (error) {
        return res.status(500).send({ message: "Failed", data: {} })
    }
}
export default protectAPI(handler)