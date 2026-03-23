import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { pagination, titleCase } from "@/lib/serverHelper";
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";

interface RgPagination {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    media: string
    startDate: string
    endDate: string
}


export async function getData(param: RgPagination) {
    const row = param.row ? Number(param.row) : 10;
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
    } as RgPagination
    let countRegistration: any = await model.countRegistration2(params);

    let totalReg = countRegistration[0].counts;
    let paginations = await pagination(page, row, totalReg);
    params.limit = paginations.query

    let list_reg: any = await model.listRegistration2(params);

    const tabling: any = [{
        key: 'no',
        title: 'No',
        dataIndex: 'no',
        sorter: false,
    }]

    list_reg.length > 0 ? Object.keys(list_reg[0]).filter((item: any) => item !== 'id').map((item: any, indx: any) => 
        tabling.push({
        key: indx,
        title: titleCase(item),
        dataIndex: item,
        sorter: true
        })
    ) : tabling.push({
        key: '5',
        title: "Columns",
        dataIndex: "columns",
        sorter: true
        })

    const data = {
        dataPerPage: paginations.dataPerPage,
        currentPage: paginations.currentPage,
        totalData: paginations.totalData,
        totalPage: paginations.totalPage,
        data: list_reg,
        tabling: tabling
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
        } as RgPagination

        const data = await getData(params)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)

