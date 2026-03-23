import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import * as model from "./_modello";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
const appRoot = require("app-root-path")

export async function approveThis(rqs: any, session: any) {

    const decryp = JSON.parse(Buffer.from(rqs, 'base64').toString('ascii'))
    const getUser: any = await model.getUser(session.username)

    const entryId = decryp.entryId || '0'

    if (entryId === '0') {
        return {
            error: {
                type: 'error',
                message: 'No Entry ID',
                description: 'Error'
            }
        }
    }

    let chkApprove: any = await model.checkApproveAdmin(entryId)

    if (chkApprove[0].is_approved_admin == 1) {
        return {
            error: {
                type: 'error',
                message: 'Entry Already Approved',
                description: 'Error'
            }
        }
    }

    try {
        await model.startTransaction()
        await model.getFewEntry(entryId)
        await model.approveEntryAdmin2(getUser[0].id, entryId)
        await model.commitTransaction()
        return 'Saved'

    } catch (error) {
        await model.rollback()
        console.log('err', error)
        return {
            error: {
                type: 'error',
                message: error,
                description: error
            }
        }
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== 'POST') {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const data = req.body.data
        const datas: any = await approveThis(data, session)

        if (datas.error) {
            res.status(400).json({ status: 400, error: datas.error.message })
        } else {
            return res.json({ status: 200, datas })
        }
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler);
