import { exeQuery } from "../../../lib/db";
import { SaveDataEntry } from "@/interfaces/entries.interface";

export const checkEntry = (entriesId: string) => {
  let checkQuery = "SELECT COUNT(*) as counts from entries WHERE id = ?";
  return exeQuery(checkQuery, [entriesId]);
};

export const areYouThere = (entriesId: string) => {
  let checkQuery =
    'SELECT COUNT(*) as counts from entries_variant WHERE "entriesId" = $1';
  return exeQuery(checkQuery, [entriesId]);
};

export const findCouponExist = (coupon: string) => {
  return exeQuery(`SELECT id FROM winner WHERE voucher_number = $1`, [coupon]);
};
export const submitVariant = (
  entryId: number,
  productId: number,
  quantity: number,
  amount: number,
  totalAmount: number
) => {
  let submitQuery =
    'INSERT INTO entries_variant ("entriesId", "productId", quantity, amount, total_amount) VALUES ($1, $2, $3, $4, $5)';
  return exeQuery(submitQuery, [
    entryId,
    productId,
    quantity,
    amount,
    totalAmount,
  ]);
};

// export const saveEntry = (params: SaveDataEntry) => {
//     let isApproved = params.isValid == 0 ? `is_approved_admin = 2, approvedById_admin = ${params.userId}, approved_date = NOW(),` : ""
//     let status = ""
//     if (params.isValid == '0') {
//         status = 'status = 0,'
//     }
//     let saveEntry = `
//         UPDATE
//             entries
//         SET
//             purchase_no_admin = ?,
//             purchase_date_admin = ?,
//             purchase_amount_admin = ?,
//             is_valid_admin = ?,
//             ${isApproved}
//             ${status}
//             invalid_reason_admin = ?,
//             store_name_admin = ?,
//             store_type_admin = ?,
//             store_channel_admin = ?,
//             isStamp = ?,
//             name = ?,
//             hp = ?,
//             city = ?
//         WHERE id = ?`
//     return exeQuery(saveEntry, [params.trx, params.purchaseDate, params.totalAmount, params.isValid, params.invalidId, params.storeName, params.storeType, params.storeChannel, params.isStamp, params.name, params.handphone, params.regency, params.entryId])
// }

export const saveEntry2 = (params: SaveDataEntry) => {
  let isApproved =
    params.isValid == 0
      ? `is_valid_admin = 2, is_approved_admin = 2, "approvedById_admin" = ${params.userId}, approved_date = NOW(),`
      : "is_valid_admin = 1,";
  // let status = ""
  // if (params.isValid == '0') {
  //     status = 'status = 0,'
  //     ${status}
  // }
  let saveEntry = `
        UPDATE 
            entries 
        SET 
            purchase_no_admin = $1,
            purchase_amount_admin = $2,
            purchase_date_admin = $3,
            "storeId" = $4,
            ${isApproved}
            "invalidReasonAdminId" = $5
        WHERE id = $6`;
  return exeQuery(saveEntry, [
    params.trx,
    params.totalAmount,
    params.purchaseDate,
    params.storeId == 0 ? null : params.storeId,
    params.invalidId,
    params.entryId,
  ]);
};

export const checkApprove = (entriesId: string) => {
  let chkEntry = `SELECT is_approved FROM entries where id = ?`;
  return exeQuery(chkEntry, [entriesId]);
};

export const checkApproveAdmin = (entriesId: string) => {
  let chkEntry = `SELECT is_approved_admin FROM entries where id = $1`;
  return exeQuery(chkEntry, [entriesId]);
};

export const getFewEntry = (entriesId: string) => {
  let chk = `SELECT id,voucher_number, purchase_amount_admin, "userId", "mediaId", name, sender, coupon, rcvd_time, hp, email FROM entries WHERE id = $1`;
  return exeQuery(chk, [entriesId]);
};

export const approveEntry = (
  isApproved: any,
  isValid: any,
  userId: any,
  replyId: any,
  status: string,
  entriesId: any
) => {
  let savEntry = `UPDATE entries SET is_approved = ?, is_valid = ?, approved_by = ?, approved_at = NOW(), reply_id = ?, status = ? WHERE id = ?`;
  return exeQuery(savEntry, [
    isApproved,
    isValid,
    userId,
    replyId,
    status,
    entriesId,
  ]);
};

export const checkWinnerByUser = (userId: string) => {
  return exeQuery(
    `SELECT id FROM winner WHERE "userId" = $1 AND (is_approved = 0 OR is_approved = 1)`,
    [userId]
  );
};

export const approveEntryAdmin = (
  userId: any,
  voucherNumber: string,
  entriesId: any
) => {
  // let savEntry = `UPDATE entries SET is_approved_admin = ?, approvedById_admin = ?, approved_date = NOW(), status = ? WHERE id = ?`
  // return exeQuery(savEntry, [isApproved, userId, status, entriesId])
  let savEntry = `UPDATE entries SET is_approved_admin = 1, "approvedById_admin" = $1, approved_date = NOW(), voucher_number = $2 WHERE id = $3`;
  return exeQuery(savEntry, [userId, voucherNumber, entriesId]);
};

export const approveEntryAdmin2 = (userId: any, entriesId: any) => {
  // let savEntry = `UPDATE entries SET is_approved_admin = ?, approvedById_admin = ?, approved_date = NOW(), status = ? WHERE id = ?`
  // return exeQuery(savEntry, [isApproved, userId, status, entriesId])
  let savEntry = `UPDATE entries SET is_approved_admin = 1, "approvedById_admin" = $1, approved_date = NOW() WHERE id = $2`;
  return exeQuery(savEntry, [userId, entriesId]);
};

export const approveEntryAdminSetCoupon = (
  userId: any,
  voucherNumber: string,
  entriesId: any
) => {
  // let savEntry = `UPDATE entries SET is_approved_admin = ?, approvedById_admin = ?, approved_date = NOW(), status = ? WHERE id = ?`
  // return exeQuery(savEntry, [isApproved, userId, status, entriesId])
  let savEntry = `UPDATE entries SET is_approved_admin = 1, "approvedById_admin" = $1, approved_date = NOW(), voucher_number = $2 WHERE id = $3`;
  return exeQuery(savEntry, [userId, voucherNumber, entriesId]);
};

export const deleteSaved = (entriesId: string) => {
  let deleteQuery = `DELETE FROM entries_variant WHERE "entriesId" = $1`;
  return exeQuery(deleteQuery, [entriesId]);
};

export const getRejectAdminId = () => {
  let checkQuery =
    'SELECT description, param FROM general_parameter WHERE description = "rejectAdmin"';
  return exeQuery(checkQuery, []);
};

export const rejectThis = (invalidId: string, userId: string, id: string) => {
  let rejectThis = `
        UPDATE 
            entries 
        SET 
            "invalidReasonAdminId" = $1,
            approved_date = NOW(),
            "approvedById_admin" = $2,
            is_valid_admin = 2,
            is_approved_admin = 2
        WHERE id = $3`;
  return exeQuery(rejectThis, [invalidId, userId, id]);
};

export const getPeriode = () => {
  let query = `SELECT periode_start AS "startDate", periode_end AS "endDate" FROM periode`;
  return exeQuery(query, []);
};

export const checkDuplicate = (
  trxNo: any,
  purchaseDateTime: any,
  id: string
) => {
  // let syntax = `SELECT id, sender, transaction_no
  //     FROM entries
  //     WHERE transaction_no = ? AND purchase_date = ? AND total_amount = ? AND id != ?`
  let syntax = `SELECT id, sender, purchase_no_admin 
    FROM entries 
    WHERE purchase_no_admin = $1 AND purchase_date_admin = $2 AND id != $3`;
  return exeQuery(syntax, [trxNo, purchaseDateTime, id]);
};

export const checkDuplicateVariant = (entriesId: string) => {
  let query = `SELECT SUM(amount) AS total FROM entries_variant WHERE entriesId = ?`;
  return exeQuery(query, [entriesId]);
};

export const getDuplicateData = (entriesId: string) => {
  let duplicate = `SELECT CONCAT(general_parameter.value, url) AS url FROM attachment JOIN (SELECT id FROM entries) AS entries On attachment."entriesId" = entries.id LEFT JOIN general_parameter ON general_parameter.name = 'imgUrl' WHERE entries.id = $1`;
  return exeQuery(duplicate, [entriesId]);
};

export const getGeneralParameterById = (id: string) => {
  let syntax = `SELECT id, description, value AS param FROM general_parameter WHERE id = $1`;
  return exeQuery(syntax, [id]);
};

export const checkWinnerLimit = () => {
  let syntax = `SELECT COUNT(1) AS counts FROM winner`;
  return exeQuery(syntax, []);
};

export const insertWinner = (
  entriesId: string,
  userId: string,
  accountNumber: string,
  voucher: string,
  brandId: any
) => {
  return exeQuery(
    `INSERT INTO winner ("entriesId","userId",account_number, code_topup, voucher_number, "masterBrandId") VALUES($1,$2,$3,'',$4,$5) RETURNING *`,
    [entriesId, userId, accountNumber, voucher, brandId]
  );
};

export const insertPulsaWinner = (
  entriesId: string,
  userId: string,
  accountNumber: string,
  brandId: any
) => {
  return exeQuery(
    `INSERT INTO winner ("entriesId","userId",account_number, code_topup, "masterBrandId", type) VALUES($1,$2,$3,'',$4, 2) RETURNING *`,
    [entriesId, userId, accountNumber, brandId]
  );
};

export const insertEntriesCoupon = (entriesId: string, path: string) => {
  return exeQuery(
    `INSERT INTO attachment ("entriesId",url, status) VALUES($1,$2, 5)`,
    [entriesId, path]
  );
};

export const addTrx = (winnerId: string, tgt: string, data: string) => {
  return exeQuery(
    `INSERT INTO transaction("winnerId", recipient, email_body) VALUES($1, $2, $3)`,
    [winnerId || null, tgt, data]
  );
};

export const getReplyById = (id: string) => {
  let syntax = `SELECT id, name, reply FROM reply WHERE id = ?`;
  return exeQuery(syntax, [id]);
};

export const insertNotif = (
  profileId: string,
  title: string,
  content: string,
  status: string
) => {
  let syntax = `INSERT INTO notification (profileId, title, content, status) VALUES (?,?,?,?)`;
  return exeQuery(syntax, [profileId, title, content, status]);
};

export const getInvalidReason = () => {
  let getRep = `SELECT id, name AS reason, status FROM invalid_reason ORDER BY id ASC`;
  return exeQuery(getRep, []);
};

export const getInvalidReasonById = (id: string) => {
  let getRep = `SELECT name FROM invalid_reason WHERE id = $1`;
  return exeQuery(getRep, [id]);
};

export const getUser = (username: string) => {
  const syntax = `SELECT id FROM user_mobile AS A WHERE A.username = $1`;
  return exeQuery(syntax, [username]);
};

export const getPushApprove = (promoId: number) => {
  const syntax = `SELECT value FROM general_parameter WHERE name = 'pushUrlA' AND promoId = ? AND status = 1 AND is_deleted = 0`;
  return exeQuery(syntax, [promoId]);
};

export const getPushReject = (promoId: number) => {
  const syntax = `SELECT value FROM general_parameter WHERE name = 'pushUrlR' AND promoId = ? AND status = 1 AND is_deleted = 0`;
  return exeQuery(syntax, [promoId]);
};

export const getMax = () => {
  return exeQuery(
    `SELECT value FROM general_parameter WHERE name = 'firstSubmitter'`,
    []
  );
};

export const getOvoPrizeId = () => {
  return exeQuery(`SELECT id FROM prize WHERE name_sub = 'evoucher'`, []);
};

export const getBrandId = () => {
  return exeQuery(`SELECT id FROM master_brand WHERE name = 'ACNEMED'`, []);
};

export const countFirst100 = () => {
  return exeQuery(
    `SELECT COUNT(1) AS total FROM winner WHERE is_approved IN(0, 1)`,
    []
  );
};

export const checkUniqueUserOnWinner = (userId: number) => {
  return exeQuery(
    `SELECT COUNT(1) AS counts FROM winner WHERE "userId" = $1 AND is_approved != 2`,
    [userId]
  );
};
export const startTransaction = () => {
  return exeQuery("START TRANSACTION", []);
};

export const commitTransaction = () => {
  return exeQuery("COMMIT", []);
};

export const rollback = () => {
  return exeQuery("ROLLBACK", []);
};
