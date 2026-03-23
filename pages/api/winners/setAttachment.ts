import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";

export async function getData(param: any) {
    const id = param.id ? param.id : "";
    const attId = param.attId ? param.attId : "";

    if (id == "" || attId == "") {
        return {
            error: {
                type: 'error',
                message: 'No Lengkap',
                description: 'Error'
            }
        }
    }

    try {
        await model.startTransaction()
        const response = await model.setActiveAttachment(id, attId)
        await model.commitTransaction()
        return "ok"
    } catch (err) {
        await model.rollback()
        return {
            error: {
                type: 'error',
                message: 'Error dude!',
                description: 'Error'
            }
        }
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== 'POST') {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const id: any = req.body.id
        const attId: any = req.body.attId

        let datas = {
            id, attId
        }
        const data = await getData(datas)
        return res.json(data)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler);
