import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import { getLoginSession } from "@/lib/auth";
import {detail, editWinner, getUser, insertTransaction} from "./_model"
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
        let {hp, proccesDate, reason, reference, status, winnerId} = req.body
        proccesDate = dayjs(proccesDate)?.isValid() ? dayjs(proccesDate).format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss")
        reason = reason || ""
        status = +status || 0
        winnerId = +winnerId || 0
        reference = reference || ""
        hp = hp || ""
        const user: any = await getUser(session?.username)
        const winner: any = await detail(winnerId)
        await insertTransaction({
            createdById: user[0].id,
            hp,
            proccesDate,
            reason,
            reference,
            status,
            winnerId,
            amount: winner[0].voucherAmount,
            code: winner[0].voucher
        })
        await editWinner({
            hp,
            id: winnerId,
            status,
            voucherId: winner[0].voucherId,
            userId: user[0].id,
            entriesId: 0
        })
        return res.send({message: "Success", data: {}})
    } catch (error) {
        res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)