import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { paginationMongo, titleCase } from "@/lib/serverHelper";
import Cors from "../../../lib/cors";
import { IPaginationMongo as IPagination } from "../../../interfaces/entries.interface";
import mongoConnect from "@/lib/mongo";

import ReqDel from "@/models/ReqDel";
mongoConnect()

export async function getData(param: IPagination) {
    const row = param.row ? Number(param.row) : 10
    const page = param.page ? Number(param.page) : 0
    const key = param.key ? param.key : ''
    const direction = param.direction ? param.direction : ""
    const column = param.column ? param.column : ""
    const isApproved = param.isApproved ? param.isApproved : ""
    
    let params = {
        isApproved,
        row,
        limit: 0,
        key,
        direction,
        column
    } as IPagination

    const total = await ReqDel.find({'sender' : new RegExp(key, 'i')}).count()

    const paginations = await paginationMongo(page, row, total);

    const dataList: any = await ReqDel.find({'sender' : new RegExp(key, 'i')}).select('sender status created_at').where() .skip(paginations.skip).limit(row).sort({_id: -1});

    return {
        tabling: [],
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

        const {row, key, direction, column, page, isApproved} = req.query

        let params = {
            row,
            key,
            direction,
            column,
            page,
            isApproved,
        } as IPagination

        const data = await getData(params)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({message: err.message})
    }
}

export default handler;