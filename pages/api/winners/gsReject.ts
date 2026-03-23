import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import {getLoginSession} from "@/lib/auth";
import * as model from "./_model"
// import {parsingIdentity} from "@/lib/serverHelper";

interface editParams {
    id: number
    userId: number
    gsName: string
    gsHp: string
    gsAddress: string
    reject?: number | string
    isClient?: boolean
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
            gsName: decryp.grosirName,
            gsHp: decryp.grosirHp,
            gsAddress: decryp.grosirAddress,
            reject: decryp.reject,
            userId: +user?.[0]?.id || 0,
            isClient: decryp.isClient
        } as editParams
        const getWinnerFew: any = await model.getWinnerGsFw(params.id)
        if (getWinnerFew.length < 1) {
            return res.status(400).send({
                message: "winner not found",
                status: 400,
                data: {},
                error: "winner not found"
            })
        }
        // if(session.accessId !== 5) {
            await model.updateWinnerData(params.id, params.userId)
            await model.rejectEntriesGrosir(params.reject, params.id, params.isClient)
            return res.send({
                message: "Success",
                status: 200,
                data: {}
            })
        // } else {
        //     const pushUrl: any = await model.getRejectURLpush()
        // let response = await fetch(pushUrl[0].push, {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         winnerId: params.id,
        //     }),
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }
        // })
        // if (response.status >= 400) {
        //     throw new Error("error")
        // }
        
        // return res.send({
        //     message: "Success",
        //     status: 200,
        //     data: {}
        // })
        // }
    } catch (error) {
        console.log("error", error)
        await model.rollback()
        return res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)