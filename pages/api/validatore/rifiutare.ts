import type { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_modello";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import nodemailer from "nodemailer";
import dayjs from "dayjs";

export async function RejectThisOne(rqs: any, session: any) {
  const getUser: any = await model.getUser(session.username);
  const decryp = JSON.parse(Buffer.from(rqs, "base64").toString("ascii"));

  const entryId = decryp.entryId ? decryp.entryId : "0";
  const rejectId = decryp.rejectId ? decryp.rejectId : "0";
  const userId = decryp.userId ? decryp.userId : "0";

  const fewEntry: any = await model.getFewEntry(entryId);

  let { name, email, id_number, sender, rcvd_time, hp } = fewEntry[0];

  try {
    const invReason: any = await model.getInvalidReasonById(rejectId);

    await model.startTransaction();
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 465,
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const sendMale = await transporter.sendMail({
      from: process.env.MAIL_FROM, // sender address
      to: fewEntry[0].email, // list of receivers
      subject: "[Microsite Acnemed] - Informasi Upload Struk Pembelian", // Subject line
      // text: "Hello world", // plain text body
      html: `<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Notification</title>
<style>
    body {
        font-family: Arial, sans-serif;
    }
    .container {
        padding: 20px;
    }
    .header {
        font-size: 24px;
        margin-bottom: 10px;
    }
    .content {
        font-size: 16px;
        margin-bottom: 20px;
    }
    .image-container {
        text-align: center;
        margin-bottom: 20px;
    }
    .image-container img {
        max-width: 100%;
        height: auto;
    }
    .footer {
        font-size: 14px;
    }
</style>
</head>
<body>
<div class="container">
    <div class="header">Hai Fellas!</div>
    <div class="content">
        ${name} - ${sender}
    </div>
    <div class="content">
        Terima kasih, struk yang kamu kirimkan pada tanggal ${dayjs(
          rcvd_time
        ).format("DD/MM/YYYY")} TIDAK VALID karena ${invReason[0].name}
    </div>
    <div class="footer">
        Ayo, terus beli produk dari Petualang Nano Nano dan menangkan hadiahnya!
    </div>
</div>
</body>
</html>`,
    });

    const x = await model.rejectThis(rejectId, userId, entryId);
    await model.commitTransaction();
    return "done";
  } catch (error) {
    console.log(error);
    await model.rollback();
    return {
      error: {
        type: "error",
        message: error,
        description: error,
      },
    };
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await Cors(req, res);

    const session: any = await getLoginSession(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    if (req.method !== "POST") {
      return res.status(403).json({ message: "Forbidden!" });
    }

    const data = req.body.data;
    const datas: any = await RejectThisOne(data, session);
    if (datas.error) {
      res.status(400).json({ status: 400, error: datas.error.message });
    } else {
      return res.json({ status: 200, datas });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
