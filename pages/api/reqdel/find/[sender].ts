import mongoConnect from "@/lib/mongo";
import protectAPI from "@/lib/protectApi";
import ReqDel from "@/models/ReqDel";
import * as model from "@apiregistrations/_model"
import { NextApiRequest, NextApiResponse } from "next";

mongoConnect()

const chkCouponRe = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, query: { sender } } = req

    switch(method) {
        case 'GET':
            try {
                const getFromUsers = await model.getFromUsers(sender as string)
                if(getFromUsers.length < 1) {
                    return res.status(400).json({ status: 400, success: false, data: null })
                }
                const data = await ReqDel.findOne({sender: sender})
                res.status(200).json({ success: true, data: data })
            } catch (err) {
                res.status(500).json({ success: false, data: err })
            }
            break;
    }
}

export default protectAPI(chkCouponRe)