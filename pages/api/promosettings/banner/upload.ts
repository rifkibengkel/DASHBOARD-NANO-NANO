import { NextApiRequest, NextApiResponse } from 'next';
import { exeQuery, } from "@/lib/db";
import nc from "next-connect";
const multer = require("multer");
import path from "path";
const appRoot = require("app-root-path")



export type SuccessfulResponse<T> = { data: T; error?: never; statusCode?: number };
export type UnsuccessfulResponse<E> = { data?: never; error: E; statusCode?: number };

export type ApiResponse<T, E = unknown> = SuccessfulResponse<T> | UnsuccessfulResponse<E>;

interface NextConnectApiRequest extends NextApiRequest {
    files: Express.Multer.File[];
  }

type ResponseData = ApiResponse<string[], string>;
export const config = {
  api: {
    bodyParser: false,
  },
};
const handler = nc({
    onError(error, req: NextConnectApiRequest, res: NextApiResponse<ResponseData>) {
      res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
    },
    onNoMatch(req: NextConnectApiRequest, res: NextApiResponse<ResponseData>) {
      res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    },
  });

function checkFileType(file: any, cb: any) {
    // const filetypes = /xls|xlsx|csv|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel/; //alowed ext
    const filetypes = /png|jpg|jpeg|webp/; //alowed ext
    //check ext
    const extname = filetypes.test(path.extname((file.originalname).replace(/\s/g, "")).toLowerCase());
    //check mime
    const mimetype = filetypes.test(file.mimetype);

    //check if ext is true
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Extension Suport PNG/JPEG/JPG"));
    }
}

let storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, `${appRoot}/../public/banner/`);
    },
    filename: function (req: any, file: any, cb: any) {
        const files: string = (file.originalname).replace(/\s/g, "");
        cb(null, + Date.now() + files);
    },
});

let upload = multer({
  storage: storage,
//   fileFilter: function (req: any, file: any, cb: any) {
//     // checkFileType(file, cb);
// }
});

let uploadFile = upload.single("file");
handler.use(uploadFile);
handler.post(async (req: any, res: any) => {
  const paramUrl: any = await exeQuery(`select * from general_parameter where name = 'imgUrl'`, [])
  let url = paramUrl[0].value
  let id = req.body.id === 0 ? null : req.body.id
  let sort = req.body.sort
  let filename = req.file === undefined ? null : url + '/api/images/banner/' + req.file.filename

  if(id === '0' || id === 'undefined') {
    let result: any = await exeQuery("INSERT INTO banner (url_picture, sort, status) VALUES ($1,$2, 1)", [
      filename, sort
    ]);
    res.status(200).send({
      result: result
    });  
  } else {
    if(filename === null) {
      let result: any = await exeQuery("UPDATE banner SET sort = $1 WHERE id = $2", [
        sort, id 
      ]);
      res.status(200).send({
        result: result
      });
    } else {
      let result: any = await exeQuery("UPDATE banner SET url_picture = $1, sort = $2 WHERE id = $3", [
        filename, sort, id 
      ]);
      res.status(200).send({
        result: result
      });
    }
  }
  // let result: any = await exeQuery("INSERT INTO news (id, title, content, url) VALUES (?,?)", [
  //   id, title, content, filename
  // ]);
  // res.status(200).send({
  //   result: result
  // });
});

export default handler;