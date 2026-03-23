import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import { getLoginSession } from "@/lib/auth";
import {voucher} from "./_model"

export const masterVoucher = async (categoryId: number) => {
    const dataVoucher: any = await voucher(categoryId)
    let data = dataVoucher.map((v: any, idx: number) => {
        return {
            value: `${v.id},${v.category}`,
            name: `voucher`,
            key: `${idx}`,
            label: `${v.name} ${v.amount}`
        }
    })
    return data
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({message: "Unauthorized!"})
        }

        if (req.method !== 'GET') {
            return res.status(403).json({message: "Forbidden!"})
        }
        const {category} = req.query
        const data = await masterVoucher(category as unknown as number || 0)
        return res.send({message: "Success", data})
    } catch (error) {
        res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)