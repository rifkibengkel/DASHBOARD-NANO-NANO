import { NextApiRequest, NextApiResponse } from "next";

import { validateGetS3 } from "../../../lib/serverHelper";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let img: any = req.query.filename ? req.query.filename : null;
  const imagePath = img.join("/");
  const getImage = await validateGetS3(imagePath as string);

  res.setHeader("Content-Type", "image/jpeg");
  res.send(getImage);
};

export default handler;
