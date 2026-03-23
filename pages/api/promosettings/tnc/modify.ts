import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import * as model from "./_model";

interface Input {
  id: string;
  title: string;
  content: string;
  type: string;
}

export const modify = async (param: Input) => {
  const id = param.id ? Buffer.from(param.id, 'base64').toString('ascii') : "";
  const title = param.title ? Buffer.from(param.title, 'base64').toString('ascii') : "";
  const content = param.content ? Buffer.from(param.content, 'base64').toString('ascii') : "";
  const type = param.type ? Buffer.from(param.id, 'base64').toString('ascii') : "0"

  if (id == "" || title == "" || content == "" || type == "0") {
    return {
      error: {
        type: "error",
        message: "No Lengkap",
        description: "Error",
      },
    };
  }

  await model.startTransaction();
  const editList: any = await model.editTNC(title, content, type.toString(), id);
  await model.commitTransaction();
  if (editList.changedRows != 0) {
    return "Success";
  } else {
    await model.rollback();
    return {
      error: {
        type: "error",
        message: "Error dude!",
        description: "Error",
      },
    };
  }
};

export const remove = async (param: Input) => {
  const id = param.id ? param.id : "";

  if(id == "") {
      return {
          error: {
              type: 'error',
              message: 'No Lengkap',
              description: 'Error'
          }
      }
  }

  try {
      await model.startTransaction()
      await model.dlt(id)
      await model.commitTransaction()
      return 'Success'
  } catch(err) {
      await model.rollback()
      return {
          error: {
              type: 'error',
              message: 'Error dude!',
              description: 'Error'
          }
      }
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
      await Cors(req, res)

      const session: any = await getLoginSession(req)
      if (!session) {
          return res.status(401).json({message: "Unauthorized!"})
      }

      if (req.method !== 'POST') {
          return res.status(403).json({message: "Forbidden!"})
      }

      const data = req.body

      let unmask = JSON.parse(data)
      const datas: any = await modify(unmask)

      if (datas.error) {
        res.status(400).json({ status: 400, error: datas.error.message })
    } else {
        return res.json({ status: 200, datas })
    }
  } catch (err: any) {
      res.status(500).json({message: err.message})
  }
}

export default protectAPI(handler);