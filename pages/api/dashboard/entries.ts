import { NextApiRequest, NextApiResponse } from "next";
import Cors from "../../../lib/cors";
import { getLoginSession } from "@/lib/auth";
import dayjs from "dayjs";
import protectAPI from "../../../lib/protectApi";
import * as model from "./_model";
import { getPeriode } from "@api/dashboard/_model";
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
  let date = new Date();
  const subtract = params.subtract ? Number(params.subtract) : 0;
  const type = params.type.toUpperCase();
  const startDate = params.startDate
    ? params.startDate
    : dayjs(date.setDate(date.getDate() - 365)).format("YYYY-MM-DD");
  const endDate = params.endDate
    ? params.endDate
    : dayjs().format("YYYY-MM-DD");
  const condition = params.condition.toUpperCase();
  const media = params.media ? params.media : "";
  const typeTgt = chartType[type] || 0;

  const conditionTgt = chartCondition[condition] || 0;

  let param = {
    subtract,
    type: typeTgt,
    startDate,
    endDate,
    condition: conditionTgt,
    media,
  };

  const periodeData: any = await getPeriode();

  let pendingMode: any = await model.pendingMode();

  let activeMode = pendingMode[0].active;
  let columnsUsed = await model.summaryColumns(activeMode);

  let summarySeriesActive = await model.summarySeriesActive();

  let mediaUsed: any = await model.mediaUsed();
  const countEntries: any = await model.countEntries(
    subtract,
    conditionTgt,
    conditionTgt == 4 ? endDate : startDate,
    endDate,
    media
  );

  let getTotalEntries: any = await model.totalEntries(subtract, media);
  const totalEntries = intOrZ(getTotalEntries[0].counts);
  const totalValid = intOrZ(getTotalEntries[0].totalValid);
  const totalValidWa = intOrZ(getTotalEntries[0].validWa1);
  const totalValidApp = intOrZ(getTotalEntries[0].totalValidApp);

  const totalUnlucky = intOrZ(getTotalEntries[0].totalUnlucky);

  const totalPending = intOrZ(getTotalEntries[0].totalPending);

  const totalInvalid = intOrZ(getTotalEntries[0].totalInvalid);
  const totalInvalidWa = intOrZ(getTotalEntries[0].invalidWa1);
  const totalInvalidApp = intOrZ(getTotalEntries[0].totalInvalidApp);

  const currentWin100 = await model.currentWinner100();

  const maxWin100 = await model.generalParameterByVal("firstSubmitter");

  const response: any = await model.entriesSummary(
    subtract,
    conditionTgt,
    conditionTgt == 4 ? endDate : startDate,
    endDate
  );

  let seriesWa1 = [];
  let seriesWa2 = [];
  let seriesWa3 = [];
  let seriesMicrosite = [];
  let seriesApp = [];
  let categories = [];

  let total = {
    totalValid: intOrZ(countEntries[0].totalValid),
    totalUnlucky: intOrZ(countEntries[0].totalUnlucky),
    totalPending: intOrZ(countEntries[0].totalPending),
    totalInvalid: intOrZ(countEntries[0].totalInvalid),
    totalValidWa1: intOrZ(countEntries[0].totalValidWa1),
    totalPendingWa1: intOrZ(countEntries[0].totalPendingWa1),
    totalInvalidWa1: intOrZ(countEntries[0].totalInvalidWa1),
    totalValidWa2: intOrZ(countEntries[0].totalValidWa2),
    totalPendingWa2: intOrZ(countEntries[0].totalPendingWa2),
    totalInvalidWa2: intOrZ(countEntries[0].totalInvalidWa2),
    totalValidWa3: intOrZ(countEntries[0].totalValidWa3),
    totalPendingWa3: intOrZ(countEntries[0].totalPendingWa3),
    totalInvalidWa3: intOrZ(countEntries[0].totalInvalidWa3),
    totalValidMicrosite: intOrZ(countEntries[0].totalValidMicrosite),
    totalPendingMicrosite: intOrZ(countEntries[0].totalPendingMicrosite),
    totalInvalidMicrosite: intOrZ(countEntries[0].totalInvalidMicrosite),
    totalValidApp: intOrZ(countEntries[0].totalValidApp),
    totalPendingApp: intOrZ(countEntries[0].totalPendingApp),
    totalInvalidApp: intOrZ(countEntries[0].totalInvalidApp),
    totalAll: intOrZ(countEntries[0].counts),
  };

  if (conditionTgt == 4) {
    categories = Array.from({ length: 24 }, (_, index) =>
      index.toString().padStart(2, "0")
    );
    let data = [];
    for (let index = 0; index < categories.length; index++) {
      const categorie = categories[index];
      const dateIndexOf = response.findIndex((x: any) => x.DATE == categorie);
      if (dateIndexOf < 0) {
        seriesWa1.push(0);
        seriesWa2.push(0);
        seriesWa3.push(0);
        seriesMicrosite.push(0);
        seriesApp.push(0);
        data.push({
          DATE: categorie,
          valid: 0,
          unlucky: 0,
          pending: 0,
          invalid: 0,
          validWa1: 0,
          pendingWa1: 0,
          invalidWa1: 0,
          validWa2: 0,
          pendingWa2: 0,
          invalidWa2: 0,
          validWa3: 0,
          pendingWa3: 0,
          invalidWa3: 0,
          validMicrosite: 0,
          pendingMicrosite: 0,
          invalidMicrosite: 0,
          validApp: 0,
          pendingApp: 0,
          invalidApp: 0,
          allWa1: 0,
          allWa2: 0,
          allWa3: 0,
          allMicrosite: 0,
          allApp: 0,
          all: 0,
        });
      } else {
        seriesWa1.push(parseInt(response[dateIndexOf].allWa1));
        seriesWa2.push(response[dateIndexOf].allWa2);
        seriesWa3.push(response[dateIndexOf].allWa3);
        seriesMicrosite.push(response[dateIndexOf].allMicrosite);
        seriesApp.push(response[dateIndexOf].allApp);
        data.push(response[dateIndexOf]);
      }
    }
    // response = data
  } else {
    for (let index = 0; index < response.length; index++) {
      seriesWa1.push(parseInt(response[index].allWa1));
      seriesWa2.push(parseInt(response[index].allWa2));
      seriesWa3.push(parseInt(response[index].allWa3));
      seriesMicrosite.push(parseInt(response[index].allMicrosite));
      seriesApp.push(parseInt(response[index].allApp));
      categories.push(response[index].DATE);
    }
  }
  if (typeTgt == 1) {
    let resultData = {
      totalEntries: totalEntries,
      totalValid: totalValid,
      totalValidWa: totalValidWa,
      totalValidApp: totalValidApp,
      totalUnlucky: totalUnlucky,
      totalPending: totalPending,
      totalInvalid: totalInvalid,
      totalInvalidWa: totalInvalidWa,
      totalInvalidApp: totalInvalidApp,
      total: total,
      seriesWa1: seriesWa1,
      seriesWa2: seriesWa2,
      seriesWa3: seriesWa3,
      seriesMicrosite: seriesMicrosite,
      seriesApp: seriesApp,
      categories: categories,
      mediaUsed: parseInt(mediaUsed[0].medias),
      columnsUsed,
      summarySeriesActive,
      periode: periodeData[0],
      current100: currentWin100[0].counts,
      max100: maxWin100[0].param,
    };
    return resultData;
  } else if (typeTgt == 2) {
    // data only
    return response;
  } else if (typeTgt == 3) {
    let resultData = {
      data: response,
      totalEntries: totalEntries,
      totalValid: totalValid,
      totalUnlucky: totalUnlucky,
      totalPending: totalPending,
      totalInvalid: totalInvalid,
      total: total,
      seriesWa1: seriesWa1,
      seriesWa2: seriesWa2,
      seriesWa3: seriesWa3,
      seriesMicrosite: seriesMicrosite,
      seriesApp: seriesApp,
      categories: categories,
      mediaUsed: parseInt(mediaUsed[0].medias),
      columnsUsed,
      summarySeriesActive,
    };

    return resultData;
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
