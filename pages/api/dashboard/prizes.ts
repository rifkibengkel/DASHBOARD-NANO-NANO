import { NextApiRequest, NextApiResponse } from "next";
import Cors from "../../../lib/cors"
import { getLoginSession } from '@/lib/auth';
import dayjs from "dayjs";
import protectAPI from "../../../lib/protectApi";
import * as model from "./_model";

export async function getData() {
    const thrs = dayjs().format('YYYY-MM-DD 00:00:00')
    const data: any = await model.summaryPrize(thrs)

    const dataPulsa: any = await model.summaryPrizePulsa()

    const przMap: any = await model.prizeMapper()

    const przNames: any = await model.getPrizeSubName()

    const tempPrize = przNames.map((entry: any) => entry.name_sub)
    let fixData: any = []
    let dateTemp = ""
    let dataObj: any = {}

    for (const item of data) {
        const prizeCode = item.code
        const date = dayjs(item.date).format("YYYY-MM-DD")
        const qtyAll = parseInt(item.quantity)
        const qtyUsed = parseInt(item.used)
        const qtyUnused = qtyAll - qtyUsed

        if (date != dateTemp) {
            dateTemp = date
            if (Object.keys(dataObj).length !== 0) {
                for (const prizeCode of tempPrize) {
                    dataObj[`${prizeCode}All`] = 0
                    dataObj[`${prizeCode}Unused`] = 0
                    dataObj[`${prizeCode}Used`] = 0
                }
                fixData.push(dataObj)
                dataObj = {}
            }
        }

        dataObj["date"] = date

        const idxTempCtgr = tempPrize.indexOf(prizeCode)
        if (idxTempCtgr > -1) {
            tempPrize.splice(idxTempCtgr, 1)
        }

        if (dataObj[`${prizeCode}Used`] && dataObj[`${prizeCode}All`]) {
            dataObj[`${prizeCode}All`] += qtyAll
            dataObj[`${prizeCode}Used`] += qtyUsed
            dataObj[`${prizeCode}Unused`] += qtyUnused
        } else {
            dataObj[`${prizeCode}All`] = qtyAll
            dataObj[`${prizeCode}Unused`] = qtyUnused
            dataObj[`${prizeCode}Used`] = qtyUsed
        }
    }

    if (Object.keys(dataObj).length !== 0) {
        for (const prizeCode of tempPrize) {
            dataObj[`${prizeCode}All`] = 0
            dataObj[`${prizeCode}Unused`] = 0
            dataObj[`${prizeCode}Used`] = 0
        }
        fixData.push(dataObj)
    }
    return { fixData, fixDataPulsa: dataPulsa, przMap }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== "GET") {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const getSumEntries = await getData()
        return res.json(getSumEntries)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }

}

export default protectAPI(handler)