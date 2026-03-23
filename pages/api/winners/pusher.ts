import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model"
// import axios from "axios";
import { pushWhatsapp } from "@/lib/pushWaTemplate";

interface pusher {
    id: number
    hp: string

}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== 'POST') {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const ectrd = req.body.data


        const getTemplate = await model.getPushTemplate(ectrd.reason)

        const getFew = await model.getUserDet(ectrd.id)
        
        let bodies = [
          {
              replacementText: getFew[0].fullname
          },
        ]

        await pushWhatsapp(getFew[0].hp, getTemplate[0].template_name, bodies, [])

        await model.updateCountPush(ectrd.id)

        return res.send({
            message: "Success",
            status: 200,
            data: {}
        })
    } catch (error) {
        return res.status(500).send({ message: "Failed", data: {} })
    }
}
export default protectAPI(handler)