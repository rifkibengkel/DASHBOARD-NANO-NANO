import { NextApiRequest, NextApiResponse } from "next";
import Cors from "../../../lib/cors"
import { getLoginSession } from '@/lib/auth';;
import dayjs from "dayjs";
import protectAPI from "../../../lib/protectApi";
import * as model from "./_model";
import { chartType, chartCondition, numberFormat, weekRange } from "@/lib/serverHelper";

interface SummaryProfiles {
    subtract: number | string;
    type: string;
    startDate: string;
    endDate: string;
    condition: string;
    media: string;
}

export async function getData(params: SummaryProfiles) {
    let date = new Date()
    const subtract = params.subtract ? Number(params.subtract) : 0
    const type = params.type.toUpperCase()
    const startDate = params.startDate ? params.startDate : dayjs(date).subtract(365, 'days').format("YYYY-MM-DD")
    const endDate = params.endDate ? params.endDate : dayjs().format("YYYY-MM-DD")
    const condition = params.condition.toUpperCase()

    const typeTgt = chartType[type] || 0;

    const conditionTgt = chartCondition[condition] || 0;

    let mediaSeriesActive = await model.mediaSeriesActive()

    const mediaUsed: any = await model.mediaUsed4()
    const mediaList = mediaUsed ? mediaUsed.filter((i: any) => i.id != 99).map((i: any, index: number) => 
        {return `SUM(CASE WHEN users."mediaId" = ${i.id} THEN 1 ELSE 0 END) AS "${i.name}"`}        
    ) : []
    // const countProfiles: any = await model.countProfiles(param)
    let getTotalProfiles: any = await model.totalProfile(subtract, conditionTgt, startDate, endDate, mediaList)

    const totalProfile = parseInt(getTotalProfiles[0].counts)
    const totalWA = parseInt(getTotalProfiles[0].WA)
    const totalAPPS = parseInt(getTotalProfiles[0].APPS)
    // const response: any = await model.profileSummary(subtract, conditionTgt, startDate, endDate, mediaList)

    let paramx = {
        condition: condition.toLowerCase(),
        type: type.toLowerCase(),
        subtract: subtract,
        startDate: conditionTgt == 2 ? dayjs(startDate).format("YYYY-") + numberFormat(dayjs.duration(startDate).weeks(), 2) : conditionTgt == 3 ? dayjs(startDate).format("YYYY-") + numberFormat(dayjs(startDate).month(), 3) : startDate,
        endDate: conditionTgt == 2 ? dayjs(endDate).format("YYYY-") + numberFormat(dayjs.duration(endDate).weeks(), 2) : conditionTgt == 3 ? dayjs(endDate).format("YYYY-") + numberFormat(dayjs(endDate).month(), 3) : endDate,
        // media
    };

    const curDate = dayjs().format("YYYY-MM-DD")
            const curMonth = dayjs().format("YYYY-MM")
            const endDateIsNow = conditionTgt == 1 || conditionTgt == 2 || conditionTgt == 4 ? dayjs(endDate).isSameOrAfter(curDate) : dayjs(endDate, "YYYY-MM").isSameOrAfter(curMonth)

    let series: any = []
    let APPS: any = [];
    let WA: any = [];
    let categories: any = []

    const response: any = await model.specialSummaryProfile(paramx, endDateIsNow, mediaList)
    let fixData = []
    let returnVallue = {
        DATE: "",
        WA: 0,
        APPS: 0,
        all: 0
    }

    let totals = {
        WA: 0,
        APPS: 0,
        all: 0
    }
    for (let index = 0; index < response.length; index++) {
        
        const label = conditionTgt == 1 ? dayjs(response[index].label).format("YYYY-MM-DD") :
            conditionTgt == 2 ? weekRange(response[index].label) :
                conditionTgt == 3 ? dayjs(response[index].label).format("YYYY-MM") : dayjs(response[index].label, "HH").format("HH:mm:ss")
        if (index == 0) {
            returnVallue.DATE = label
            returnVallue.WA = +response[index].WA
            returnVallue.APPS = +response[index].APPS
            returnVallue.all = +response[index].all
        } else {
            if (returnVallue.DATE == label) {
                returnVallue.WA += +response[index].WA
                returnVallue.APPS += +response[index].APPS
                returnVallue.all += +response[index].all
            } else {
                fixData.push(returnVallue)
                returnVallue = {
                    DATE: label,
                    WA: +response[index].WA,
                    APPS: +response[index].APPS,
                    all: +response[index].all,
                }
            }
        }

        totals.APPS += +response[index].APPS
        totals.WA += +response[index].WA
        totals.all += +response[index].all

        const categoriesIndex = categories.findIndex((v: any) =>
            v == returnVallue.DATE
        )
        if (categoriesIndex < 0) {
            categories.push(returnVallue.DATE)
            WA.push(returnVallue.WA)
            APPS.push(returnVallue.APPS)
            series.push(returnVallue.all)
        } else {
            series[categoriesIndex] = returnVallue.all
            WA[categoriesIndex] = returnVallue.WA
            APPS[categoriesIndex] = returnVallue.APPS
        }
    }
    
    let total = {
        totalAll: series.reduce((a: any, b: any) => a + b, 0)
    }
    

    fixData.push(returnVallue)

    const data = {
        data: fixData,
        totalProfile: totals.all,
        totalWA: totals.WA,
        totalAPPS: totals.APPS,
        totalMedia: {
            APPS: totals.APPS,
            WA: totals.WA
        },
        total,
        seriesAll: series,
        APPS,
        WA,
        categories,
        mediaSeriesActive
    }

    return data



    // if (typeTgt == 1) {
    //     const data = {
    //         totalProfile,
    //         totalWA,
    //         totalAPPS,
    //         totalMedia: {
    //             APPS: totalAPPS,
    //             WA: totalWA
    //         },
    //         total,
    //         seriesAll,
    //         APPS,
    //         WA,
    //         categories,
    //         mediaSeriesActive
    //     }
    //     return data
    // } else if(typeTgt == 2) {
    //     return response
    // } else if(typeTgt == 3) {
    //     const data = {
    //         data: response,
    //         totalProfile,
    //         totalMedia: {
    //             APPS: totalAPPS,
    //             WA: totalWA
    //         },
    //         total,
    //         seriesAll,
    //         APPS,
    //         WA,
    //         categories,
    //         mediaSeriesActive
    //     }
    //     return data
    // }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        if (req.method !== "GET") {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const { subtract, type, startDate, endDate, condition, media } = req.query

        let params = {
            subtract,
            type,
            startDate,
            endDate,
            condition,
            media
        } as SummaryProfiles

        const getSumProfiles = await getData(params)
        return res.json(getSumProfiles)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }

}

export default protectAPI(handler)