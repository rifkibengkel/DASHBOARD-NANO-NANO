import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import { titleCase } from "@/lib/serverHelper";

export async function getData() {
    let dataList = await model.list();
    
    const tabling: any = []

    dataList.length > 0 ? Object.keys(dataList[0]).filter((item: any) => item !== 'id' && item !== 'status').map((item: any, indx: any) => 
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
        tabling,
        data: dataList
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== 'GET') {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const data = await getData()

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)