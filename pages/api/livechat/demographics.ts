import Cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from '@/lib/auth';
import * as model from "./_model";
import { intOrZ } from "@/lib/serverHelper";

interface SummaryDemo {
    startDate: string;
    endDate: string;
}

export async function getData(params: SummaryDemo) {
    const startDate = params.startDate ? params.startDate : ""
    const endDate = params.endDate ? params.endDate : ""

    const demographicData: any = await model.demographic(startDate, endDate)
    let seriesTopic = [];
    let categoriesTopic = [];

    for (let index = 0; index < demographicData.length; index++) {
        const element = demographicData[index];
        categoriesTopic.push(element.categories);
        seriesTopic.push(intOrZ(element.series));
    }

    const data = {
        seriesTopic: seriesTopic,
        categoriesTopic: categoriesTopic,
    }
    return data
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!"})
        }

        if (req.method !== "GET") {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const { startDate, endDate } = req.query

        let params = {
            startDate,
            endDate
        } as SummaryDemo

        const getSumDemo = await getData(params)
        return res.json(getSumDemo)
    } catch(err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)