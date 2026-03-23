import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { pagination, titleCase } from "@/lib/serverHelper";
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";

interface CDPagination {
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

export async function getData(param: CDPagination) {
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
    } as CDPagination

    let countConsumer: any = await model.countConsumer3(params);

    let totalCns = countConsumer[0].counts;
    const paginations = await pagination(page, row, totalCns);
    params.limit = paginations.query

    let list_cns: any = await model.listConsumer3(params);
    
    const tabling: any = [{
        key: 'no',
        title: 'No',
        dataIndex: 'no',
        sorter: false,
    }]

    list_cns.length > 0 ? Object.keys(list_cns[0]).filter(
        (
            item: any) => 
            item !== 'id' && 
            item !== 'total_submit_valid' && 
            item !== 'total_submit_invalid' && 
            item !== 'total_submit_pending' &&
            item !== 'total_submit'
        ).map((item: any, indx: any) => 
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
        totalValid: parseInt(countConsumer[0].totalValid),
        totalPending: parseInt(countConsumer[0].totalPending),
        totalInvalid: parseInt(countConsumer[0].totalInvalid),
        total: parseInt(countConsumer[0].total),
        currentPage: paginations.currentPage,
        totalData: paginations.totalData,
        totalPage: paginations.totalPage,
        data: list_cns,
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
        } as CDPagination

        const data = await getData(params)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)

