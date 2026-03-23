import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { pagination, hashPassword } from "../../../../lib/serverHelper";
import * as model from "../../entries/_model";
import protectAPI from "../../../../lib/protectApi";
import Cors from "../../../../lib/cors";

interface Pagination {
    storeId: string | number
    startDate: string
    endDate: string
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
}

export async function getData(param: Pagination) {
    const storeId = param.storeId ? Number(param.storeId) : 0
    const startDate = param.startDate ? param.startDate : ""
    const endDate = param.endDate ? param.endDate : ""
    const row = param.row ? Number(param.row) : 10
    const key = param.key ? param.key : "";
    const page = param.page ? Number(param.page) : 0;
    const column = param.column ? param.column : "";
    const direction = param.direction ? param.direction : "";

    let params = {
        storeId,
        startDate,
        endDate,
        row,
        key,
        column,
        direction,
        limit: 0
    } as Pagination

    let countStoreEntries: any = await model.countAllByStore(params);

    let totalStr = countStoreEntries[0].total_all;
    const paginations = await pagination(page, row, totalStr);
    params.limit = paginations.query

    let list_str = await model.listByStore(params);

    const data = {
        dataPerPage: paginations.dataPerPage,
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

        const { storeId, row, key, direction, column, page, startDate, endDate } = req.query

        let params = {
            storeId,
            startDate,
            endDate,
            row,
            key,
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

