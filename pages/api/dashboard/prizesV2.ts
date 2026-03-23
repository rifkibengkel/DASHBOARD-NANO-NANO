import { NextApiRequest, NextApiResponse } from "next";
import Cors from "../../../lib/cors"
import { getLoginSession } from '@/lib/auth';
import dayjs from "dayjs";
import protectAPI from "../../../lib/protectApi";
import * as model from "./_model";

export async function getData() {
    const fixData: any = await model.summaryPrizeV2()

    return { fixData }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== "GET") {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const getSumEntries = await getData()
        return res.json(getSumEntries)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }

}

export default protectAPI(handler)