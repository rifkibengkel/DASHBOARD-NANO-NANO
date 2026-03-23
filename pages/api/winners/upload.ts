import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import {NextApiRequest, NextApiResponse} from "next";
import {getLoginSession} from "@/lib/auth";
import * as fs from "fs"
const appRoot = require("app-root-path");
import {getUser, getHomeURL, insertAttachment} from "./_model"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Set desired value here
    }
  }
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await cors(req, res)

    const session: any = await getLoginSession(req)
    if (!session) {
      return res.status(401).json({message: "Unauthorized!"})
    }

    if (req.method !== 'POST') {
      return res.status(403).json({message: "Forbidden!"})
    }
    const userCreated: any = await getUser(session?.username)
    const {file, entriesId, userId, wType} = req.body
    const base64File = file?.split(",")?.[1]
    const bufferFile = Buffer.from(base64File, "base64")
    const getUrlDb = await getHomeURL()

    const filename = `${new Date().getTime()}.jpg`
    const locPath = `${appRoot}/../public`
    const apiImage = `${filename}`
    if (!fs.existsSync(locPath)) {
      fs.mkdirSync(locPath, {recursive: true})
    }
    fs.writeFileSync(`${locPath}/${filename}`, bufferFile)

    const inserts: any = await insertAttachment({
      createdById: userCreated[0]?.id,
      entriesId,
      userId,
      url: getUrlDb[0].value + apiImage,
      wType: wType
    })
    return res.send({message: "Success", data: {url: apiImage, id: inserts.insertId}})
  } catch (error) {
    res.status(500).send({message: "Failed", data: {}})
  }
}
export default protectAPI(handler)