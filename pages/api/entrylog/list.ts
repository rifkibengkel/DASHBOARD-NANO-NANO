import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { pagination, paginationMongo, titleCase } from "@/lib/serverHelper";
import * as model from "./_model";
import Cors from "@/lib/cors";
import { IPagination } from "@/interfaces/entries.interface";
import mongoConnect from "@/lib/mongo";
// import protectAPI from "@/lib/protectApi";
import EntryLogs from "@/models/entry_logs";
mongoConnect()

export async function getData(param: IPagination) {
    const row = param.row ? Number(param.row) : 10
    const page = param.page ? Number(param.page) : 0
    const key = param.key ? param.key : ""
    const direction = param.direction ? param.direction : ""
    const column = param.column ? param.column : ""
    const startDate = param.startDate ? param.startDate : ""
    const endDate = param.endDate ? param.endDate : ""
    const isValid = param.isValid ? param.isValid : ""
    const isValidAdmin = param.isValidAdmin ? param.isValidAdmin : ""
    const isApprovedAdmin = param.isApprovedAdmin ? param.isApprovedAdmin : ""
    const storeId = param.storeId ? param.storeId : ""
    const type = param.type || ""
    
    let params = {
        isValid,
        isValidAdmin,
        isApprovedAdmin,
        startDate,
        endDate,
        row,
        limit: 0,
        key,
        direction,
        column,
        type,
        storeId
    } as IPagination

    const total = await EntryLogs.count({'message' : new RegExp(key, 'i')})

    const paginations = await paginationMongo(page, row, total);

    const dataList: any = await EntryLogs.find({'message' : new RegExp(key, 'i')}).skip(paginations.skip).limit(row).sort({receiveTime: -1});

    const tabling: any = [{
        key: 'no',
        title: 'No',
        dataIndex: 'no',
        sorter: false,
    }]

    dataList.length > 0 ? Object.keys(dataList[0].toJSON()).filter((item: any) => item !== '_id').map((item: any, indx: any) => 
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

    return {
        tabling: tabling,
        dataPerPage: paginations.dataPerPage,
        currentPage: paginations.currentPage,
        totalData: paginations.totalData,
        totalPage: paginations.totalPage,
        data: dataList,
        key: null
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({message: "Unauthorized!"})
        }

        if (req.method !== 'GET') {
            return res.status(403).json({message: "Forbidden!"})
        }

        const {row, key, direction, column, page, startDate, endDate, isValid, isValidAdmin, isApprovedAdmin, storeId, type} = req.query

        let params = {
            row,
            key,
            direction,
            column,
            page,
            startDate,
            endDate,
            isValid,
            isValidAdmin,
            isApprovedAdmin,
            storeId,
            type
        } as IPagination

        const data = await getData(params)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({message: err.message})
    }
}

export default handler;