import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { pagination, hashPassword } from "../../../../lib/serverHelper";
import * as model from "../_model";
import protectAPI from "../../../../lib/protectApi";
import Cors from "../../../../lib/cors";

interface Pagination {
    productId: string | number
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
}

export async function getData(param: Pagination) {
    const productId = param.productId ? Number(param.productId) : 0
    const row = param.row ? Number(param.row) : 10
    const key = param.key ? param.key : "";
    const page = param.page ? Number(param.page) : 0;
    const column = param.column ? param.column : "";
    const direction = param.direction ? param.direction : "";

    let params = {
        productId,
        row,
        key,
        page,
        column,
        direction,
        limit: 0
    } as Pagination
    const countThis: any = await model.countProductsByCat(params);

    const paginations = await pagination(page, row, countThis[0].total_all);
    params.limit = paginations.query
    let list_prd = await model.listProductsByCat(params);

    const data = {
        dataPerPage: paginations.dataPerPage,
        currentPage: paginations.currentPage,
        totalData: paginations.totalData,
        totalPage: paginations.totalPage,
        data: list_prd,
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

        const { productId, row, key, direction, column, page } = req.query

        let params = {
            productId,
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

