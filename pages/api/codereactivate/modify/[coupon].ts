import mongoConnect from "@/lib/mongo";
import protectAPI from "@/lib/protectApi";
import * as model from '../models/_model'
import Coupon from "@/models/Coupon";
import { NextApiRequest, NextApiResponse } from "next";

mongoConnect()

const reactivateCode = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, query: { coupon } } = req
    switch(method) {
        case 'PUT': 
            try {
                const chkStatus = await Coupon.findOne({coupon: coupon})
                const isUsedProperly = await model.checkEntry(coupon?.toString()?.toUpperCase() as string)
                if(isUsedProperly.length < 1 && chkStatus.status === 1) {
                    const data = await Coupon.findOneAndUpdate({coupon: coupon}, {status: 0})
                    res.status(200).json({ success: true, data: data })
                } else {
                    res.status(400).json({ success: false, data: 'Cannot reactivate! Coupon has been used properly.' })
                }
            } catch (err) {
                console.log(err)
                res.status(400).json({ success: false, res: err })
            }
            break;
    }
}

export default protectAPI(reactivateCode)