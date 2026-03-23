import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import {getLoginSession} from "@/lib/auth";
import * as model from "./_model"
// import {parsingIdentity} from "@/lib/serverHelper";

interface editParams {
    id: number
    entriesId: number
    hp: string
    voucherId: number
    status: number
    userId: number
    ktpName?: string
    ktpNumber?: string
    accountNumber?: string
    coupon?: string
    prizeType?: number
    approve?: number
    brandId?: string
    code?: string
    type?: number
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

        const params = {
            id: decryp.id,
            ktpName: decryp.ktpName,
            ktpNumber: decryp.ktpNumber,
            accountNumber: decryp.account_number,
            coupon: decryp.coupon,
            voucherId: decryp.prizeType,
            userId: session.id,
            brandId: "",
            code: "",
            type: 0
        } as editParams
        const getWinnerFew: any = await model.getWinnerFw(params.id)
        if (getWinnerFew.length < 1) {
            return res.status(400).send({
                message: "winner not found",
                status: 400,
                data: {},
                error: "winner not found"
            })
        }

        const historyId = await model.getHistoryId(params.id)

        params.entriesId = getWinnerFew[0].entriesId
        // const getBrandId: any = await model.getBrandId(params.voucherId)
        // if (getBrandId.length < 1) {
        //     return res.status(400).send({
        //         message: "voucher not found",
        //         status: 400,
        //         data: {},
        //         error: "voucher not found"
        //     })
        // }
        // params.brandId = getBrandId[0].brandId;
        // params.code = getBrandId[0].code;
        // params.type = getBrandId[0].type;

        await model.startTransaction()
        await model.editWinnerKTPOnly2(params)
        await model.editWinnerKTPOnly3(params)
        if(getWinnerFew[0].id_number_admin == '') {
            await model.addHistoryDetail(historyId[0].id, 'Verifikasi Hadiah Valid.')
        }
        await model.commitTransaction()
        return res.send({
            message: "Success",
            status: 200,
            data: {
                message: "",
                is_valid: 1
            },
        })
    } catch (error) {
        console.log("error", error)
        await model.rollback()
        return res.status(500).send({message: "Failed", data: {}})
    }
}
export default protectAPI(handler)