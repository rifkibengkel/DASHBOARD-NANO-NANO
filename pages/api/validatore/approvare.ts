import type { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_modello";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import dayjs from "dayjs";
// import axios from 'axios';
import {
  randomString,
  send100ToMail,
  sendCouponToMail,
  validateUploadS3,
} from "@/lib/serverHelper";
import Jimp from "jimp";
import * as fs from "fs";
const appRoot = require("app-root-path");

const generateImageFromBuffer = (buffer: any) => {
  let _buffer = Buffer.from(buffer, "base64");
  return _buffer.toString("base64");
};

export async function approveThis(rqs: any, session: any) {
  const decryp = JSON.parse(Buffer.from(rqs, "base64").toString("ascii"));
  const getUser: any = await model.getUser(session.username);

  const entryId = decryp.entryId || "0";

  if (entryId === "0") {
    return {
      error: {
        type: "error",
        message: "No Entry ID",
        description: "Error",
      },
    };
  }

  let chkApprove: any = await model.checkApproveAdmin(entryId);

  if (chkApprove[0].is_approved_admin == 1) {
    return {
      error: {
        type: "error",
        message: "Entry Already Approved",
        description: "Error",
      },
    };
  }

  const getBrandId = await model.getBrandId();

  const chkMaxFirstSubmitter = await model.getMax();

  let maxP = Number(chkMaxFirstSubmitter[0].value);
  const fewEntry: any = await model.getFewEntry(entryId);

  let {
    name,
    voucher_number,
    email,
    id_number,
    userId,
    purchase_amount_admin,
    sender,
    rcvd_time,
  } = fewEntry[0];

  const countWinnerFirst100 = await model.countFirst100();
  const check1Winner1User = await model.checkUniqueUserOnWinner(userId);

  let insWinner: any;
  let mailAttachments: any[] = [];
  let imgSets: any = [];
  try {
    await model.startTransaction();

    const minimumPurchase: any = await model.getGeneralParameterById("9");
    let getTotC =
      Number(purchase_amount_admin) / Number(minimumPurchase[0].param);
    // let getTotC = Number(150000) / Number(minimumPurchase[0].param)

    let totalCouponsAllowed = Math.floor(getTotC);

    //first 100 winner gets pulsa
    const limitWin: any = await model.getGeneralParameterById("10");
    const countWin: any = await model.checkWinnerLimit();
    if (countWin[0].counts < limitWin[0].param) {
      // const urlPush: any = await model.getPushApprove(promoId)
      // axios.post(`${urlPush[0].value}`, {
      //     promoId: promoId,
      //     entriesId: entryId
      // }).then(res => {
      //     console.log('res', res.status);
      // }).catch(err => {
      //     console.log('error in request', err);
      // });
    }

    let coupon;
    let findExisting;
    let couponStack: any[] = [];

    if (voucher_number == "" || voucher_number == null) {
      for (let x = 0; x < totalCouponsAllowed; x++) {
        coupon = await randomString(6, "34679QWERTYUPADFGHJKLXCVNM");
        findExisting = await model.findCouponExist(coupon);
        if (findExisting.length < 1) {
          if (!(couponStack.indexOf(coupon) !== -1)) {
            couponStack.push(coupon);
          } else {
            x--;
          }
        } else {
          x--;
        }
      }

      const data = await model.approveEntryAdmin(
        getUser[0].id,
        couponStack.toString(),
        entryId
      );
    } else {
      await model.approveEntryAdmin2(getUser[0].id, entryId);
    }

    // if (Number(countWinnerFirst100[0].total) < maxP) {
    //     if (check1Winner1User[0].counts < 1) {
    //         insWinner = await model.insertPulsaWinner(entryId, userId, sender, getBrandId[0].id)
    //     }
    // }

    const [mainText] = await Promise.all([
      Jimp.loadFont(Jimp.FONT_SANS_32_BLACK),
    ]);

    //process multi img
    if (voucher_number == "" || voucher_number == null) {
      for (let x = 0; x < couponStack.length; x++) {
        let processImage = (
          await Jimp.read(`${appRoot}/../acnemedCoupon.png`)
        ).resize(400, 225);
        processImage.print(mainText, 200, 110, couponStack[x]);

        let bufferImage: Buffer = await processImage.getBufferAsync(
          processImage._originalMime
        );
        let filename = `${email}-${couponStack[x]}.png`;
        let locPath = `${appRoot}/../public/coupons`;
        let apiImage = `${filename}`;

        await model.insertEntriesCoupon(entryId, filename);

        if (!fs.existsSync(locPath)) {
          fs.mkdirSync(locPath, { recursive: true });
        }
        fs.writeFileSync(`${locPath}/${filename}`, bufferImage);
        await validateUploadS3(
          filename,
          generateImageFromBuffer(bufferImage) as unknown as string
        );

        mailAttachments.push({
          filename: filename,
          path: `${locPath}/${filename}`,
          cid: `uni${x}@cid`, //same cid value as in the html img src
        });
        imgSets.push(`uni${x}@cid`);
      }
    }
    await model.commitTransaction();
    return "Saved";
  } catch (error) {
    // console.log(error);
    await model.rollback();
    // console.log("err", error);
    return {
      error: {
        type: "error",
        message: error,
        description: error,
      },
    };
  } finally {
    console.log("now send email");
    // if (Number(countWinnerFirst100[0].total) < maxP) {
    //     if (check1Winner1User[0].counts < 1) {
    //         send100ToMail(name, sender, fewEntry[0].email, insWinner.id)
    //     }
    // }
    sendCouponToMail(
      name,
      sender,
      imgSets,
      rcvd_time,
      fewEntry[0].email,
      mailAttachments
    );
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
    const datas: any = await approveThis(data, session);

    if (datas.error) {
      res.status(400).json({ status: 400, error: datas.error.message });
    } else {
      return res.json({ status: 200, datas });
    }
  } catch (err: any) {
    console.log(err, "ERR");
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
