// import fs from "fs";
// import path from "path";
// import type { NextApiRequest, NextApiResponse } from "next";
// const appRoot = require("app-root-path");

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   let img: any = req.query.filename ? req.query.filename : null;
//   const imagePath = img.join("/");
//   const filePath = path.resolve(".", `${appRoot}/../public/${imagePath}`);
//   const imageBuffer = fs.readFileSync(filePath);
//   res.setHeader("Content-Type", "image/jpg");
//   return res.send(imageBuffer);
// }

import { NextApiRequest, NextApiResponse } from "next";

import { validateGetS3 } from "../../../lib/serverHelper";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    let img: any = req.query.filename ? req.query.filename : null;
    if (!img || img.length === 0) {
      return res.status(400).json({ message: "Filename is required" });
    }

    const imagePath = img.join("/");
    const getImage = await validateGetS3(imagePath as string);

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    res.send(getImage);
  } catch (error) {
    console.error("Error serving image:", error);
    res.status(404).json({ message: "Image not found" });
  }
};

export default handler;
