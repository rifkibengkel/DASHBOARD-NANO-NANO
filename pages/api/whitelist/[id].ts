import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";

export async function getDetail(param: string ) {
    const id = param ? param : ""
    
        const detail = await model.deleteList(id)
        return detail

}

// const handler = async (req, res) => {
//     const id = VRQ(req.query.id, "num")
    
//     try {
//         await model.deleteList(id)
//         return res.json({message: 'Success'})
//     } catch (err) {
//         res.status(500).json({message: err.message})
//     }
// }

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

        const {id}: any = req.query
        const datas: any = await getDetail(id)

        if (datas.error) {
            res.status(400).json({ status: 400, error: datas.error.message })
        } else {
            return res.json({ status: 200, datas })
        }
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)

