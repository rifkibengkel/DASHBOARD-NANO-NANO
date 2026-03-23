import type { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_modello";
import protectAPI from "../../../lib/protectApi";
import Cors from "../../../lib/cors";
import dayjs from "dayjs";
import { SaveDataEntry } from "@/interfaces/entries.interface";
import nodemailer from "nodemailer";
import axios from "axios";

export async function saveThis(rqs: any, session: any) {
  const decryp = JSON.parse(Buffer.from(rqs, "base64").toString("ascii"));
  const trx = decryp.trx || 0;
  const entryId = decryp.entryId || "0";
  const purchaseDate = decryp.purchaseDate || null;
  const totalAmount = decryp.totalAmount || 0;
  const products = decryp.products || [];
  const isValid = decryp.isValid || "0";
  const storeId = decryp.storeId || 0;
  // const storeType = decryp.storeType
  // const storeChannel = decryp.storeChannel
  // const isStamp = decryp.isStamp || 0
  // const handphone = decryp.handphone || ''
  // const regency = decryp.regency || ''
  // const replyId = decryp.replyId || '0'
  const invalidId = decryp.invalidId || null;
  // const userId = decryp.userId ? decryp.userId : '0'
  const getUser: any = await model.getUser(session.username);
  const userId = getUser[0].id || "0";
  // const promoId = decryp.promoId || '0'
  // console.log(getUser, "UUUUUUUUUUUUUUUUUUU");

  const checkEntry: any = await model.getFewEntry(entryId);

  let invReason: any;
  if (invalidId) {
    invReason = await model.getInvalidReasonById(invalidId);
  }

  let { name, email, id_number, sender, rcvd_time, hp } = checkEntry[0];

  // console.log(name, email, id_number, sender, rcvd_time, hp, "CCCCCCc");

  if (checkEntry[0].length < 1) {
    return {
      error: {
        type: "error",
        message: "No Entry",
        description: "Error",
      },
    };
  }
  try {
    await model.startTransaction();
    let checkSaved: any = await model.areYouThere(entryId);
    if (checkSaved[0].counts > 0) {
      await model.deleteSaved(entryId);
    }

    let cmbTotalAmount = 0;

    for (let i = 0; i < products.length; i++) {
      cmbTotalAmount =
        cmbTotalAmount +
        (products[i].totalPrice ? parseInt(products[i].totalPrice) : 0);
      const quantity = products[i].quantity
          ? parseInt(products[i].quantity)
          : 0,
        prodId = products[i].prodId ? parseInt(products[i].prodId) : 0,
        amount = products[i].price ? parseInt(products[i].price) : 0,
        totalAmount = products[i].totalPrice
          ? parseInt(products[i].totalPrice)
          : 0;

      await model.submitVariant(entryId, prodId, quantity, amount, totalAmount);
    }

    if (invalidId) {
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
        to: email, // list of receivers
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

      // await model.rejectThis(invalidId, userId, entryId)
      // } else {
    }
    let params = {
      // purchaseDate: purchaseDate.toUpperCase() == "INVALID DATE" ? dayjs().format('YYYY-MM-DD HH:mm:ss') : purchaseDate,
      trx,
      purchaseDate,
      totalAmount: cmbTotalAmount ? cmbTotalAmount : totalAmount,
      isValid,
      // replyId,
      invalidId,
      storeId,
      // storeType,
      // storeChannel,
      // isStamp,
      entryId,
      userId,
    } as SaveDataEntry;

    const x = await model.saveEntry2(params);
    await model.commitTransaction();
    return "Saved";
  } catch (error) {
    await model.rollback();
    console.log("error", error);
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

    const session = await getLoginSession(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    if (req.method !== "POST") {
      return res.status(403).json({ message: "Forbidden!" });
    }

    const data = req.body.data;
    const datas: any = await saveThis(data, session);

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
