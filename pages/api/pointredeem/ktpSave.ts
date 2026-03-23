import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model";
import { parsingIdentity } from "@/lib/serverHelper";

interface editParams {
  id: number;
  hp: string;
  voucherId: number;
  status: number;
  userId: number;
  ktpName?: string;
  ktpNumber?: string;
  ktpAddress?: string;
  invalidId?: number;
  coupon?: string;
  prizeType?: number;
  approve?: number;
  entriesId?: number;
  itemSize?: string;
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

    const params = {
      id: decryp.id,
      ktpName: decryp.ktpName,
      ktpNumber: decryp.ktpNumber,
      ktpAddress: decryp.ktpAddress,
      itemSize: decryp.itemSize,
      // coupon: decryp.coupon,
      // voucherId: decryp.prizeType,
      status: 1,
      approve: 1,
      // invalidId: decryp.invalidId,
      // entriesId: decryp.entriesId,
      userId: +user?.[0]?.id || 0,
    } as editParams;

    // if(params.invalidId === 17) {
    //     params.approve = 2
    //     params.status = 3
    // }

    const getWinnerFew: any = await model.getWinnerFw(params.id);
    if (getWinnerFew.length < 1) {
      return res.status(400).send({
        message: "winner not found",
        status: 400,
        data: {},
        error: "winner not found",
      });
    }

    await model.startTransaction();
    await model.editWinnerKTPOnly2(params);
    // await model.editCoupon(params)
    await model.commitTransaction();
    return res.send({
      message: "Success",
      status: 200,
      data: {
        message: "",
        is_valid: 1,
      },
    });
  } catch (error) {
    console.log("error", error);
    await model.rollback();
    return res.status(500).send({ message: "Failed", data: {} });
  }
};
export default protectAPI(handler);
