import Cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { pagination, hashPassword } from "../../../lib/serverHelper";
import { getLoginSession } from '@/lib/auth';;
import * as model from "./_model";

interface SummaryDist {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    startDate: string
    endDate: string
    type: string | number
    media: string
}

export async function getData(param: SummaryDist) {
    const row = param.row ? Number(param.row) : 10
    const key = param.key ? param.key : "";
    const page = param.page ? Number(param.page) : 0;
    const column = param.column ? param.column : "";
    const direction = param.direction ? param.direction : "";
    const startDate = param.startDate ? param.startDate : "";
    const endDate = param.endDate ? param.endDate : "";
    const media = param.media ? param.media : "";

    let params = {
        row,
        startDate,
        endDate,
        key,
        column,
        direction,
        media,
        limit: 0
    } as SummaryDist

    let countDistribution: any = await model.countDistribution(key, media);
    let totalConsumer = countDistribution[0].counts;
    const paginations = await pagination(page, row, totalConsumer);
    params.limit = paginations.query
    const listDistributor = await model.listDistribution(key, media, column, direction.toUpperCase(), params.limit)

    const countUniqueValidOnly = await model.validOnly()

    const data = {
        dataPerPage: paginations.dataPerPage,
        totalUniqueValid: countUniqueValidOnly[0]?.counts || 0,
        totalValid: countDistribution[0].totalValid,
        totalPending: countDistribution[0].totalPending,
        totalInvalid: countDistribution[0].totalInvalid,
        totalSubmit: countDistribution[0].totalSubmit,
        totalUniqueConsumen: countDistribution[0].totalUniqueConsumen,
        currentPage: paginations.currentPage,
        totalData: paginations.totalData,
        totalPage: paginations.totalPage,
        data: listDistributor,
        categories: ['Total Valid','Total Invalid'],
        series: [Number(countDistribution[0].totalValid), Number(countDistribution[0].totalInvalid)]
    }
    return data
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

        const { row, key, startDate, endDate, column, direction, page, media } = req.query

        let params = {
            row,
            key,
            startDate,
            endDate,
            direction,
            column,
            page,
            media
        } as SummaryDist

        const getSumDist = await getData(params)
        return res.json(getSumDist)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)