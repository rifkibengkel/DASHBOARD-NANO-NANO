import { getLoginSession } from "@/lib/auth";
import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import {
  attachments,
  attachmentsFromEntries,
  deleteAttachment,
  getEntriesId,
} from "./_model";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // masuk sini
    await cors(req, res);

    const session: any = await getLoginSession(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    if (req.method === "GET") {
      const id = req.query?.id?.toString() || "0";

      let entriesId: any = await getEntriesId(id);

      let images = [];
      const data = await attachments(id, req.query?.type);

      const data2 = await attachmentsFromEntries(
        entriesId[0].entriesId,
        req.query?.type
      );

      return res.json(data);
    }
    if (req.method === "DELETE") {
      const id = req.query?.id?.toString() || "0";
      await deleteAttachment(id);
      return res.json({ message: "Success", data: {} });
    }
    return res.status(403).json({ message: "Forbidden!" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
