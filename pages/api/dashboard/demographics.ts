import Cors from "@/lib/cors";
import protectAPI from "@/lib/protectApi";
import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth";
import * as model from "./_model";
import { chartType, intOrZ } from "@/lib/serverHelper";

interface SummaryDemo {
  subtract: number | string;
  media: string;
  type: string;
  status: string;
}

export async function getData(params: SummaryDemo) {
  const subtract = params.subtract ? params.subtract : 0;
  const media = params.media === "0" || !params.media ? "" : params.media;
  const type = params.type.toUpperCase();
  const status = params.status ? params.status : "0";

  const typeTgt = chartType[type] || 0;

  const demographicData: any = await model.demographic(subtract, media, status);
  const variantsData: any = await model.variants2(1)
  const variants2Data: any = await model.variants2(2)
  let mediaUsed = await model.mediaUsed2();

  // const getTotalCoupon: any = await model.getTotCoupons()
  // let totalCo = Number(getTotalCoupon[0].value || 0)

  // const getClaimedCoupon: any = await model.getClmCoupons()

  // let totalCl = Number(getClaimedCoupon[0].total || 0)
  // const professionData: any = await model.professions()

  const seriesVariant = []
  const categoriesVariant = []

  for (let i = 0; i < variantsData.length; i++) {
      seriesVariant.push(variantsData[i].series ? Number(variantsData[i].series) : 0)
      categoriesVariant.push(variantsData[i].categories)
  }

  const seriesVariant2 = []
  const categoriesVariant2 = []

  for (let i = 0; i < variants2Data.length; i++) {
      seriesVariant2.push(variants2Data[i].series ? Number(variants2Data[i].series) : 0)
      categoriesVariant2.push(variants2Data[i].categories)
  }

  // const seriesProfession = []
  // const categoriesProfession = []

  // for (let i = 0; i < professionData.length; i++) {
  //     seriesProfession.push(professionData[i].series ? professionData[i].series : 0)
  //     categoriesProfession.push(professionData[i].categories)
  // }

  const seriesGender = [
    intOrZ(demographicData[0].Male),
    intOrZ(demographicData[0].Female),
    // intOrZ(demographicData[0].NonKTPGender),
  ];

  const seriesAge = [
    intOrZ(demographicData[0].umur5),
    intOrZ(demographicData[0].umur5_17),
    intOrZ(demographicData[0].umur17_25),
    intOrZ(demographicData[0].umur26_35),
    intOrZ(demographicData[0].umur36_45),
    intOrZ(demographicData[0].umur46_55),
    intOrZ(demographicData[0].umur55),
    // intOrZ(demographicData[0].NonKTPAge),
  ];

  const categoriesGender = ["Male", "Female", 
    // "Non KTP"
  ];
  const categoriesAge = [
    "<5 thn",
    "5-17 thn",
    "17-25 thn",
    "26-35 thn",
    "36-45 thn",
    "46-55 thn",
    "> 55 thn",
    // "Non KTP",
  ];

  if (typeTgt == 1) {
    // cahert only
    const data = {
      seriesGender: seriesGender,
      seriesAge: seriesAge,
      categoriesGender: categoriesGender,
      categoriesAge: categoriesAge,
      // couponPercentage: totalCl/totalCo
      seriesVariant: seriesVariant,
      categoriesVariant: categoriesVariant,
      seriesVariant2: seriesVariant2,
      categoriesVariant2: categoriesVariant2
      // seriesProfession: seriesProfession,
      // categoriesProfession: categoriesProfession
    };
    return data;
  } else if (typeTgt == 2) {
    // data only
    const data = {
      result: {
        gender: seriesGender,
        age: seriesAge,
        variant: seriesVariant,
        variant2: seriesVariant2
      },
    };
    return data;
  } else if (typeTgt == 3) {
    // data and chart
    const data = {
      result: {
        gender: seriesGender,
        age: seriesAge,
        variant: seriesVariant,
        variant2: seriesVariant2
      },
      seriesGender: seriesGender,
      seriesAge: seriesAge,
      categoriesGender: categoriesGender,
      categoriesAge: categoriesAge,
      seriesVariant: seriesVariant,
      categoriesVariant: categoriesVariant,
      seriesVariant2: seriesVariant2,
      categoriesVariant2: categoriesVariant2,
      // seriesProfession: seriesProfession,
      // categoriesProfession: categoriesProfession,
      media: media,
      mediaUsed,
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

    const { subtract, media, type, status } = req.query;

    let params = {
      subtract,
      media,
      type,
      status,
    } as SummaryDemo;

    const getSumDemo = await getData(params);
    return res.json(getSumDemo);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default protectAPI(handler);
