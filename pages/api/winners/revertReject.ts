import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import {getLoginSession} from "@/lib/auth";
import * as model from "./_model"
// import {parsingIdentity} from "@/lib/serverHelper";

interface editParams {
    id: number
    userId: number
    dateTgt: string
}

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

        const ectrd = req.body.data
        const decryp = JSON.parse(Buffer.from(ectrd, 'base64').toString('ascii'))

        const user: any = await model.getUser(session?.username)

        const params = {
            id: parseInt(decryp.id),
            userId: +user?.[0]?.id || 0,
            dateTgt: decryp.dateTgt
        } as editParams

        const getWinnerFew: any = await model.getSpecific(params.id)

        await model.startTransaction()
        const selectedAlc = await model.get1Allocation(params.dateTgt, getWinnerFew[0].prizeId)

        if (selectedAlc.length < 1) {
            return res.status(400).send({
                message: "No allocation available on this date.",
                status: 400,
                data: {},
                error: "No allocation available on this date."
            })
        }

        const getText = await model.getTemplate()

        await model.useAllocation(selectedAlc[0].id)
        await model.revertEntries(getWinnerFew[0].entriesId)
        await model.revertWinner(selectedAlc[0].id, params.id)
        await model.revertHistory(params.id, getText[0].value, getWinnerFew[0].historyId)
        await model.commitTransaction()
        return res.send({
            message: "Success",
            status: 200,
            data: {}
        })
    } catch (error) {
        console.log("error", error)
        await model.rollback()
        return res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)