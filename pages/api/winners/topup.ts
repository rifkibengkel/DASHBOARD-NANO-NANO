import cors from "@/lib/cors";
import * as model from "./_model"
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import { getLoginSession } from "@/lib/auth";
import {getUser, updatedByWinner} from "./_model";

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
        const user: any = await getUser(session?.username)
        const pushUrl: any = await model.getTopupURL()
        const {id, brandId} = req.body
        await updatedByWinner(user[0].id, id)
        let response = await fetch(pushUrl[0].push, {
            method: 'POST',
            body: JSON.stringify({
                winnerId:id,
                brandId:brandId,
                userId:session?.id
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (response.status >= 400) {
            throw new Error("error")
        }
        return res.send({message: "Success", data: {}})
    } catch (error) {
        res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)