import mongoConnect from "@/lib/mongo";
import protectAPI from "@/lib/protectApi";
import ReqDel from "@/models/ReqDel";
import * as model from "@apiregistrations/_model"
import { NextApiRequest, NextApiResponse } from "next";

mongoConnect()

const addCoup = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, query: { sender } } = req
    let cop = sender as string
    switch(method) {
        case 'PUT': 
            try {
                const getFromUsers = await model.getFromUsers(sender as string)
                if(getFromUsers.length < 1) {
                    return res.status(400).json({ status: 400, success: false, data: null })
                }
                const getFromMg = await ReqDel.findOne({sender: sender})
                if(getFromMg) {
                    return res.status(400).json({ status: 400, success: false, data: null })
                }

                //later status change to 0
                const data = await ReqDel.insertMany([{sender: cop.toUpperCase(), status: 1, created_at: new Date(), updated_at: new Date()}])
                res.status(200).json({ success: true, data: data })
            } catch (err) {
                console.log(err)
                res.status(400).json({ success: false, res: err })
            }
            break;
    }
}

export default protectAPI(addCoup)