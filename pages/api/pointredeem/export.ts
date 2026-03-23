import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model";
// import {getData} from "../allocations/categories";
import dayjs from "dayjs";
const excel = require("node-excel-export");

interface WnPagination {
  row: string | number;
  page: string | number;
  key: string;
  direction: string;
  column: string;
  limit: number | string;
  isHaveAtt: number | string;
  media: string;
  startDate: string;
  endDate: string;
  prizeId: string;
  userType: string;
  isValid: string;
  isApproved: string;
  mode: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await cors(req, res);
    const session: any = await getLoginSession(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    if (req.method !== "GET") {
      return res.status(403).json({ message: "Forbidden!" });
    }
    const {
      row,
      key,
      direction,
      column,
      page,
      startDate,
      endDate,
      prizeId,
      userType,
      isValid,
      isApproved,
      mode,
    } = req.query;
    let params = {
      row,
      key,
      startDate,
      endDate,
      direction,
      column,
      page,
      prizeId,
      userType,
      isValid,
      isApproved,
      mode,
    } as WnPagination;

    let response: any = await model.exprtWinner(params);
    let obejctDefine: any;
    if (response.length < 1) {
      obejctDefine = [];
    } else {
      obejctDefine = Object.keys(response[0]);
    }
    const styles = {
      headerDark: {
        fill: {
          fgColor: {
            rgb: "FFFFFF",
          },
        },
        font: {
          color: {
            rgb: "000000",
          },
          sz: 14,
          bold: true,
          underline: true,
          textAlign: "center",
        },
      },
    };
    let specification: any = {};
    for (let index = 0; index < obejctDefine.length; index++) {
      specification[`${obejctDefine[index]}`] = {
        displayName: obejctDefine[index],
        headerStyle: styles.headerDark,
        width: 30,
      };
    }
    const report = excel.buildExport([
      {
        name: "Report",
        specification: specification,
        data: response,
      },
    ]);
    res.setHeader(
      "Content-disposition",
      `attachment;filename=${dayjs().format("DD-MM-YYYY")}_winner.xlsx`
    );
    res.send(report);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
export default protectAPI(handler);
