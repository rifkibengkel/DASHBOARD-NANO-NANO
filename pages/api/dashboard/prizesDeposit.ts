import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import * as model from "./_model";
import protectAPI from "../../../lib/protectApi";
import Cors from "../../../lib/cors";
import { pagination } from '@/lib/serverHelper';

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
    const row = param.row ? Number(param.row) : 10
    const page = param.page ? Number(param.page) : 0
    const key = param.key ? param.key : ""
    const direction = param.direction ? param.direction : ""
    const column = param.column ? param.column : ""
    const startDate = param.startDate ? param.startDate : ""
    const endDate = param.endDate ? param.endDate : ""

    let params = {
        startDate,
        endDate,
        row,
        limit: 0,
        key,
        direction,
        column
    } as RgPagination

    const generalParameter: any = await model.generalParameter()
    const objParameter: any = () => {
        let data: any = {}
        for (let index = 0; index < generalParameter.length; index++) {
            const param = generalParameter[index].param
            const description = generalParameter[index].description
            data[description] = param
        }
        return data
    }

    const dataWinPulsa = await model.sumWinPulsa(objParameter().markUp, 1)
    const dataWinPulsa2 = await model.sumWinPulsa(objParameter().markUp, 2)
    const deposit = objParameter().deposit1
    const deposit2 = objParameter().deposit2

    const total: any = await model.countAllListPrize(params);
    const paginations = await pagination(page, row, total[0].counts);
    params.limit = paginations.query
    let list_bl = await model.listPrizesPulsa(params);

    const data = {
        dataPerPage: paginations.dataPerPage,
        currentPage: paginations.currentPage,
        totalData: paginations.totalData,
        totalPage: paginations.totalPage,
        data: list_bl,
        deposit: parseInt(deposit),
        deposit2: parseInt(deposit2),
        dataWinPulsa,
        dataWinPulsa2
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
            direction,
            column,
            page,
            startDate,
            endDate
        } as RgPagination

        const data = await getData(params)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)