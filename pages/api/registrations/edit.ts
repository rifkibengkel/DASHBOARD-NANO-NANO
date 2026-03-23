import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { changePhone } from "@/lib/serverHelper";
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";

interface IParam {
    hp: string;
    id: string;
}


export async function updateData(param: IParam) {
    try {
        const hp = await changePhone(param.hp)

        if (!hp) {
            return {statusCode: 400, message: "Invalid Data"}
        }

        const checkHp: any = await model.findProfile(hp)

        if (checkHp.length > 0) {
            return {statusCode: 409, message: "Duplicate Data"}
        }

        await model.startTransaction()
        await model.updateProfile(param.hp, param.id)
        await model.commitTransaction()

        return {statusCode: 200}
    } catch (error) {
        await model.rollback()
        return {statusCode: 400, message: "Invalid Data"}
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

        const params = req.body

        const data = await updateData(params)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)

