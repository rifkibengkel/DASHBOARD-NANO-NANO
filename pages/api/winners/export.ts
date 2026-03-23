import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model"
// import {getData} from "../allocations/categories";
import * as fs from "fs"
import { csvMaker } from "@/lib/serverHelper";
import dayjs from "dayjs"
const appRoot = require("app-root-path");
const excel = require('node-excel-export')
interface WnPagination {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    isHaveAtt: number | string
    media: string
    startDate: string
    endDate: string
    prize: string
    prizeId: string
    userType: string
    isValid: string
    isApproved: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await cors(req, res)
        const session: any = await getLoginSession(req);
        if (!session) {
            return res.status(401).json({message: "Unauthorized!"});
        }

        if (req.method !== "GET") {
            return res.status(403).json({message: "Forbidden!"});
        }
        const {row, key, direction, column, page, startDate, endDate, prize, prizeId, userType, isValid, isApproved} = req.query
        let params = {
            row,
            key,
            startDate,
            endDate,
            direction,
            column,
            page,
            prize,
            prizeId,
            userType,
            isValid,
            isApproved
        } as WnPagination

    // file download mode
    let response: any = []

    let offset = 0

    let curRow = 10000

    let bundle: any = []
    const filename = `${dayjs().format('YYYY-MM-DD_HHmmss')}_listWinner(loading...).csv`

    const completedFilename = `${dayjs().format('YYYY-MM-DD_HHmmss')}_listWinner.csv`
    const locPath = `${appRoot}/../exports`

    if (!fs.existsSync(locPath)) {
        fs.mkdirSync(locPath, {recursive: true})
    }
    fs.writeFileSync(`${locPath}/${filename}`, '')

    do {
        response = await model.exprtWinnerWTr(params, offset);
        bundle = csvMaker(response)
        fs.appendFile(`${locPath}/${filename}`, bundle, (err) => {
            if (err) {
                console.log(err);
            }
        });
        offset += 10000
        curRow = response.length
    }
    while (curRow == 10000);

    fs.rename(`${locPath}/${filename}`, `${locPath}/${completedFilename}`, (error) => {
        if (error) {
          console.log(error);
        }
      });
      return res.status(200).json({ message: 'ok' });
    // original
    // const response = await model.exprtWinner(params);

    // let obejctDefine: any
    //     if (response.length < 1) {
    //         obejctDefine = []
    //     } else {
    //         obejctDefine = Object.keys(response[0])
    //     }
    //     const styles = {
    //         headerDark: {
    //             fill: {
    //                 fgColor: {
    //                     rgb: "FFFFFF",
    //                 },
    //             },
    //             font: {
    //                 color: {
    //                     rgb: "000000",
    //                 },
    //                 sz: 14,
    //                 bold: true,
    //                 underline: true,
    //                 textAlign: "center",
    //             },
    //         },
    //     };
    //     let specification: any = {};
    //     for (let index = 0; index < obejctDefine.length; index++) {
    //         specification[`${obejctDefine[index]}`] = {
    //             displayName: obejctDefine[index],
    //             headerStyle: styles.headerDark,
    //             width: 30
    //         }
    //     }
    //     const report = excel.buildExport([
    //         {
    //             name: "Report",
    //             specification: specification,
    //             data: response,
    //         },
    //     ]);
    //     res.setHeader("Content-disposition", `attachment;filename=${dayjs().format('YYYY-MM-DD_HHmmss')}_listWinner.csv`)
    //     res.send(report);
    
    } catch (err: any) {
        res.status(500).json({message: err.message})
    }
}
export default protectAPI(handler)