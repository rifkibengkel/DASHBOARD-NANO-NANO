import type {NextApiRequest, NextApiResponse} from 'next'
import {pagination, hashPassword} from "@/lib/serverHelper";
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import {formModal, IPagination} from "@/interfaces/entries.interface";
import { getLoginSession } from '@/lib/auth';

export const getDetail = async (id: any) => {
    try {
        let detail: any = await model.detail(id);
        if (detail.length < 1) {
            throw new Error("error")
        }
        const transactions: any = await model.transaction(id)
        detail[0].transaction = transactions
        // const attachement = await model.attachments(detail[0].transaction.entriesId)
        // detail[0].attachment = attachement
        return detail
    } catch (err) {
        return {
            error: {
                type: 'error',
                message: 'error',
                description: 'ERROR'
            }
        }
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({message: "Unauthorized!"})
        }

        if (req.method !== 'GET') {
            return res.status(403).json({message: "Forbidden!"})
        }

        const {id} = req.query

        const data = await getDetail(id)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({message: err.message})
    }
}

export default protectAPI(handler);
