import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model";

interface editParams {
  id: number;
  hp: string;
  voucherId: number;
  status: number;
  userId: number;
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
    const user: any = await model.getUser(session?.username);
    const { id, hp, voucherId, status } = req.body;
    const params = {
      id: +id || 0,
      hp: hp?.toString() || "",
      voucherId: +voucherId || null,
      status: +status || 0,
      userId: +user?.[0]?.id || 0,
    } as editParams;
    await model.editWinner(params);
    return res.send({
      message: "Success",
      data: {},
    });
  } catch (error) {
    return res.status(500).send({ message: "Failed", data: {} });
  }
};
export default protectAPI(handler);
