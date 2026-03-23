import mongoConnect from "@/lib/mongo";
import protectAPI from "@/lib/protectApi";
import ReqDel from "@/models/ReqDel";
import { NextApiRequest, NextApiResponse } from "next";

mongoConnect()

const ApproveReq = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, query: { sender } } = req
    switch(method) {
        case 'PUT': 
            try {
                const chkStatus = await ReqDel.findOne({sender: sender})
                if(chkStatus.status === 0) {
                    const data = await ReqDel.findOneAndUpdate({sender: sender}, {status: 1})
                    res.status(200).json({ success: true, data: data })
                } else {
                    res.status(400).json({ success: false, data: 'Cannot approve! Sender has been approved.' })
                }
            } catch (err) {
                console.log(err)
                res.status(400).json({ success: false, res: err })
            }
            break;
    }
}

export default protectAPI(ApproveReq)