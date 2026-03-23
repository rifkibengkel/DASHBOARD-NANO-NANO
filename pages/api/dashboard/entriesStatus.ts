import { NextApiRequest, NextApiResponse } from "next";
import Cors from "../../../lib/cors";
import { getLoginSession } from "@/lib/auth";
import dayjs from "dayjs";
import protectAPI from "../../../lib/protectApi";
import * as model from "./_model";
import { chartType, chartCondition, intOrZ } from "@/lib/serverHelper";

interface SummaryEntries {
  subtract: number | string;
  type: string;
  startDate: string;
  endDate: string;
  condition: string;
  media: string;
}

export async function getData(params: SummaryEntries) {
  //// NOTE
  //// Ada filtering di invalid_reason, double check bos, siapatau gk dibutuhkan

  let date = new Date();

  const subtract = params.subtract ? Number(params.subtract) : 0;
  const type = params.type.toUpperCase();
  const startDate = params.startDate
    ? params.startDate
    : dayjs(date).subtract(30, "days").format("YYYY-MM-DD");
  const endDate = params.endDate
    ? params.endDate
    : dayjs().format("YYYY-MM-DD");
  const condition = params.condition.toUpperCase();
  const media = params.media ? params.media : "";

  const typeTgt = chartType[type] || 0;

  const conditionTgt = chartCondition[condition] || 0;

  if (conditionTgt === 0 || typeTgt === 0) {
    return "Wrong Parameter";
  } else {
    const getInvReason: any = await model.getInvalidReason();

    const invReasonList = getInvReason
      ? getInvReason
          .filter((i: any) => i.id != 4)
          .map((i: any, index: number) => {
            return `SUM(CASE WHEN A.is_valid = 0 AND invalid_reason.id = ${i.id} THEN 1 ELSE 0 END) AS "${i.alias}"`;
          })
      : [];

    const response: any = await model.statusSummary(
      subtract,
      conditionTgt,
      conditionTgt == 4 ? endDate : startDate,
      endDate,
      invReasonList
    );

    // console.log(response, "RES");

    let validSeries = 0;
    let unluckySeries = 0;
    let pendingSeries = 0;
    let invalidSeries = 0;
    let validWa1Series = 0;
    let pendingWa1Series = 0;
    let invalidWa1Series = 0;
    let validWa2Series = 0;
    let pendingWa2Series = 0;
    let invalidWa2Series = 0;
    let validWa3Series = 0;
    let pendingWa3Series = 0;
    let invalidWa3Series = 0;
    let validMicrositeSeries = 0;
    let pendingMicrositeSeries = 0;
    let invalidMicrositeSeries = 0;

    const responseInv: any = await model.statusSummaryInv(
      subtract,
      conditionTgt,
      startDate,
      endDate,
      invReasonList
    );

    // console.log(responseInv, "IINV");

    const reasonItems = new Map();
    for (let o = 0; o < getInvReason.length; o++) {
      if (getInvReason[o].id != 4) {
        reasonItems.set(getInvReason[o].alias, 0);
      }
    }

    const categoriesReason = getInvReason
      ? getInvReason
          .filter((i: any) => i.id != 4)
          .map((i: any, index: number) => {
            return i.reason;
          })
      : [];

    let categoriesValidInvalid = ["Valid", "Pending", "Invalid"];

    for (let r = 0; r < responseInv.length; r++) {
      for (let l = 0; l < getInvReason.length; l++) {
        reasonItems.set(
          getInvReason[l].alias,
          parseInt(reasonItems.get(getInvReason[l].alias)) +
            parseInt(responseInv[r][getInvReason[l].alias])
        );
      }
    }

    const invs = getInvReason
      .filter((i: any) => i.id != 4)
      .map((item: any, i: any) => reasonItems.get(`${item.alias}`));

    for (let index = 0; index < response.length; index++) {
      const valid = intOrZ(response[index].valid);
      const unlucky = intOrZ(response[index].unlucky);
      const pending = intOrZ(response[index].pending);
      const invalid = intOrZ(response[index].invalid);
      const validWa1 = intOrZ(response[index].validWa1);
      const pendingWa1 = intOrZ(response[index].pendingWa1);
      const invalidWa1 = intOrZ(response[index].invalidWa1);
      const validWa2 = intOrZ(response[index].validWa2);
      const pendingWa2 = intOrZ(response[index].pendingWa2);
      const invalidWa2 = intOrZ(response[index].invalidWa2);
      const validWa3 = intOrZ(response[index].validWa3);
      const pendingWa3 = intOrZ(response[index].pendingWa3);
      const invalidWa3 = intOrZ(response[index].invalidWa3);
      const validMicrosite = intOrZ(response[index].validMicrosite);
      const pendingMicrosite = intOrZ(response[index].pendingMicrosite);
      const invalidMicrosite = intOrZ(response[index].invalidMicrosite);

      validSeries += valid;
      unluckySeries += unlucky;
      pendingSeries += pending;
      invalidSeries += invalid;
      validWa1Series += validWa1;
      pendingWa1Series += pendingWa1;
      invalidWa1Series += invalidWa1;
      validWa2Series += validWa2;
      pendingWa2Series += pendingWa2;
      invalidWa2Series += invalidWa2;
      validWa3Series += validWa3;
      pendingWa3Series += pendingWa3;
      invalidWa3Series += invalidWa3;
      validMicrositeSeries += validMicrosite;
      pendingMicrositeSeries += pendingMicrosite;
      invalidMicrositeSeries += invalidMicrosite;
    }
    let seriesValidInvalid = [validSeries, pendingSeries, invalidSeries];

    const seriesReason = getInvReason
      .filter((i: any) => i.id != 4)
      .map((item: any, i: any) => reasonItems.get(`${item.alias}`));

    if (typeTgt == 1) {
      // chart
      const dataList = {
        invalidReason: {
          categories: categoriesReason,
          series: seriesReason,
        },
        validInvalid: {
          categories: categoriesValidInvalid,
          series: seriesValidInvalid,
        },
      };
      return dataList;
    } else if (typeTgt == 2) {
      // data
      const dataList = {
        totalInvs: invs,
        valid: validSeries,
        unlucky: unluckySeries,
        pending: pendingSeries,
        invalid: invalidSeries,
        validWa1: validWa1Series,
        pendingWa1: pendingWa1Series,
        invalidWa1: invalidWa1Series,
        validWa2: validWa2Series,
        pendingWa2: pendingWa2Series,
        invalidWa2: invalidWa2Series,
        validWa3: validWa3Series,
        pendingWa3: pendingWa3Series,
        invalidWa3: invalidWa3Series,
        validMicrosite: validMicrositeSeries,
        pendingMicrosite: pendingMicrositeSeries,
        invalidMicrosite: invalidMicrositeSeries,
        response,
      };
      return dataList;
    } else if (typeTgt == 3) {
      // chart & data
      const dataList = {
        chart: {
          invalidReason: {
            categories: categoriesReason,
            series: seriesReason,
          },
          validInvalid: {
            categories: categoriesValidInvalid,
            series: seriesValidInvalid,
          },
        },
        data: {
          totalInvs: invs,
          valid: validSeries,
          unlucky: unluckySeries,
          pending: pendingSeries,
          invalid: invalidSeries,
          validWa1: validWa1Series,
          pendingWa1: pendingWa1Series,
          invalidWa1: invalidWa1Series,
          validWa2: validWa2Series,
          pendingWa2: pendingWa2Series,
          invalidWa2: invalidWa2Series,
          validWa3: validWa3Series,
          pendingWa3: pendingWa3Series,
          invalidWa3: invalidWa3Series,
          validMicrosite: validMicrositeSeries,
          pendingMicrosite: pendingMicrositeSeries,
          invalidMicrosite: invalidMicrositeSeries,
          response,
        },
      };
      return dataList;
    }
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
    } as SummaryEntries;

    const getSumEntries = await getData(params);
    return res.json(getSumEntries);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
