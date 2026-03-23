import { exeQuery } from "@/lib/db";

export const checkEntry = (entriesId: string) => {
    let checkQuery = `SELECT is_valid from entries WHERE UPPER(coupon) LIKE $1 AND (is_valid = 1 OR "invalidReasonId" = 99)`
    return exeQuery(checkQuery, [`%${entriesId}%`])
}