import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import * as model from "../_model";
import protectAPI from "../../../../lib/protectApi";
import Cors from "../../../../lib/cors";

export const getDetail = async (id: any) => {
    try {
        const response: any = await model.getSurveyPerQ(id);
        const getSurveySubmit: any = await model.getSurveySubmitted()

        let series = []

        let categories = []

        if(response.length < 1) {
            series.push(0)
            categories.push('Answer')
        } else {
            for (let index = 0; index < response.length; index++) {
                series.push(parseInt(response[index].series));
                categories.push(response[index].categories);
            }    
        }

        return {
            series,
            categories,
            totalSubmit: getSurveySubmit[0].counts
        }
        
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

        const {id} = req.query

        const data = await getDetail(id)

        return res.json(data)
    } catch (err: any) {
        res.status(500).json({message: err.message})
    }
}

export default protectAPI(handler);
