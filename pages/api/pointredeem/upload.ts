import { getLoginSession } from "@/lib/auth";
import cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { validateUploadS3 } from "@/lib/serverHelper";
import { NextApiRequest, NextApiResponse } from "next";
import { getUploadUrl, getUser, insertAttachment } from "./_model";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Set desired value here
    },
  },
};
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await cors(req, res);
    const session: any = await getLoginSession(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    if (req.method !== "POST") {
      return res.status(403).json({ message: "Forbidden!" });
    }
    const userCreated: any = await getUser(session?.username);
    const { file, entriesId, userId, wType } = req.body;

    // Generate unique filename for S3
    const fileName = `pointredeem/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.jpg`;

    // Upload to AWS S3
    const s3Result = await validateUploadS3(fileName, file);
    console.log("S3 Upload Result:", s3Result);

    // Get domain from database general_parameter
    const getUploadUrlData: any = await getUploadUrl();
    const baseUrl = getUploadUrlData[0]?.value || "";

    // Use API endpoint to serve the image with domain from database
    const s3Url = `${baseUrl}/api/images/${fileName}`;
    console.log("S3 URL:", s3Url);

    // Insert attachment record to database
    const inserts: any = await insertAttachment({
      createdById: userCreated[0]?.id,
      entriesId,
      userId,
      url: s3Url,
      wType: wType,
    });

    console.log("inserts");
    console.log(inserts);

    // Check if insertAttachment was successful
    if (inserts.length > 0) {
      throw new Error("Failed to insert attachment record to database");
    }

    return res.send({
      message: "Success",
      data: { url: s3Url, id: inserts.insertId },
    });
  } catch (error) {
    console.error("Upload Error:", error);

    // Check if it's a database error
    if (
      error instanceof Error &&
      error.message.includes("insert attachment record")
    ) {
      res.status(500).send({
        message: "Failed to save image record to database",
        data: {},
      });
    } else {
      res.status(500).send({
        message: "Failed to upload image",
        data: {},
      });
    }
  }
};
export default protectAPI(handler);
