import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model"
// import { parsingIdentity } from "@/lib/serverHelper";
import axios from "axios";

const tkn = process.env.SAP

interface editParams {
    // promoId: number
    winnerId: number
    shippingId: number
    link: string
    courierName: string
    courierPhone: string

    address: string
    address2: string
    address3: string
    address4: string
    kodepos: number | string
    district_id: number
    master_program_id: number
    master_prize_id: number
    quantity: number
    receiver_name: string
    receiver_phone: number | string
    approver: string
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
        const decryp = JSON.parse(Buffer.from(ectrd, 'base64').toString('ascii'))

        // const user: any = await model.getUser(session?.username)

        const brandId: any = await model.getPromoIdSAP()

        let params: editParams = {
            // promoId: parseInt(decryp.promoId),
            winnerId: parseInt(decryp.winnerId),
            shippingId: decryp.shippingId,
            link: "",
            courierName: decryp.courierName,
            courierPhone: decryp.courierPhone,

            address: decryp.address || "",
            address2: decryp.address2 || "",
            address3: decryp.address3 || "",
            address4: decryp.address4 || "",
            kodepos: decryp.kodepos.toString(),
            district_id: decryp.district_id.toString(),
            master_program_id: brandId[0].value,
            master_prize_id: decryp.master_prize_id.toString(),
            quantity: decryp.quantity.toString(),
            receiver_name: decryp.receiver_name,
            receiver_phone: decryp.receiver_phone.toString(),
            approver: decryp.approver
        }

        // if (decryp.shippingId === 1) {
        //     params = {
        //         promoId: parseInt(decryp.promoId),
        //         winnerId: parseInt(decryp.winnerId),
        //         shippingId: decryp.shippingId,
        //         link: "",
        //         courierName: decryp.courierName,
        //         courierPhone: decryp.courierPhone,

        //         address: decryp.address,
        //         kodepos: decryp.kodepos.toString(),
        //         district_id: decryp.district_id.toString(),
        //         master_program_id: brandId[0].value,
        //         master_prize_id: decryp.master_prize_id.toString(),
        //         quantity: decryp.quantity.toString(),
        //         receiver_name: decryp.receiver_name,
        //         receiver_phone: decryp.receiver_phone.toString(),
        //         approver: decryp.approver
        //     }
        // } else {
        //     params = {
        //         promoId: parseInt(decryp.promoId),
        //         winnerId: parseInt(decryp.winnerId),
        //         shippingId: decryp.shippingId,
        //         link: "",
        //         courierName: decryp.courierName,
        //         courierPhone: decryp.courierPhone,
        //         address: "",
        //         kodepos: "",
        //         district_id: 0,
        //         master_program_id: 0,
        //         master_prize_id: 0,
        //         quantity: 0,
        //         receiver_name: "",
        //         receiver_phone: '',
        //         approver: '',
        //     }
        // }

        const getWinnerFew: any = await model.getWinnerFw(params.winnerId)
        if (getWinnerFew.length < 1) {
            return res.status(400).send({
                message: "winner not found",
                status: 400,
                data: {},
                error: "winner not found"
            })
        } else if(getWinnerFew[0].is_approved == 1) {
            return res.status(400).send({
                message: "winner already approved",
                status: 400,
                data: {},
                error: "winner already approved"
            })
        }

        const historyId = await model.getHistoryId(params.winnerId)

        // if (params.shippingId === 1) {
            const pushUrlSAP: any = await model.getSAP()
            const pushNotif: any = await model.getPushNotif()
            // const getDistrictName: any = await axios.get(`${pushUrlSAP[0].push}/api/auth/search-district/${params.district_id}`, {headers: {'Content-Type': 'application/json',
            // 'Authorization': `${tkn}`}})

            // const distName = getDistrictName.data[0].district_name

            // await model.updateSAPtoEntriesData(params.address, params.kodepos, distName, params.quantity, params.receiver_name, params.receiver_phone, params.approver, params.winnerId)
            
            let response1 = await axios.post(`${pushUrlSAP[0].push}/api/auth/pickup-send`, {
                    address1: params.address,
                    address2: params.address2,
                    address3: params.address3,
                    address4: params.address4,
                    kodepos: params.kodepos,
                    district_id: params.district_id,
                    master_program_id: params.master_program_id,
                    master_prize_id: params.master_prize_id,
                    quantity: params.quantity,
                    receiver_name: params.receiver_name,
                    receiver_phone: params.receiver_phone,
                    receiver_phone2: "",
                    approver: params.approver
                },{
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${tkn}`
                    }
                }
            ).then(res => res)
            if (parseInt(response1.data.statusCode) >= 400) {
                return res.status(400).send({
                    message: response1.data.data,
                    status: 400,
                    data: {},
                    error: response1.data.data
                })
            }


        // }

        // const pushUrl: any = await model.getURLSent()
        // let response2 = await fetch(pushUrl[0].push, {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         promoId: params.promoId,
        //         winnerId: params.winnerId,
        //         shippingId: decryp.shippingId,
        //         link: params.link,
        //         courierName: decryp.courierName,
        //         courierPhone: decryp.courierPhone,
        //     }),
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }
        // })
        // if (response2.status >= 400) {
        //     return res.status(400).send({
        //         message: response2,
        //         status: 400,
        //         data: {},
        //         error: response2
        //     })
        // }
        await model.updateWinnerData(params.winnerId, session.id)
        await model.addHistoryDetail(historyId[0].id, 'Hadiah dalam proses.')

        const respSucc: any = await model.getSuc(Number(decryp.master_prize_id) == 2 ? 'IPHONE 14': 'Logam Mulia 5Gr', 'successResp')
        await axios.post(`${pushNotif[0].push}`, {
            userId: getWinnerFew[0].mobileId,
            title: 'Verifikasi Hadiah',
            content: respSucc[0].push,
            data: {},
            type: 'app'
        },{
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )
    
    return res.send({
        message: "Success",
        status: 200,
        data: {}
    })
    } catch (error) {
        await model.rollback()
        return res.status(500).send({ message: error, data: {} })
    }
}
export default protectAPI(handler)