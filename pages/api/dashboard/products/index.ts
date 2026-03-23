import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { pagination, hashPassword } from "../../../../lib/serverHelper";
import * as model from "../_model";
import protectAPI from "../../../../lib/protectApi";
import Cors from "../../../../lib/cors";

interface SumProduct {
    media: string
}

export async function getData(params: SumProduct) {
    
    const media = params.media ? params.media : ""
    const variantsData: any = await model.sumCategoryProducts(media)
    const seriesVariant = []
    const idSeries = []
    const categoriesVariant = []

    for (let i = 0; i < variantsData.length; i++) {
        seriesVariant.push(variantsData[i].series ? variantsData[i].series : 0)
        categoriesVariant.push(variantsData[i].categories)
        idSeries.push(variantsData[i].idSeries)
    }

    const data = {
        categoriesVariant,
        seriesVariant,
        idSeries
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

        const { media } = req.query

        let params = {
            media
        } as SumProduct

        const data = await getData(params)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export default protectAPI(handler)

