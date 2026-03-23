import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import * as fs from "fs"
import path from "path"
const appRoot = require("app-root-path");

interface RgPagination {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
}

export async function getData(param: RgPagination) {
    const row = param.row ? Number(param.row) : 10;
    const key = param.key ? param.key : "";
    const page = param.page ? Number(param.page) : 0;
    const column = param.column ? param.column : "";
    const direction = param.direction ? param.direction : "";
    let params = {
        row,
        key,
        column,
        direction,
        limit: 0
    } as RgPagination

    const dir = path.resolve(`${appRoot}/../exports`);

    const filenames = fs.readdirSync(dir);

    const files = filenames.map((name, index) => ({
        id: index,
        name: name,
        created_at: fs.statSync(`${dir}/${name}`).mtime.getTime(),
    })).sort((a, b) => b.created_at - a.created_at)
    return files
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

        const { row, key, direction, column, page } = req.query

        let params = {
            row,
            key,
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