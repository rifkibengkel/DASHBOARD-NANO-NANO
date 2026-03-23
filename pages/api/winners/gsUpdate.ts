import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import {getLoginSession} from "@/lib/auth";
import * as model from "./_model"

interface editParams {
    id: number
    userId: number
    gsName: string
    gsHp: string
    gsAddress: string
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
            gsName: decryp.grosirName,
            gsHp: decryp.grosirHp,
            gsAddress: decryp.grosirAddress,
            userId: +user?.[0]?.id || 0
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

        await model.updateEntriesGrosir(getWinnerFew?.[0]?.entriesGrosirId, params.gsName, params.gsHp, params.gsAddress, getPrzType[0].categoryId)
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