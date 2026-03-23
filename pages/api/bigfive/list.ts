import type { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import { pagination, titleCase } from "@/lib/serverHelper";
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import { IPagination } from "@/interfaces/b5.interface";
// import dayjs from 'dayjs'
export async function getData(param: IPagination) {
  const row = param.row ? Number(param.row) : 10;
  const page = param.page ? Number(param.page) : 0;
  const key = param.key ? param.key : "";
  const period = param.period ? param.period : "";

  let params = {
    row,
    limit: 0,
    key,
    period,
  } as IPagination;

  const periodes: any = await model.listPeriode();

  const total: any = await model.countAll(params);

  const paginations = await pagination(page, row, total[0].total_all);
  params.limit = paginations.query;

  const dataList: any = await model.list(params);

  const tabling: any = [
    {
      key: "no",
      title: "No",
      dataIndex: "no",
      sorter: false,
    },
  ];

  dataList.length > 0
    ? Object.keys(dataList[0])
        .filter((item: any) => item !== "id")
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
    data: dataList,
    isApproved: dataList[0]?.status,
    periodes: periodes,
    currentPeriode: dataList[0]?.periode || 0,
    key: null,
  };
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

    const { row, key, page, period } = req.query;

    let params = {
      row,
      key,
      page,
      period,
    } as IPagination;

    const data = await getData(params);

    return res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
