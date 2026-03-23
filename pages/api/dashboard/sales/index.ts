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
    mode: string
}

export async function getData(param: Pagination) {
    const row = param.row ? Number(param.row) : 10
    const key = param.key ? param.key : "";
    const page = param.page ? Number(param.page) : 0;
    const column = param.column ? param.column : "";
    const direction = param.direction ? param.direction : "";
    const startDate = param.startDate ? param.startDate : "";
    const endDate = param.endDate ? param.endDate : "";

    const mode = param.mode ? param.mode : "store";


    let params = {
        mode,
        row,
        startDate,
        endDate,
        key,
        column,
        direction,
        limit: 0
    } as Pagination

    let countSales: any = await model.countSales(params);

    let totalSls = countSales[0].counts;
    const paginations = await pagination(page, row, totalSls);
    params.limit = paginations.query

    let list_sls = await model.listSales(params);

    const data = {
        dataPerPage: paginations.dataPerPage,
        totalValid: parseInt(countSales[0].totalValid),
        totalPending: parseInt(countSales[0].totalPending),
        totalInvalid: parseInt(countSales[0].totalInvalid),
        total: parseInt(countSales[0].total),
        totalValidQty: parseInt(countSales[0].totalValidQty),
        totalInvalidQty: parseInt(countSales[0].totalInvalidQty),
        currentPage: paginations.currentPage,
        totalData: paginations.totalData,
        totalPage: paginations.totalPage,
        data: list_sls,
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

        const { row, key, direction, column, page, startDate, endDate, mode } = req.query

        let params = {
            row,
            key,
            startDate,
            endDate,
            direction,
            column,
            page,
            mode
        } as Pagination

        const data = await getData(params)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)

