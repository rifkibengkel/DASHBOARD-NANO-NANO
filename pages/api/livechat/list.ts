import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { pagination, titleCase } from "@/lib/serverHelper";
import * as model from "./_model";
import protectAPI from "../../../lib/protectApi";
import Cors from "../../../lib/cors";
import { IPagination } from "@/interfaces/livechat.interface";

export const detailAgent = async (id: any) => {
    try {
        let data: any = await model.getAgent(id);
        return data
    } catch(err) {
        return {
            error: {
                type: 'error',
                message: 'error',
                description: 'ERROR'
            }
        }
    }
}

export const detailAgentPerTopic = async (param: IPagination) => {
    try {
        const row = param.row ? Number(param.row) : 10
        const page = param.page ? Number(param.page) : 0
        const key = param.key ? param.key : ""
        const direction = param.direction ? param.direction : ""
        const column = param.column ? param.column : ""
        const startDate = param.startDate ? param.startDate : ""
        const endDate = param.endDate ? param.endDate : ""
        const agentId = param.agentId ? param.agentId : ""
        const type = param.type || ""

        let params = {
            startDate,
            endDate,
            row,
            page,
            limit: 0,
            key,
            direction,
            column,
            type,
            agentId
        } as IPagination

        let data: any = [];
        const topicsData: any = await model.topicsDetail(params);
        for (let index = 0; index < topicsData.length; index++) {
            const element = topicsData[index];
            const content: any = await model.detail(params, element.id);
            if (content.length > 0) {
                let setObject: any = {};
                setObject['id'] = element.id;
                setObject['title'] = element.title.toUpperCase();
                setObject['list'] = content;

                data.push(setObject)
            }
        }

        return data
    } catch(err) {
        return {
            error: {
                type: 'error',
                message: 'error',
                description: 'ERROR'
            }
        }
    }
}

export async function getData(param: IPagination) {
    const row = param.row ? Number(param.row) : 10
    const page = param.page ? Number(param.page) : 0
    const key = param.key ? param.key : ""
    const direction = param.direction ? param.direction : ""
    const column = param.column ? param.column : ""
    const startDate = param.startDate ? param.startDate : ""
    const endDate = param.endDate ? param.endDate : ""
    const agentId = param.agentId ? param.agentId : ""
    const type = param.type || ""
    
    let params = {
        startDate,
        endDate,
        row,
        limit: 0,
        key,
        direction,
        column,
        type,
        agentId
    } as IPagination

    const total: any = await model.countAll2(params);

    const paginations = await pagination(page, row, total[0].total_all);
    params.limit = paginations.query

    const dataList: any = await model.list2(params);

    const tabling: any = [{
        key: 'no',
        title: 'No',
        dataIndex: 'no',
        sorter: false,
    }]

    dataList.length > 0 ? Object.keys(dataList[0]).filter((item: any) => item !== 'id' && item !== 'voucher_number' && item !== 'is_exist_winner').map((item: any, indx: any) => 
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

        const {row, key, direction, column, page, startDate, endDate, type, agentId} = req.query

        let params = {
            row,
            key,
            direction,
            column,
            page,
            startDate,
            endDate,
            type, 
            agentId
        } as IPagination

        const data = await getData(params)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({message: err.message})
    }
}

export default protectAPI(handler);
