import type { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from '@/lib/auth';;
// import { pagination, hashPassword } from "../../../lib/serverHelper";
import * as model from "./_model";
import protectAPI from "../../../lib/protectApi";
import Cors from "../../../lib/cors";
import dayjs from "dayjs";

interface IPagination {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    media: string
    startDate: string
    endDate: string
    isValid: string | number
    isValidAdmin: string | number
    isApprovedAdmin: string | number
    type?: string
}

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

    const {row, key, direction, column, page, startDate, endDate} = req.query

        let params = {
            row,
            key,
            direction,
            column,
            page,
            startDate,
            endDate
        } as IPagination

    let response: any = await model.xportByProducts(params);
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
        res.setHeader("Content-disposition", `attachment;filename=${dayjs().format("DD-MM-YYYY")}_listEntriesProducts.xlsx`)
        res.send(report);

    // return res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
