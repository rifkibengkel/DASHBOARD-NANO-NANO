import mongoConnect from "@/lib/mongo";
import protectAPI from "@/lib/protectApi";
import Coupon from "@/models/Coupon";
import { NextApiRequest, NextApiResponse } from "next";

mongoConnect()

const chkCoupon = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, query: { coupon } } = req

    switch(method) {
        case 'GET':
            try {
                const data = await Coupon.db.collection('coupon').findOne({ coupon: coupon })
                res.status(200).json({ success: true, data: data })
            } catch (err) {
                res.status(400).json({ success: false, res: err })
            }
            break;
    }
}

export default protectAPI(chkCoupon)