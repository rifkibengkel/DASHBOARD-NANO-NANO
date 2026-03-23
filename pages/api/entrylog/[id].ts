import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
// import { pagination, hashPassword } from "@/lib/serverHelperelper";
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import { formModal, IPagination } from "@/interfaces/entries.interface";

export const getDetail = async (id: any) => {
    try {
        const data: any = await model.detail2(id);
        const variantData: any = []
        // await model.variantsDetail(id);
        let datas = {
            entries: data,
            variants: variantData
        }
        return datas
    } catch(err) {
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
