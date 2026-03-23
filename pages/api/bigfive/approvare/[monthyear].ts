import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import * as model from "../_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";

export async function approveThis(monthyear: any, session: any) {
    const monthyearTgt = monthyear

    try {
        await model.startTransaction()

        const chkPeriod: any = await model.checkPeriod(monthyearTgt)
        if (chkPeriod[0].status == 1) {
            return {
                error: {
                    type: 'error',
                    message: 'Top 5 this periode already approved.',
                    description: 'Error'
                }
            }
        } else {
            await model.approvePeriod(monthyearTgt)
            await model.commitTransaction()
            return 'Saved'
        }
    } catch (error) {
        await model.rollback()
        console.log('err', error)
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

        const session = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== 'PUT') {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const data = req.query.monthyear
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
