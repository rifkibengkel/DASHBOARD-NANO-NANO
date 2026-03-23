import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model";
import { parsingIdentity } from "@/lib/serverHelper";
import { getProgramId } from "../master";
import dayjs from "dayjs";

const tkn = process.env.SAP;

interface editParams {
  // promoId: number
  winnerId: number;
  shippingId: number;
  link: string;
  courierName: string;
  courierPhone: string;

  itemSize: string;

  address: string;
  address2: string;
  address3: string;
  address4: string;
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

    const user: any = await model.getUser(session?.username);

    const programId: any = await getProgramId();

    const params = {
      // promoId: parseInt(decryp.promoId),
      winnerId: parseInt(decryp.winnerId),
      shippingId: decryp.shippingId,
      link: "",
      courierName: decryp.courierName,
      courierPhone: decryp.courierPhone,
      itemSize: decryp.itemSize,

      address: decryp.address,
      address2: decryp.address2 || ".",
      address3: decryp.address3 || ".",
      address4: decryp.address4 || ".",
      kodepos: decryp.kodepos,
      district_id: decryp.district_id,
      master_program_id: parseInt(programId[0].value),
      master_prize_id: decryp.master_prize_id,
      quantity: decryp.quantity,
      receiver_name: decryp.receiver_name,
      receiver_phone: decryp.receiver_phone,
      approver: decryp.approver,
    } as editParams;
    const getWinnerFew: any = await model.getWinnerFw(params.winnerId);
    if (getWinnerFew.length < 1) {
      return res.status(400).send({
        message: "winner not found",
        status: 400,
        data: {},
        error: "winner not found",
      });
    }
    // if (params.shippingId === 1) {
    const pushUrl: any = await model.getSAP();
    let response = await fetch(`${pushUrl[0].push}/api/auth/pickup-send`, {
      method: "POST",
      body: JSON.stringify({
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
        approver: params.approver,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tkn}`,
      },
    });
    if (response.status >= 400) {
      throw new Error("error");
    }

    // }

    // const pushUrl: any = await model.getURLSent()
    // let response = await fetch(pushUrl[0].push, {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         // promoId: params.promoId,
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
    // if (response.status >= 400) {
    //     throw new Error("error")
    // }
    // await model.updatePrizeSize(params.winnerId, params.itemSize, user[0].id);
    await model.updateSAPStatus(
      dayjs().format("YYYY-MM-DD HH:mm:ss"),
      params.winnerId,
      user[0].id,
      1
    );
    return res.send({
      message: "Success",
      status: 200,
      data: {},
    });
  } catch (error) {
    console.log("error", error);
    await model.rollback();
    return res.status(500).send({ message: "Failed", data: {} });
  }
};
export default protectAPI(handler);
