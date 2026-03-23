// import mongoConnect from "@/lib/mongo";
import protectAPI from "@/lib/protectApi";
import * as model from '../_model'
import { NextApiRequest, NextApiResponse } from "next";

const reactivateCode = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, query: { id } } = req
    let aid: any = id
    switch(method) {
        case 'PUT': 
            try {
                const chkStatus = await model.checkStatus(aid)
                await model.editStatus(chkStatus[0].status.toString() === '1' ? true : false, aid)
                res.status(200).json({ success: true, data: '' })
            } catch (err) {
                res.status(400).json({ success: false, res: err })
            }
            break;
    }
}

export default protectAPI(reactivateCode)