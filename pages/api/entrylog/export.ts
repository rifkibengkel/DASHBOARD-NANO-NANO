import type { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from '@/lib/auth';
import { pagination, hashPassword, csvMaker } from "@/lib/serverHelper";
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import { formModal, IPagination } from "@/interfaces/entries.interface";
import dayjs from "dayjs";

const excel = require('node-excel-export')


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await Cors(req, res);

    const session = await getLoginSession(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    if (req.method !== "GET") {
      return res.status(403).json({ message: "Forbidden!" });
    }

    const {row, key, direction, column, page, startDate, endDate, isValid, isValidAdmin, isApprovedAdmin, storeId} = req.query

        let params = {
            row,
            key,
            direction,
            column,
            page,
            startDate,
            endDate,
            isValid,
            isValidAdmin,
            isApprovedAdmin,
            storeId
        } as IPagination

    let response: any = await model.xport2(params);
    // let report = csvMaker(response)
        let obejctDefine: any
        if (response.length < 1) {
            obejctDefine = []
        } else {
            obejctDefine = Object.keys(response[0])
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
                width: 30
            }
        }
        const report = excel.buildExport([
            {
                name: "Report",
                specification: specification,
                data: response,
            },
        ]);
        res.setHeader("Content-disposition", `attachment;filename=${dayjs().format("DD-MM-YYYY")}_listEntries.xlsx`)
        res.send(report);

    // return res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
