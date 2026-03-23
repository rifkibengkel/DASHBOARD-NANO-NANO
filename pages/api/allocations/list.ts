import type { NextApiRequest, NextApiResponse } from "next";
import { pagination, titleCase } from "@/lib/serverHelper";
import * as model from "./_model";
import protectAPI from "@/lib/protectApi";
import Cors from "@/lib/cors";
import { getLoginSession } from "@/lib/auth";
import dayjs from "dayjs";

interface RgPagination {
  row: string | number;
  page: string | number;
  key: string;
  direction: string;
  column: string;
  condition: string;
  limit: number | string;
  threshold: string;
}

export async function getData(param: RgPagination) {
  const row = param.row ? Number(param.row) : 10;
  const key = param.key ? param.key : "";
  const page = param.page ? Number(param.page) : 0;
  const column = param.column ? param.column : "";
  const direction = param.direction ? param.direction : "";
  // const type = param.type ? param.type : "0";
  const type = "0";
  const condition =
    param.condition.toUpperCase() == "DAILY"
      ? "1"
      : param.condition.toUpperCase() == "WEEKLY"
      ? "2"
      : param.condition.toUpperCase() == "MONTHLY"
      ? "2"
      : "0";

  let params = {
    row,
    key,
    column,
    direction,
    condition,
    threshold: dayjs().format("YYYY-MM-DD 00:00:00"),
    limit: 0,
  } as RgPagination;

  let countData: any = await model.countAllocations(params);
  let totalData;
  if (countData.length == 0) {
    totalData = 0;
  } else {
    totalData = countData[0].counts;
  }

  const paginations = await pagination(page, row, totalData);
  params.limit = paginations.query;

  let dataList: any = await model.listAllocations(params);

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

  const data = {
    tabling,
    dataPerPage: paginations.dataPerPage,
    currentPage: paginations.currentPage,
    totalData: paginations.totalData,
    totalPage: paginations.totalPage,
    data: dataList,
  };
  return data;
}

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

    const { row, key, direction, column, page, condition } = req.query;

    let params = {
      row,
      key,
      direction,
      column,
      page,
      condition,
    } as RgPagination;

    const data = await getData(params);

    return res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
