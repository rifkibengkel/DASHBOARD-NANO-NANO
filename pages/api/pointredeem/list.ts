import type { NextApiRequest, NextApiResponse } from "next";
import { pagination, hashPassword } from "@/lib/serverHelper";
import * as model from "./_model";
import protectAPI from "../../../lib/protectApi";
import Cors from "../../../lib/cors";
import { titleCase } from "../master";
import { getLoginSession } from "@/lib/auth";

interface WnPagination {
  row: string | number;
  page: string | number;
  key: string;
  direction: string;
  column: string;
  limit: number | string;
  media: string;
  isHaveAtt: number | string;
  startDate: string;
  endDate: string;
  prizeId: string;
  isValid: string;
  isApproved: string;
  mode: string;
}

export const detailWnr = async (id: any) => {
  try {
    const data: any = await model.detailWinner(id);

    // const imgs: any = await model.detailWinnerAtt(data[0].userId)

    const selectedUrl: any = await model.detailSelectedWinnerAtt(id);

    let datas = {
      entries: data,
      // images: imgs,
      url: selectedUrl,
    };
    return datas;
  } catch (err) {
    return {
      error: {
        type: "error",
        message: "error",
        description: "ERROR",
      },
    };
  }
};

export const detailWnr2 = async (id: any) => {
  try {
    const data: any = await model.detailWinner2(id);

    const imgs: any = await model.detailWinnerAtt(data[0].userId);

    const selectedUrl: any = await model.detailSelectedWinnerAtt(id);

    let datas = {
      entries: data,
      images: imgs,
      url: selectedUrl,
    };
    return datas;
  } catch (err) {
    return {
      error: {
        type: "error",
        message: "error",
        description: "ERROR",
      },
    };
  }
};

export async function getData(param: WnPagination) {
  try {
    const row = param?.row
      ? Number(param?.row) === 0
        ? 10
        : Number(param?.row)
      : 10;
    const key = param?.key ? param?.key : "";
    const page = param?.page ? Number(param?.page) : 0;
    const column = param?.column ? param?.column : "";
    const direction = param?.direction ? param?.direction : "";
    const startDate = param?.startDate ? param?.startDate : "";
    const endDate = param?.endDate ? param?.endDate : "";
    const isHaveAtt = param?.isHaveAtt ? param?.isHaveAtt : "";
    const media = param?.media ? param?.media : "";
    const isValid = param?.isValid || "";
    const prizeId = param?.prizeId || "";
    const isApproved = param?.isApproved || "";

    const mode = param?.mode || "";

    let params = {
      row,
      startDate,
      endDate,
      key,
      column,
      direction,
      media,
      prizeId,
      isHaveAtt,
      limit: 0,
      isValid,
      isApproved,
      mode,
    } as WnPagination;

    let countWinner: any = await model.countWinner(params);
    let totalWinner = countWinner[0]?.counts;
    let paginations = await pagination(page, row, totalWinner);
    params.limit = paginations.query;
    const list_win: any = await model.listWinner(params);

    const tabling: any = [
      {
        key: "no",
        title: "No",
        dataIndex: "no",
        sorter: false,
      },
    ];

    list_win.length > 0
      ? Object.keys(list_win[0])
          .filter((item: any) => item !== "id" && item !== "isTopup")
          .map((item: any, indx: any) =>
            tabling.push({
              key: indx,
              title: titleCase(item),
              dataIndex: item,
              sorter: true,
            })
          )
      : tabling.push({
          key: "5",
          title: "Columns",
          dataIndex: "columns",
          sorter: true,
        });

    return {
      tabling: tabling,
      dataPerPage: paginations.dataPerPage,
      currentPage: paginations.currentPage,
      totalData: paginations.totalData,
      totalPage: paginations.totalPage,
      data: list_win,
    };
  } catch (error) {
    const data = {
      tabling: [],
      dataPerPage: 0,
      currentPage: 0,
      totalData: 0,
      totalPage: 0,
      data: [],
    };
    return data;
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await Cors(req, res);

    const session: any = await getLoginSession(req);
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
      prizeId,
      isValid,
      isApproved,
      isHaveAtt,
      mode,
    } = req.query;
    let params = {
      row,
      key,
      startDate,
      endDate,
      direction,
      column,
      page,
      prizeId,
      isValid,
      isApproved,
      isHaveAtt,
      mode,
    } as WnPagination;
    const data = await getData(params);

    return res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
