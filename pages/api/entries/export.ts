import type { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
// import { pagination, hashPassword } from "../../../lib/serverHelper";
import * as model from "./_model";
import protectAPI from "../../../lib/protectApi";
import Cors from "../../../lib/cors";
import dayjs from "dayjs";
import { IPagination } from "../../../interfaces/entries.interface";

const excel = require("node-excel-export");

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

    const {
      row,
      key,
      direction,
      column,
      page,
      startDate,
      endDate,
      media,
      isValid,
      isValidAdmin,
      isApprovedAdmin,
      storeId,
    } = req.query;

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
      media,
      storeId,
    } as IPagination;

    // let response: any = [];

    // const getMonths = await model.getMonths()

    let offset = 0;

    let curRow = 10000;
    let bundle: any = [];

    offset = 0;

    const response = await model.xport2(params);
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
      `attachment;filename=${dayjs().format("DD-MM-YYYY")}_listEntries.xlsx`
    );
    res.send(report);

    // return res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);

// import type { NextApiRequest, NextApiResponse } from "next";
// import { getLoginSession } from "@/lib/auth";
// import { csvMaker } from "../../../lib/serverHelper";
// import * as model from "./_model";
// import protectAPI from "../../../lib/protectApi";
// import Cors from "../../../lib/cors";
// import { IPagination } from "../../../interfaces/entries.interface";
// import * as fs from "fs";
// import dayjs from "dayjs";
// const appRoot = require("app-root-path");
// const excel = require("node-excel-export");

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   try {
//     await Cors(req, res);

//     const session = await getLoginSession(req);
//     if (!session) {
//       return res.status(401).json({ message: "Unauthorized!" });
//     }

//     if (req.method !== "GET") {
//       return res.status(403).json({ message: "Forbidden!" });
//     }

//     const {
//       row,
//       key,
//       direction,
//       column,
//       page,
//       startDate,
//       endDate,
//       media,
//       isValid,
//       isValidAdmin,
//       isApprovedAdmin,
//       storeId,
//     } = req.query;

//     let params = {
//       row,
//       key,
//       direction,
//       column,
//       page,
//       startDate,
//       endDate,
//       isValid,
//       isValidAdmin,
//       isApprovedAdmin,
//       media,
//       storeId,
//     } as IPagination;

//     // download file mode
//     // let response: any = [];

//     const locPath = `${appRoot}/../exports`;
//     console.log(locPath);

//     // const getMonths = await model.getMonths()

//     let offset = 0;

//     let curRow = 10000;
//     let bundle: any = [];
//     // for (let c = 0; c < getMonths.length; c++) {
//     if (!fs.existsSync(locPath)) {
//       fs.mkdirSync(locPath, { recursive: true });
//     }

//     offset = 0;

//     // curRow = 10000;

//     fs.writeFileSync(`${locPath}/listEntries.csv`, "");

//     const response = await model.xport2Special(params, offset);
//     // bundle = csvMaker(response);

//     fs.appendFile(`${locPath}/listEntries.csv`, bundle, (err) => {
//       if (err) {
//         console.log(err);
//       }
//     });

//     console.log(response, "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");

//     // offset += 10000;
//     // curRow = response.length;

//     let obejctDefine: any = [];
//     console.log(obejctDefine, "qweqeqeqweqweq");
//     console.log(response);

//     if (response.length < 1) {
//       obejctDefine = [];
//     } else {
//       obejctDefine = Object.keys(response[0]);
//     }

//     const styles = {
//       headerDark: {
//         fill: {
//           fgColor: {
//             rgb: "FFFFFF",
//           },
//         },
//         font: {
//           color: {
//             rgb: "000000",
//           },
//           sz: 14,
//           bold: true,
//           underline: true,
//           textAlign: "center",
//         },
//       },
//     };

//     let specification: any = {};
//     for (let index = 0; index < obejctDefine.length; index++) {
//       specification[`${obejctDefine[index]}`] = {
//         displayName: obejctDefine[index],
//         headerStyle: styles.headerDark,
//         width: 30,
//       };
//     }

//     const report = excel.buildExport([
//       {
//         name: "Report",
//         specification: specification,
//         data: response,
//       },
//     ]);

//     res.setHeader(
//       "Content-disposition",
//       `attachment;filename=${dayjs().format("DD-MM-YYYY")}_ExportList.xlsx`
//     );

//     res.send(report);
//     // console.log(res.send(report), "ppppppppppppppppp");

//     // fs.appendFile(`${locPath}/listEntries_${getMonths[c].date}.xlsx`, report, (err) => {
//     //   if (err) {
//     //     console.log(err);
//     //   }
//     // });
//     // }
//     // return res.status(200).json({ message: "ok" });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export default protectAPI(handler);
