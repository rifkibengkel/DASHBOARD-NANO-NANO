import { getLoginSession } from "@/lib/auth"
import cors from "@/lib/cors"
import protectAPI from "@/lib/protectApi"
import {NextApiRequest, NextApiResponse} from "next"
import * as model from "./_model"

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
        const {province, regency, district, code} = req.body.data
        if ((province || "").length < 1 || (regency || "").length < 1 || (district || "").length < 1) {
            return res.status(400).json({message: "Parameter Not valid", data: {}})
        }
        const provinceCode = code.substring(0, 2)
        const regencyCode = code.substring(0, 4)
        const districtCode = code
        const checkProvince: any = await model.checkProvince(provinceCode)
        let provinceId = checkProvince?.[0]?.id || 0
        if (checkProvince.length < 1) {
            const insert: any = await model.insertProvince(provinceCode, province)
            provinceId = insert.insertId
        }
        const checkRegency: any = await model.checkRegecy(regencyCode)
        let regencyId = checkRegency?.[0]?.id || 0
        if (checkRegency.length < 1) {
            const insert: any = await model.insertRegency(regencyCode, regency, provinceId)
            regencyId = insert.insertId
        }
        const checkDistrict: any = await model.checkDistrict(districtCode)
        let districtId = checkDistrict?.[0]?.id || 0
        if (checkDistrict.length < 1) {
            const insert: any = await model.insertDistrict(districtCode, district, regencyId)
            districtId = insert.insertId
        }
        return res.json({message: "Success", data: {}})
    } catch (error: any) {
        return res.status(500).json({message: error.message, data: {}})
    }
}

export default protectAPI(handler)