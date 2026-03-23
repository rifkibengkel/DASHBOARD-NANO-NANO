import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import { getLoginSession } from "@/lib/auth";
import {detail, editWinner2, getTrxLast, getUser, updateTransaction} from "./_model"
import dayjs from "dayjs"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({message: "Unauthorized!"})
        }
        if (req.method !== 'POST') {
            return res.status(403).json({message: "Forbidden!"})
        }
        let {trf_date, trf_no, trf_status, id} = req.body
        trf_date = dayjs(trf_date).format("YYYY-MM-DD HH:mm:ss")
        trf_no = trf_no || ""
        trf_status = trf_status || 0
        id = id || 0

        const user: any = await getUser(session?.username)
        const winner: any = await detail(id)

        const getTrxLst: any = await getTrxLast(winner[0].id)
  
        const udt = await updateTransaction(
            trf_no,
            trf_date,
            getTrxLst[0].id
        )

        await editWinner2(
            user[0].id,
            id            
        )
        return res.send({message: "Success", data: {}})
    } catch (error) {
        res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)