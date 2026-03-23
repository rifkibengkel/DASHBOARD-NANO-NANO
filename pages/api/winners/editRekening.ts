import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model"

interface editParams {
    id: number
    name: string
    bank_name: string
    nomor_rekening: string
    userId: number
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
        const user: any = await model.getUser(session?.username)
        const {id, name, bank_name, nomor_rekening} = req.body
        const params = {
            id: +id || 0,
            name: name?.toString() || "",
            bank_name: bank_name || null,
            nomor_rekening: nomor_rekening || 0,
            userId: +user?.[0]?.id || 0
        } as editParams
        await model.editWinnerTrx(params)
        return res.send({
            message: "Success",
            data: {}
        })
    } catch (error) {
        return res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)