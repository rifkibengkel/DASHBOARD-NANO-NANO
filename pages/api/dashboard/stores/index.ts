import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { pagination, hashPassword } from "../../../../lib/serverHelper";
import * as model from "../_model";
import protectAPI from "../../../../lib/protectApi";
import Cors from "../../../../lib/cors";

interface Pagination {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    startDate: string
    endDate: string
}

export async function getData(param: Pagination) {
    const row = param.row ? Number(param.row) : 10
    const key = param.key ? param.key : "";
    const page = param.page ? Number(param.page) : 0;
    const column = param.column ? param.column : "";
    const direction = param.direction ? param.direction : "";
    const startDate = param.startDate ? param.startDate : "";
    const endDate = param.endDate ? param.endDate : "";

    let params = {
        row,
        startDate,
        endDate,
        key,
        column,
        direction,
        limit: 0
    } as Pagination

    let countStore: any = await model.countStores(params);

    let totalStr = countStore[0].counts;
    const paginations = await pagination(page, row, totalStr);
    params.limit = paginations.query

    let list_str = await model.listStores(params);

    const data = {
        dataPerPage: paginations.dataPerPage,
        total: parseInt(countStore[0].total),
        totalValid: parseInt(countStore[0].totalValid),
        totalPending: parseInt(countStore[0].totalPending),
        totalInvalid: parseInt(countStore[0].totalInvalid),
        totalEntry: parseInt(countStore[0].totalEntry),
        currentPage: paginations.currentPage,
        totalData: paginations.totalData,
        totalPage: paginations.totalPage,
        data: list_str,
    }
    return data
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== 'GET') {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const { row, key, direction, column, page, startDate, endDate } = req.query

        let params = {
            row,
            key,
            startDate,
            endDate,
            direction,
            column,
            page
        } as Pagination

        const data = await getData(params)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)

