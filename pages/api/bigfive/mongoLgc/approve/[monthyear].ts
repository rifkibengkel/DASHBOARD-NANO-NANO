import mongoConnect from "@/lib/mongo";
import protectAPI from "@/lib/protectApi";
import BigFive from "@/models/point_rank";
import { NextApiRequest, NextApiResponse } from "next";

mongoConnect()

const getBig5PerMonth = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, query: { monthyear } } = req
    switch(method) {
        case 'PUT': 
            try {
                const data = await BigFive.findOneAndUpdate({year_month: monthyear}, {status: 1})

                res.status(200).json({ success: true, data: data })
            } catch (err) {
                res.status(400).json({ success: false, res: err })
            }
            break;
    }
}

export default getBig5PerMonth