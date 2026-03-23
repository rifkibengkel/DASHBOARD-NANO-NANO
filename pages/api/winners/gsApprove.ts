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
    promoId: number
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
            id: parseInt(decryp.id),
            gsName: decryp.grosirName,
            gsHp: decryp.grosirHp,
            gsAddress: decryp.grosirAddress,
            promoId: decryp.promoId,
            approve: decryp.approve,
            userId: +user?.[0]?.id || 0,
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

        const getPrzType: any = await model.getPrzType(params.id)

        if(session.accessId !== 5) {
            await model.updateEntriesGrosir(params.id, params.gsName, params.gsHp, params.gsAddress, getPrzType[0].categoryId)
            await model.updateStep(params.id)
            return res.send({
                message: "Success",
                status: 200,
                data: {}
            })
        } else {
            if (decryp?.approve === 1 && getWinnerFew[0].approvalStep === 1) {
            // approve mode
            await model.updateEntriesGrosir(params.id, params.gsName, params.gsHp, params.gsAddress, getPrzType[0].categoryId)

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

            await model.updateWinnerData(params.id, params.userId)
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
        }
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