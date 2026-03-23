import {NextApiRequest, NextApiResponse} from "next";
import * as model from "./_model"
import { send100ToMailFailed } from "@/lib/serverHelper";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const getUnprocessedLate = await model.getUnprocessedLt()
        for(let x = 0; x < getUnprocessedLate.length; x++) {
            if(Number(getUnprocessedLate[x].total_attach) < 2) {
                send100ToMailFailed(getUnprocessedLate[x].fullname, getUnprocessedLate[x].hp, getUnprocessedLate[x].email, getUnprocessedLate[x].id.toString())
                await model.autoRejectById(getUnprocessedLate[x].id)
            }
        }
        return res.send({
            message: "Success",
            status: 200,
            data: {}
        })

    } catch (error) {
        console.log("error", error)
        return res.status(500).send({message: "Failed", data: {}})
    }
}
export default handler