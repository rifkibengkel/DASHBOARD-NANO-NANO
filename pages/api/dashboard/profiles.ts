import { NextApiRequest, NextApiResponse } from "next";
import Cors from "../../../lib/cors";
import { getLoginSession } from "@/lib/auth";
import dayjs from "dayjs";
import protectAPI from "../../../lib/protectApi";
import * as model from "./_model";
import { chartType, chartCondition, intOrZ } from "@/lib/serverHelper";

interface SummaryProfiles {
  subtract: number | string;
  type: string;
  startDate: string;
  endDate: string;
  condition: string;
  media: string;
}

export async function getData(params: SummaryProfiles) {
  let date = new Date();
  const subtract = params.subtract ? Number(params.subtract) : 0;
  const type = params.type.toUpperCase();
  const startDate = params.startDate
    ? params.startDate
    : dayjs(date).subtract(365, "days").format("YYYY-MM-DD");
  const endDate = params.endDate
    ? params.endDate
    : dayjs().format("YYYY-MM-DD");
  const condition = params.condition.toUpperCase();

  const typeTgt = chartType[type] || 0;

  const conditionTgt = chartCondition[condition] || 0;

  let mediaSeriesActive = await model.mediaSeriesActive();

  const mediaUsed: any = await model.mediaUsed4();

  const mediaList = mediaUsed
    ? mediaUsed.map((i: any, index: number) => {
        return `SUM(CASE WHEN users."mediaId" = ${i.id} THEN 1 ELSE 0 END) AS "${i.name}"`;
      })
    : [];
  // const countProfiles: any = await model.countProfiles(param)
  let getTotalProfiles: any = await model.totalProfile(
    subtract,
    conditionTgt,
    startDate,
    endDate,
    mediaList
  );

  const totalProfile = parseInt(getTotalProfiles[0].counts);
  // const totalWA = parseInt(getTotalProfiles[0].WA);
  // console.log(totalWA, "aTOTAL");
  const totalWEB = parseInt(getTotalProfiles[0].WEB);
  const response: any = await model.profileSummary(
    subtract,
    conditionTgt,
    startDate,
    endDate,
    mediaList
  );
  // console.log(response, "RES");

  let seriesAll = [];
  let WEB = [];
  // let WA = [];
  let categories = [];

  for (let index = 0; index < response.length; index++) {
    seriesAll.push(parseInt(response[index].all));
    // WA.push(parseInt(response[index].WA));
    WEB.push(parseInt(response[index].WEB));
    categories.push(response[index].DATE);
  }

  let total = {
    totalAll: seriesAll.reduce((a, b) => a + b, 0),
  };

  if (typeTgt == 1) {
    const data = {
      totalProfile,
      // totalWA,
      totalWEB,
      totalMedia: {
        WEB: totalWEB,
        // WA: totalWA,
      },
      total,
      seriesAll,
      WEB,
      // WA,
      categories,
      mediaSeriesActive,
    };

    return data;
  } else if (typeTgt == 2) {
    return response;
  } else if (typeTgt == 3) {
    const data = {
      data: response,
      totalProfile,
      totalMedia: {
        WEB: totalWEB,
        // WA: totalWA,
      },
      total,
      seriesAll,
      WEB,
      // WA,
      categories,
      mediaSeriesActive,
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

    const { subtract, type, startDate, endDate, condition, media } = req.query;

    let params = {
      subtract,
      type,
      startDate,
      endDate,
      condition,
      media,
    } as SummaryProfiles;

    const getSumProfiles = await getData(params);

    return res.json(getSumProfiles);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
