import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model";
// import { parsingIdentity } from "@lib/helper";
import axios from "axios";
import dayjs from "dayjs";

const tkn = process.env.SAP;

interface editParams {
  promoId: number;
  winnerId: number;
  shippingId: number;
  link: string;
  courierName: string;
  courierPhone: string;

  address: string;
  kodepos: number | string;
  district_id: number;
  master_program_id: number;
  master_prize_id: number;
  quantity: number;
  receiver_name: string;
  receiver_phone: number | string;
  approver: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await cors(req, res);

    const session: any = await getLoginSession(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    if (req.method !== "POST") {
      return res.status(403).json({ message: "Forbidden!" });
    }

    const ectrd = req.body.data;
    const decryp = JSON.parse(Buffer.from(ectrd, "base64").toString("ascii"));
    // console.log(decryp)
    await model.updateSAPStatus(
      dayjs().format("YYYY-MM-DD HH:mm:ss"),
      decryp.id,
      session.id,
      parseInt(decryp.status)
    );

    const getHistoryDetId = await model.getHisDetId(
      decryp.id,
      parseInt(decryp.status) == 2 ? "Dalam Pengiriman" : "Diterima"
    );

    await model.updateHistoryDet(getHistoryDetId[0].id);

    return res.send({
      message: "Success",
      status: 200,
      data: {},
    });
  } catch (error) {
    await model.rollback();
    return res.status(500).send({ message: error, data: {} });
  }
};
export default protectAPI(handler);
