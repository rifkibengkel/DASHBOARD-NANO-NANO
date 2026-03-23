import { NextApiRequest, NextApiResponse } from "next";
import Cors from "../../../lib/cors"
import { getLoginSession } from '@/lib/auth';;
import dayjs from "dayjs";
import protectAPI from "../../../lib/protectApi";
import * as model from "./_model";
import { chartType, chartCondition, intOrZ, numberFormat, weekRange } from "@/lib/serverHelper";

interface SummaryEntries {
    subtract: number | string;
    type: string;
    startDate: string;
    endDate: string;
    condition: string;
    media: string;
}

export async function getData(params: SummaryEntries) {
    let date = new Date()
    const curDate = dayjs().format("YYYY-MM-DD")
    const curMonth = dayjs().format("YYYY-MM")
    const subtract = params.subtract ? Number(params.subtract) : 0
    const type = params.type.toUpperCase();
    const startDate = params.startDate ? params.startDate : dayjs(date.setDate(date.getDate() - 365)).format("YYYY-MM-DD")
    const endDate = params.endDate ? params.endDate : dayjs().format("YYYY-MM-DD")
    const condition = params.condition.toUpperCase()
    const media = params.media ? params.media : ""

    const typeTgt = chartType[type] || 0;

    const conditionTgt = chartCondition[condition] || 0;

    let param = {
        subtract, type: typeTgt, startDate, endDate, condition: conditionTgt, media
    }

    let paramx = {
        condition: condition.toLowerCase(),
        type: type.toLowerCase(),
        subtract: subtract,
        startDate: conditionTgt == 2 ? dayjs(startDate).format("YYYY-") + numberFormat(dayjs.duration(startDate).weeks(), 2) : conditionTgt == 3 ? dayjs(startDate).format("YYYY-") + numberFormat(dayjs(startDate).month(), 3) : startDate,
        endDate: conditionTgt == 2 ? dayjs(endDate).format("YYYY-") + numberFormat(dayjs.duration(endDate).weeks(), 2) : conditionTgt == 3 ? dayjs(endDate).format("YYYY-") + numberFormat(dayjs(endDate).month(), 3) : endDate,
        media
    };
    
    const periodeData: any = await model.getPeriode()

    let pendingMode: any = await model.pendingMode()
    
    let activeMode = pendingMode[0].active
    let columnsUsed = await model.summaryColumns(activeMode)

    let summarySeriesActive = await model.summarySeriesActive()

    let mediaUsed: any = await model.mediaUsed()
    // const countEntries: any = await model.countEntries(subtract, conditionTgt, conditionTgt == 4 ? endDate : startDate, endDate, media)
    let getTotalEntries: any = await model.totalEntries(subtract, media)
    const totalEntries = intOrZ(getTotalEntries[0].counts)
    const totalValid = intOrZ(getTotalEntries[0].totalValid)
    const totalValidWa = intOrZ(getTotalEntries[0].validWa1)
    const totalValidApp = intOrZ(getTotalEntries[0].totalValidApp)

    const totalUnlucky = intOrZ(getTotalEntries[0].totalUnlucky)

    const totalPending = intOrZ(getTotalEntries[0].totalPending)
    
    const totalInvalid = intOrZ(getTotalEntries[0].totalInvalid)
    const totalInvalidWa = intOrZ(getTotalEntries[0].invalidWa1)
    const totalInvalidApp = intOrZ(getTotalEntries[0].totalInvalidApp)
    
    const endDateIsNow = conditionTgt == 1 || conditionTgt == 2 || conditionTgt == 4 ? dayjs(endDate).isSameOrAfter(curDate) : dayjs(endDate, "YYYY-MM").isSameOrAfter(curMonth)
    // const response: any = await model.entriesSummary(subtract, conditionTgt, conditionTgt == 4 ? endDate : startDate, endDate)
    const response: any = await model.specialSummaryEntries(paramx, endDateIsNow)
    // let seriesWa1 = [];
    // let seriesWa2 = [];
    // let seriesWa3 = [];
    // let seriesMicrosite = [];
    // let seriesApp = [];
    // let categories = [];

    let seriesWa1: any = []
    let seriesWa2: any = []
    let seriesWa3: any = []
    let seriesApp: any = []
    let seriesMicrosite: any = []
    let categories: any = []

    let fixData = []
    let returnVallue = {
        DATE: "",
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
        validApp: 0,
        pendingApp: 0,
        invalidApp: 0,
        validMicrosite: 0,
        pendingMicrosite: 0,
        invalidMicrosite: 0,
        all: 0,
        allWa1: 0,
        allWa2: 0,
        allWa3: 0,
        allApp: 0,
        allMicrosite: 0
    }
    let total = {
        totalValid: 0,
        totalUnlucky: 0,
        totalPending: 0,
        totalInvalid: 0,
        totalValidWa1: 0,
        totalPendingWa1: 0,
        totalInvalidWa1: 0,
        totalValidWa2: 0,
        totalPendingWa2: 0,
        totalInvalidWa2: 0,
        totalValidWa3: 0,
        totalPendingWa3: 0,
        totalInvalidWa3: 0,
        totalValidApp: 0,
        totalPendingApp: 0,
        totalInvalidApp: 0,
        totalValidMicrosite: 0,
        totalPendingMicrosite: 0,
        totalInvalidMicrosite: 0,
        totalAll: 0,
        totalAllWa1: 0,
        totalAllWa2: 0,
        totalAllWa3: 0,
        totalAllApp: 0,
        totalAllMicrosite: 0
    }
    for (let index = 0; index < response.length; index++) { 
        
        const label = conditionTgt == 1 ? dayjs(response[index].label).format("YYYY-MM-DD") :
        conditionTgt == 2 ? weekRange(response[index].label) :
            conditionTgt == 3 ? dayjs(response[index].label).format("YYYY-MM") : dayjs(response[index].label, "HH").format("HH:mm:ss")

            if (index == 0) {
                returnVallue.DATE = label
                returnVallue.valid = +response[index].valid
                returnVallue.unlucky = +response[index].unlucky
                returnVallue.pending = +response[index].pending
                returnVallue.invalid = +response[index].invalid
                returnVallue.validWa1 = (+response[index].valid_wa_1 + +response[index].unlucky_wa_1)
                returnVallue.pendingWa1 = +response[index].pending_wa_1
                returnVallue.invalidWa1 = +response[index].invalid_wa_1
                returnVallue.validWa2 = (+response[index].valid_wa_2 + +response[index].unlucky_wa_2)
                returnVallue.pendingWa2 = +response[index].pending_wa_2
                returnVallue.invalidWa2 = +response[index].invalid_wa_2
                returnVallue.validWa3 = (+response[index].valid_wa_3 + +response[index].unlucky_wa_3)
                returnVallue.pendingWa3 = +response[index].pending_wa_3
                returnVallue.invalidWa3 = +response[index].invalid_wa_3
                returnVallue.validMicrosite = (+response[index].valid_microsite + +response[index].unlucky_microsite)
                returnVallue.pendingMicrosite = +response[index].pending_microsite
                returnVallue.invalidMicrosite = +response[index].invalid_microsite
                returnVallue.validApp = (+response[index].valid_app + +response[index].unlucky_app)
                returnVallue.pendingApp = +response[index].pending_app
                returnVallue.invalidApp = +response[index].invalid_app
                returnVallue.all = +response[index].total
                returnVallue.allWa1 = returnVallue.validWa1 + returnVallue.pendingWa1 + returnVallue.invalidWa1
                returnVallue.allWa2 = returnVallue.validWa2 + returnVallue.pendingWa2 + returnVallue.invalidWa2
                returnVallue.allWa3 = returnVallue.validWa3 + returnVallue.pendingWa3 + returnVallue.invalidWa3
                returnVallue.allMicrosite = returnVallue.validMicrosite + returnVallue.pendingMicrosite + returnVallue.invalidMicrosite
                returnVallue.allApp = returnVallue.validApp + returnVallue.pendingApp + returnVallue.invalidApp
                
            } else {
                if (returnVallue.DATE == label) {
                    returnVallue.valid += +response[index].valid
                    returnVallue.unlucky += +response[index].unlucky
                    returnVallue.pending += +response[index].pending
                    returnVallue.invalid += +response[index].invalid
                    returnVallue.validWa1 += (+response[index].valid_wa_1 + +response[index].unlucky_wa_1)
                    returnVallue.pendingWa1 += +response[index].pending_wa_1
                    returnVallue.invalidWa1 += +response[index].invalid_wa_1
                    returnVallue.validWa2 += (+response[index].valid_wa_2 + +response[index].unlucky_wa_2)
                    returnVallue.pendingWa2 += +response[index].pending_wa_2
                    returnVallue.invalidWa2 += +response[index].invalid_wa_2
                    returnVallue.validWa3 += (+response[index].valid_wa_3 + +response[index].unlucky_wa_3)
                    returnVallue.pendingWa3 += +response[index].pending_wa_3
                    returnVallue.invalidWa3 += +response[index].invalid_wa_3
                    returnVallue.validMicrosite += (+response[index].valid_microsite + +response[index].unlucky_microsite)
                    returnVallue.pendingMicrosite += +response[index].pending_microsite
                    returnVallue.invalidMicrosite += +response[index].invalid_microsite
                    returnVallue.validApp += (+response[index].valid_app + +response[index].unlucky_app)
                    returnVallue.pendingApp += +response[index].pending_app
                    returnVallue.invalidApp += +response[index].invalid_app
                    returnVallue.all += +response[index].total
                    returnVallue.allWa1 += returnVallue.validWa1 + returnVallue.pendingWa1 + returnVallue.invalidWa1
                    returnVallue.allWa2 += returnVallue.validWa2 + returnVallue.pendingWa2 + returnVallue.invalidWa2
                    returnVallue.allWa3 += returnVallue.validWa3 + returnVallue.pendingWa3 + returnVallue.invalidWa3
                    returnVallue.allMicrosite += returnVallue.validMicrosite + returnVallue.pendingMicrosite + returnVallue.invalidMicrosite
                    returnVallue.allApp += returnVallue.validApp + returnVallue.pendingApp + returnVallue.invalidApp
                } else {
                    fixData.push(returnVallue)
                    returnVallue = {
                        DATE: label,
                        valid: +response[index].valid,
                        unlucky: +response[index].unlucky,
                        pending: +response[index].pending,
                        invalid: +response[index].invalid,
                        validWa1: (+response[index].valid_wa_1 + +response[index].unlucky_wa_1),
                        pendingWa1: +response[index].pending_wa_1,
                        invalidWa1: +response[index].invalid_wa_1,
                        validWa2: (+response[index].valid_wa_2 + +response[index].unlucky_wa_2),
                        pendingWa2: +response[index].pending_wa_2,
                        invalidWa2: +response[index].invalid_wa_2,
                        validWa3: (+response[index].valid_wa_3 + +response[index].unlucky_wa_3),
                        pendingWa3: +response[index].pending_wa_3,
                        invalidWa3: +response[index].invalid_wa_3,
                        validMicrosite: (+response[index].valid_microsite + +response[index].unlucky_microsite),
                        pendingMicrosite: +response[index].pending_microsite,
                        invalidMicrosite: +response[index].invalid_microsite,
                        validApp: (+response[index].valid_app + +response[index].unlucky_app),
                        pendingApp: +response[index].pending_app,
                        invalidApp: +response[index].invalid_app,
                        all: +response[index].total,
                        allWa1: returnVallue.validWa1 + returnVallue.pendingWa1 + returnVallue.invalidWa1,
                        allWa2: returnVallue.validWa2 + returnVallue.pendingWa2 + returnVallue.invalidWa2,
                        allWa3: returnVallue.validWa3 + returnVallue.pendingWa3 + returnVallue.invalidWa3,
                        allMicrosite: returnVallue.validMicrosite + returnVallue.pendingMicrosite + returnVallue.invalidMicrosite,
                        allApp: returnVallue.validApp + returnVallue.pendingApp + returnVallue.invalidApp
                    }
                }
            }
            total.totalValid += +response[index].valid,
            total.totalUnlucky += +response[index].unlucky,
            total.totalPending += +response[index].pending,
            total.totalInvalid += +response[index].invalid,
            total.totalValidWa1 += (+response[index].valid_wa_1 + +response[index].unlucky_wa_1),
            total.totalPendingWa1 += +response[index].pending_wa_1,
            total.totalInvalidWa1 += +response[index].invalid_wa_1,
            total.totalValidWa2 += (+response[index].valid_wa_2 + +response[index].unlucky_wa_2),
            total.totalPendingWa2 += +response[index].pending_wa_2,
            total.totalInvalidWa2 += +response[index].invalid_wa_2,
            total.totalValidWa3 += (+response[index].valid_wa_3 + +response[index].unlucky_wa_3),
            total.totalPendingWa3 += +response[index].pending_wa_3,
            total.totalInvalidWa3 += +response[index].invalid_wa_3,
            total.totalValidMicrosite += (+response[index].valid_microsite + +response[index].unlucky_microsite),
            total.totalPendingMicrosite += +response[index].pending_microsite,
            total.totalInvalidMicrosite += +response[index].invalid_microsite,
            total.totalValidApp += (+response[index].valid_app + +response[index].unlucky_app),
            total.totalPendingApp += +response[index].pending_app,
            total.totalInvalidApp += +response[index].invalid_app,
            total.totalAll += +response[index].total,
            total.totalAllWa1 += returnVallue.validWa1 + returnVallue.pendingWa1 + returnVallue.invalidWa1,
            total.totalAllWa2 += returnVallue.validWa2 + returnVallue.pendingWa2 + returnVallue.invalidWa2,
            total.totalAllWa3 += returnVallue.validWa3 + returnVallue.pendingWa3 + returnVallue.invalidWa3,
            total.totalAllMicrosite += returnVallue.validMicrosite + returnVallue.pendingMicrosite + returnVallue.invalidMicrosite,
            total.totalAllApp += returnVallue.validApp + returnVallue.pendingApp + returnVallue.invalidApp
            const categoriesIndex = categories.findIndex((v: any) =>
                v == returnVallue.DATE
            )
            if (categoriesIndex < 0) {
                categories.push(returnVallue.DATE)
                seriesWa1.push(returnVallue.validWa1 + returnVallue.pendingWa1 + returnVallue.invalidWa1)
                seriesWa2.push(returnVallue.validWa2 + returnVallue.pendingWa2 + returnVallue.invalidWa2)
                seriesWa3.push(returnVallue.validWa3 + returnVallue.pendingWa3 + returnVallue.invalidWa3)
                seriesMicrosite.push(returnVallue.validMicrosite + returnVallue.pendingMicrosite + returnVallue.invalidMicrosite)
                seriesApp.push(returnVallue.validApp + returnVallue.pendingApp + returnVallue.invalidApp)
            } else {
                seriesWa1[categoriesIndex] = returnVallue.validWa1 + returnVallue.pendingWa1 + returnVallue.invalidWa1
                seriesWa2[categoriesIndex] = returnVallue.validWa2 + returnVallue.pendingWa2 + returnVallue.invalidWa2
                seriesWa3[categoriesIndex] = returnVallue.validWa3 + returnVallue.pendingWa3 + returnVallue.invalidWa3
                seriesMicrosite[categoriesIndex] = returnVallue.validMicrosite + returnVallue.pendingMicrosite + returnVallue.invalidMicrosite
                seriesApp[categoriesIndex] = returnVallue.validApp + returnVallue.pendingApp + returnVallue.invalidApp
            }
    }
    fixData.push(returnVallue)

    let resultData = {
        data: fixData,
        totalEntries,
        totalValid,
        totalValidWa: totalValidWa,
        totalValidApp: totalValidApp,
        totalUnlucky,
        totalPending,
        totalInvalid,
        totalInvalidWa: totalInvalidWa,
        totalInvalidApp: totalInvalidApp,
        total,
        seriesWa1, 
        seriesWa2, 
        seriesWa3, 
        seriesMicrosite, 
        seriesApp, 
        categories,
        mediaUsed: parseInt(mediaUsed[0].medias),
        columnsUsed,
        summarySeriesActive,
        periode: periodeData[0]
    }
 
    return resultData
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
        } as SummaryEntries

        const getSumEntries = await getData(params)
        return res.json(getSumEntries)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }

}

export default protectAPI(handler)