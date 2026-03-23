import { exeQuery } from "@/lib/db";
import { multiPromo } from "../dashboard/_model";
// import dayjs from 'dayjs'

interface RgParams {
  row: string | number;
  page: string | number;
  key: string;
  direction: string;
  column: string;
  limit: number | string;
  isHaveAtt: number | string;
  media: string;
  startDate: string;
  endDate: string;
  prize: string;
  prizeId: string;
  userType: any;
  isValid: string;
  isApproved: string;
}

interface insertAttachment {
  entriesId: number;
  userId: number;
  url: string;
  createdById: number;
  wType: any;
}

interface insertTransaction {
  status: number;
  reason: string;
  hp: string;
  reference: string;
  proccesDate: string;
  createdById: number;
  winnerId: number;
  code: string;
  amount: string;
}

interface editParams {
  id: number;
  entriesId?: number;
  hp: string;
  voucherId: number;
  status: number;
  userId: number;
  ktpName?: string;
  ktpNumber?: string;
  accountNumber?: string;
  coupon?: string;
  reject?: string;
  brandId?: string;
  code?: string;
  type?: number;
  prizeId?: number;
  codeTopup?: number;
  amount?: number;
}

interface editTrxParams {
  id: number;
  name: string;
  bank_name: string;
  nomor_rekening: string;
  userId: number;
}

const statusWhere = (param: string) => {
  if (param == "4") {
    return ` AND B.status = 0`;
  } else if (param !== "") {
    return ` AND B.status = ${param}`;
  }
  return "";
};

const approveWhere = (param: string) => {
  if (param == "5") {
    return ` AND B.is_approved = 0`;
  } else if (param !== "") {
    return ` AND B.is_approved = ${param}`;
  }
  return "";
};

const havingAttachment = (item: number | string) => {
  if (item === "" || !item) {
    return "";
  } else {
    return ` HAVING COUNT(X.id) ${item === "1" ? "> 0" : "< 1"}`;
  }
};

export const editWinner = (params: editParams) => {
  const query = `UPDATE winner SET "updatedById" = $1, account_number = $2, "voucherId" = $3,status = $4 WHERE id = $5 AND status IN(0,3,4)`;
  return exeQuery(query, [
    params.userId,
    params.hp,
    params.voucherId,
    params.status,
    params.id,
  ]);
};

export const editWinner2 = (userId: number, id: number) => {
  const query = `UPDATE winner SET updatedById = ?, status = 2 WHERE id = ? AND status IN(0,3,4)`;
  return exeQuery(query, [userId, id]);
};

export const editWinnerTrx = (params: editTrxParams) => {
  const query = `UPDATE transaction SET "updatedById" = $1, name = $2, bank_name = $3, nomor_rekening = $4 WHERE "winnerId" = $5 AND is_deleted = 0`;
  return exeQuery(query, [
    params.userId,
    params.name,
    params.bank_name,
    params.nomor_rekening,
    params.id,
  ]);
};

export const setWinnerAsFailed = (params: editTrxParams) => {
  const query = `UPDATE winner SET updatedById = ?, status = 3 WHERE winnerId = ? AND is_deleted = 0`;
  return exeQuery(query, [params.userId, params.id]);
};

export const setWinnerAsSuccess = (params: editTrxParams) => {
  const query = `UPDATE winner SET updatedById = ?, status = 2 WHERE winnerId = ? AND is_deleted = 0`;
  return exeQuery(query, [
    params.userId,
    params.name,
    params.bank_name,
    params.nomor_rekening,
    params.id,
  ]);
};

export const editWinnerKTPOnly = (params: editParams) => {
  const query = `UPDATE winner SET updatedById = ?, ktp_number = ?, ktp_name = ? WHERE id = ? AND is_approved IN(0)`;
  return exeQuery(query, [
    params.userId,
    params.ktpNumber,
    params.ktpName,
    params.id,
  ]);
};

export const editWinnerKTPOnly2 = (params: editParams) => {
  const query = `UPDATE winner SET "updatedById" = $1, account_number = $2 WHERE id = $3 AND is_approved IN(0)`;
  return exeQuery(query, [params.userId, params.accountNumber, params.id]);
};

export const editWinnerKTPOnly3 = (params: editParams) => {
  const query = `UPDATE entries SET "updatedById" = $1, ktp_name_admin = $2, id_number_admin = $3 WHERE id = $4`;
  return exeQuery(query, [
    params.userId,
    params.ktpName,
    params.ktpNumber,
    params.entriesId,
  ]);
};

export const editAndApproveWinnerKTPOnly = (
  approve: number,
  params: editParams
) => {
  const query = `UPDATE winner SET is_approved = ?, updatedById = ?, ktp_number = ?, ktp_name = ?, rejectId = ? WHERE id = ? AND is_approved IN(0)`;
  return exeQuery(query, [
    approve,
    params.userId,
    params.ktpNumber,
    params.ktpName,
    params.reject || null,
    params.id,
  ]);
};

export const editAndApproveWinnerKTPOnly2 = (
  approve: number,
  params: editParams
) => {
  const query = `UPDATE winner SET updatedById = ?, account_number = ?, ktp_number = ?, ktp_name = ?, coupon = ?, voucherId = ?, rejectId = ? WHERE id = ? AND is_approved IN(0)`;
  return exeQuery(query, [
    params.userId,
    params.accountNumber,
    params.ktpNumber,
    params.ktpName,
    params.coupon,
    params.voucherId,
    params.reject || null,
    params.id,
  ]);
};

export const setPrizeForWinner = (params: editParams) => {
  const query = `UPDATE winner SET  is_approved = 1, "updatedById" = $1, "prizeId" = $2, "voucherId" = $3, code_topup = $4, amount = $5  WHERE id = $6 AND is_approved IN(0)`;
  return exeQuery(query, [
    params.userId,
    params.prizeId,
    params.voucherId,
    params.codeTopup,
    params.amount,
    params.id,
  ]);
};

export const fillKTPAndName = (params: editParams, entryId: any) => {
  return exeQuery(
    `UPDATE entries SET ktp_name_admin = $1, id_number_admin = $2 WHERE id = $3`,
    [params.ktpName, params.ktpNumber, entryId]
  );
};

export const getVoucherId = (prizeId: number) => {
  return exeQuery(
    `SELECT name, "voucherId", codes, amount FROM prize WHERE id = $1`,
    [prizeId]
  );
};
export const checkKTPAnotherUser = (
  userId: number,
  ktpNumber: string
): Promise<any> => {
  const query =
    "SELECT COUNT(1) cnt FROM winner WHERE is_approved = 1 AND ktp_number = ? AND userId != ?";
  return exeQuery(query, [ktpNumber, userId]);
};

export const checkCoupon = (userId: number, coupon: string): Promise<any> => {
  const query =
    "SELECT COUNT(1) cnt FROM winner WHERE is_approved = 1 AND coupon = ? AND userId != ?";
  return exeQuery(query, [coupon, userId]);
};

export const rejectWinner = (
  winnerId: number,
  updatedById: number,
  reason: number
) => {
  const query = `UPDATE winner SET "updatedById" = $1, "invalidReasonId" = $2, is_approved = 2, "prizeId" = NULL, type = 0 WHERE id = $3`;
  return exeQuery(query, [updatedById, reason, winnerId]);
};

export const updatedByWinner = (userId: number, winnerId: number) => {
  let query = `UPDATE winner SET "updatedById" = $1 WHERE id = $2`;
  return exeQuery(query, [userId, winnerId]);
};

export const updateKtpUser = (
  userId: number,
  ktpNumber: string,
  idType: number
) => {
  const query = "UPDATE users SET identity = ?, id_type = ? WHERE id = ?";
  return exeQuery(query, [ktpNumber, idType, userId]);
};

export const updateEntriesGrosir = (
  entryId: number,
  name: string,
  hp: string,
  address: string,
  przType: string
) => {
  let query;
  if (przType == "1") {
    query =
      "UPDATE entries_grosir SET store = ?, hp = ?, address = ? WHERE id = ?";
  } else {
    query = "UPDATE winner SET name = ?, hp = ?, address = ? WHERE id = ?";
  }
  return exeQuery(query, [name, hp, address, entryId]);
};

export const rejectEntriesGrosir = (
  reject: any,
  entryId: number,
  isClient: any
) => {
  let query = isClient
    ? "UPDATE winner SET is_approved = 2, reject_client = ? WHERE id = ?"
    : "UPDATE winner SET is_approved = 2, rejectId = ? WHERE id = ?";
  return exeQuery(query, [reject || "", entryId]);
};

export const getHistoryId = (id: number) => {
  return exeQuery(`SELECT id FROM history WHERE "winnerId" = $1`, [id]);
};

export const addHistoryDetail = (id: number, desc: string) => {
  return exeQuery(
    `INSERT INTO history_detail ("historyId", description, status) VALUES ($1, $2, 1)`,
    [id, desc]
  );
};

export const getRejectDesc = (id: number) => {
  return exeQuery(`SELECT name FROM invalid_reason WHERE id = $1`, [id]);
};

export const updateWinnerData = (entryId: number, userUpdater: number) => {
  const query = `UPDATE winner SET "updatedById" = $1, is_approved = 1 WHERE id = $2`;
  return exeQuery(query, [userUpdater, entryId]);
};

export const getApproveURLpush = () => {
  const query =
    "SELECT VALUE AS push FROM general_parameter WHERE NAME = 'approveUrl'";
  return exeQuery(query, []);
};

export const getTopupURL = () => {
  const query =
    "SELECT VALUE AS push FROM general_parameter WHERE NAME = 'apiTopup'";
  return exeQuery(query, []);
};

export const getRejectURLpush = () => {
  const query =
    "SELECT VALUE AS push FROM general_parameter WHERE NAME = 'pushUrlR'";
  return exeQuery(query, []);
};

export const getURLSent = () => {
  const query =
    "SELECT VALUE AS push FROM general_parameter WHERE NAME = 'pushUrlS'";
  return exeQuery(query, []);
};

export const getSAP = () => {
  const query =
    "SELECT VALUE AS push FROM general_parameter WHERE NAME = 'pushSAP'";
  return exeQuery(query, []);
};

export const getPushNotif = () => {
  const query =
    "SELECT VALUE AS push FROM general_parameter WHERE NAME = 'apiPushNotif'";
  return exeQuery(query, []);
};

export const getSuc = (prz: string, type: string) => {
  const query =
    "SELECT REPLACE(value, 'XXXXXX', $1) AS push FROM general_parameter WHERE NAME = $2";
  return exeQuery(query, [prz, type]);
};

export const getRej = (prz: string, type: string) => {
  const query =
    "SELECT REPLACE(REPLACE(value, 'YYYYYY', $1), 'XXXXXX', $2) AS push FROM general_parameter WHERE NAME = 'failedResp'";
  return exeQuery(query, [prz, type]);
};

const typeWhere = (param: string) => {
  if (param === "user") {
    return " AND (B.user_type = 1)";
  }
  if (param === "grosir") {
    return " AND (B.user_type = 2)";
  }
  if (param === "sales") {
    return " AND (B.user_type = 3)";
  }
  return "";
};

const orderBy = (params: RgParams) => {
  const directionType =
    params.direction == "ascend"
      ? "ASC"
      : params.direction == "descend"
      ? "DESC"
      : "";
  if (params.column == "" || directionType == "") {
    return " ORDER BY B.created_at DESC";
  } else {
    return ` ORDER BY "${params.column}"  ${directionType}`;
  }
};

const keyWhere2 = (params: RgParams) => {
  if (params.key == "") {
    return "";
  } else {
    return ` AND (C.hp LIKE '%${params.key}%' OR C.store LIKE '%${params.key}%' OR E.fullname LIKE '%${params.key}%' OR E.hp LIKE '%${params.key}%' OR E.regency LIKE '%${params.key}%' OR E.identity LIKE '%${params.key}%' OR A.coupon LIKE '%${params.key}%')`;
  }
};

const keyWhere = (params: RgParams) => {
  if (params.key == "") {
    return "";
  } else {
    return ` AND (UPPER(E.fullname) LIKE '%${params.key}%' OR UPPER(A.sender) LIKE '%${params.key}%' OR UPPER(E.hp) LIKE '%${params.key}%' OR UPPER(B.account_number) LIKE '%${params.key}%' OR UPPER(E.regency) LIKE '%${params.key}%' OR UPPER(E.identity) LIKE '%${params.key}%' OR UPPER(A.coupon) LIKE '%${params.key}%')`;
  }
};

const prizeIdWhere = (prize: string) => {
  if (prize === "" || !prize) {
    return "";
  } else {
    return ` AND D.id = ${prize}`;
  }
};

const first100Where = (prize: string) => {
  if (prize == "evoucher") {
    return ` AND B.type = 2`;
  } else {
    return ``;
  }
};

const dateWhere = (startDate: string, endDate: string) => {
  if (startDate == "" || endDate == "") {
    return "";
  } else {
    return ` AND DATE(A.rcvd_time) BETWEEN '${startDate}' AND '${endDate}'`;
  }
};

// const mediaWhere = (media: string) => {
//     if (media == "") {
//         return ""
//     } else {
//         return ` AND (profiles.media = ${media})`
//     }
// }
// export const countWinner = (params: RgParams) => {
//     let countQuery = params.userType === 'sales' ?
//     `SELECT
//     COUNT(1) OVER () AS counts
//     FROM winner B
//     LEFT JOIN entries_grosir C ON C.id = B.entriesGrosirId
//     LEFT JOIN entries A ON C.entriesId = A.id
//     LEFT JOIN users E ON E.id = B.userId
//     LEFT JOIN prize D ON B.prizeId = D.id
//     LEFT JOIN voucher F ON B.voucherId = F.id
//     LEFT JOIN attachment X ON B.id = X.winnerId
//     WHERE 0 = 0 ${approveWhere(params.isApproved)}${statusWhere(params.status)}${typeWhere(params.userType)}${keyWhere2(params)}${dateWhere(params.startDate, params.endDate)}${prizeWhere(params.prize)} GROUP BY B.id ${havingAttachment(params.isHaveAtt)} ${orderBy(params)}`
//     :
//     params.userType === 'grosir' ?
//     `SELECT
//     COUNT(1) OVER () AS counts
//     FROM winner B
//     LEFT JOIN entries_grosir C ON C.id = B.entriesGrosirId
//     LEFT JOIN entries A ON C.entriesId = A.id
//     LEFT JOIN users E ON E.id = B.userId
//     LEFT JOIN prize D ON B.prizeId = D.id
//     LEFT JOIN voucher F ON B.voucherId = F.id
//     LEFT JOIN attachment X ON B.id = X.winnerId
//     WHERE 0 = 0 ${approveWhere(params.isApproved)}${statusWhere(params.status)}${typeWhere(params.userType)}${keyWhere2(params)}${dateWhere(params.startDate, params.endDate)}${prizeWhere(params.prize)} GROUP BY B.id ${havingAttachment(params.isHaveAtt)} ${orderBy(params)}`
//     :
//     `SELECT
//     COUNT(1) OVER () AS counts
//     FROM winner B
//     LEFT JOIN entries A ON B.entriesId = A.id
//     LEFT JOIN users E ON E.id = B.userId
//     LEFT JOIN prize D ON B.prizeId = D.id
//     LEFT JOIN voucher F ON B.voucherId = F.id
//     LEFT JOIN attachment X ON B.id = X.winnerId
//     WHERE 0 = 0 ${approveWhere(params.isApproved)}${statusWhere(params.status)}${typeWhere(params.userType)}${keyWhere(params)}${dateWhere(params.startDate, params.endDate)}${prizeWhere(params.prize)} GROUP BY B.id ${havingAttachment(params.isHaveAtt)} ${orderBy(params)}`
//     return exeQuery(countQuery, []);
// };

export const countWinner = (params: RgParams) => {
  let countQuery = `SELECT
    COUNT(1) OVER () AS counts
    FROM winner B 
    LEFT JOIN entries A ON B."entriesId" = A.id 
    LEFT JOIN users E ON E.id = B."userId" 
    LEFT JOIN prize D ON B."prizeId" = D.id
    LEFT JOIN voucher F ON B."voucherId" = F.id
    WHERE 0 = 0 ${prizeIdWhere(params.prizeId)} ${approveWhere(
    params.isApproved
  )}${statusWhere(params.isValid)}${keyWhere(params)}${dateWhere(
    params.startDate,
    params.endDate
  )} ${first100Where(params.prize)} GROUP BY B.id, A.created_at`;
  return exeQuery(countQuery, []);
};

export const getUser = (username: string) => {
  const query = `SELECT id FROM user_mobile WHERE user_mobile.username = $1`;
  return exeQuery(query, [username]);
};

export const getPromoIdSAP = () => {
  const query = `SELECT value FROM general_parameter WHERE name = 'programId'`;
  return exeQuery(query, []);
};

export const revertAllocation = (allocationId: number) => {
  const query =
    "UPDATE allocation SET allocation.status = 0, allocation.used_date = null WHERE id = ?";
  return exeQuery(query, [allocationId]);
};

// export const listWinner = (params: RgParams) => {
//     let listWinnerQuery =
//     params.userType === 'sales' ?
//     `SELECT
//     B.approvalStep,
//     C.id entriesId,
//     B.voucherId,
//     B.id,
//     A.rcvd_time created_at,
//     C.store AS sales_name,
//     E.fullname name,
//     C.hp sender,
//     E.id_type,
//     B.ktp_name,
//     B.ktp_number,
//     A.coupon kodeUnik,
//     B.account_number hpTopup,
//     B.userId,
//     D.name prize,
//     D.categoryId prizeCat,
//     B.status,
//     B.is_approved,
//     B.is_push,
//     B.is_sent,
//     D.categoryId,
//     F.type AS voucherType
//     FROM winner B
//     LEFT JOIN entries_grosir C ON C.id = B.entriesGrosirId
//     LEFT JOIN entries A ON C.entriesId = A.id
//     LEFT JOIN users E ON E.id = B.userId
//     LEFT JOIN prize D ON B.prizeId = D.id
//     LEFT JOIN voucher F ON B.voucherId = F.id
//     LEFT JOIN attachment X ON B.id = X.winnerId
//     WHERE 0 = 0 ${approveWhere(params.isApproved)}${statusWhere(params.status)}${typeWhere(params.userType)}${keyWhere2(params)}${dateWhere(params.startDate, params.endDate)}${prizeWhere(params.prize)} GROUP BY B.id ${havingAttachment(params.isHaveAtt)} ${orderBy(params)} ${params.limit}`
//     :
//     params.userType === 'grosir' ?
//     `SELECT
//     B.approvalStep,
//     C.id entriesId,
//     B.voucherId,
//     B.id,
//     A.rcvd_time created_at,
//     C.store AS store_name,
//     E.fullname name,
//     C.hp sender,
//     E.id_type,
//     B.ktp_name,
//     B.ktp_number,
//     A.coupon kodeUnik,
//     B.account_number hpTopup,
//     B.userId,
//     D.name prize,
//     D.categoryId prizeCat,
//     B.status,
//     B.is_approved,
//     B.is_push,
//     B.is_sent,
//     D.categoryId,
//     F.type AS voucherType
//     FROM winner B
//     LEFT JOIN entries_grosir C ON C.id = B.entriesGrosirId
//     LEFT JOIN entries A ON C.entriesId = A.id
//     LEFT JOIN users E ON E.id = B.userId
//     LEFT JOIN prize D ON B.prizeId = D.id
//     LEFT JOIN voucher F ON B.voucherId = F.id
//     LEFT JOIN attachment X ON B.id = X.winnerId
//     WHERE 0 = 0 ${approveWhere(params.isApproved)}${statusWhere(params.status)}${typeWhere(params.userType)}${keyWhere2(params)}${dateWhere(params.startDate, params.endDate)}${prizeWhere(params.prize)} GROUP BY B.id ${havingAttachment(params.isHaveAtt)} ${orderBy(params)} ${params.limit}`
//     :
//     `SELECT
//     A.id entriesId,
//     B.voucherId,
//     B.id,
//     A.rcvd_time created_at,
//     E.fullname name,
//     E.hp sender,
//     E.id_type,
//     B.ktp_name,
//     B.ktp_number,
//     A.coupon kodeUnik,
//     B.account_number hpTopup,
//     B.userId,
//     D.name prize,
//     D.categoryId prizeCat,
//     B.status,
//     B.is_approved,
//     B.is_push,
//     B.is_sent,
//     D.categoryId
//     FROM winner B
//     LEFT JOIN entries A ON B.entriesId = A.id
//     LEFT JOIN users E ON E.id = B.userId
//     LEFT JOIN prize D ON B.prizeId = D.id
//     LEFT JOIN voucher F ON B.voucherId = F.id
//     LEFT JOIN attachment X ON B.id = X.winnerId
//     WHERE 0 = 0 ${approveWhere(params.isApproved)}${statusWhere(params.status)}${typeWhere(params.userType)}${keyWhere(params)}${dateWhere(params.startDate, params.endDate)}${prizeWhere(params.prize)} GROUP BY B.id ${havingAttachment(params.isHaveAtt)} ${orderBy(params)} ${params.limit}`
//     return exeQuery(listWinnerQuery, []);
// };

export const listWinner = (params: RgParams) => {
  // console.log(params, "0809808089909890");

  let exC = params.prize == "evoucher" ? ` B.status, B.is_approved,` : "";
  let listWinnerQuery = `SELECT
    B."entriesId",
    B.id,
    B."prizeId",
    B.created_at,
    B.updated_at AS last_updated,
    E.fullname AS name,
    A.id_number AS ktp,
    G.name AS media,
    B.account_number AS no_wa,
    D.name AS prize,
    D."categoryId" AS "prizeCat",
    A.voucher_number AS coupon_number,
    ${exC}
    D."categoryId",
    (CASE WHEN (B.is_approved = 0 AND (B.updated_at < current_date - interval '1 day')) THEN 1 ELSE 0 END) AS "mustReject",
    COUNT(H.id) AS attachments
    FROM winner B 
    LEFT JOIN entries A ON B."entriesId" = A.id 
    LEFT JOIN users E ON E.id = B."userId" 
    LEFT JOIN prize D ON B."prizeId" = D.id
    LEFT JOIN voucher F ON B."voucherId" = F.id
    LEFT JOIN media G ON A."mediaId" = G.id
    LEFT JOIN attachment H ON B.id = H."winnerId"
    WHERE 0 = 0 ${prizeIdWhere(params.prizeId)} ${approveWhere(
    params.isApproved
  )}${statusWhere(params.isValid)}${keyWhere(params)}${dateWhere(
    params.startDate,
    params.endDate
  )} ${first100Where(
    params.prize
  )} GROUP BY B.id, A.id, E.fullname, E.hp, E.id_type, D.name, D."categoryId", G.id ${orderBy(
    params
  )} ${params.limit}`;
  return exeQuery(listWinnerQuery, []);
};

export const insertAttachment = (params: insertAttachment) => {
  let query = `INSERT INTO attachment(url,status,"winnerId","createdById") VALUES($1,$2,$3,$4) RETURNING *`;
  return exeQuery(query, [params.url, 1, params.entriesId, params.createdById]);
};

export const nonActiveAttachment = (id: string) => {
  let stx = `UPDATE attachment SET status = 0 WHERE entriesId = ?`;
  return exeQuery(stx, [id]);
};

export const setActiveAttachment = (entryId: string, id: string) => {
  let stx = `UPDATE attachment SET "winnerId" = $1 WHERE id = $2`;
  return exeQuery(stx, [entryId, id]);
};

// export const exprtWinner = (params: RgParams) => {
//     let query =
//     params.userType === 'sales' ?
//     `SELECT
//         B.id WINNER_ID,
//             A.id ENTRIES_ID,
//             DATE_FORMAT(A.rcvd_time, '%Y-%M-%d %H:%i:%S') RECEIVED_DATE,
//             DATE_FORMAT(B.updated_at, '%Y-%M-%d %H:%i:%S') CLAIM_DATE,
//         L.store AS sales_name,
//         B.name AS sales_name_modified,
//         L.address AS sales_address,
//         B.address AS sales_address_modified,
//             E.fullname,
//             E.ref_code,
//             E.hp HP,
//         B.hp AS sales_hp_modified,
//             E.identity KTP,
//         H.name AS profession,
//             A.coupon unique_code,
//             GROUP_CONCAT(CONCAT(X.value, '/api/images/', C.url) SEPARATOR ", ") url_photo,
//             (
//                     CASE B.is_approved WHEN 0 THEN "PENDING" WHEN 1 THEN "APPROVED" WHEN 2 THEN "REJECTED" END
//             ) STATUS_APPROVE,
//             (
//                     CASE WHEN F.name IS NOT NULL THEN
//                             CONCAT(D.name, " - ", F.name)
//                     ELSE
//                             D.name
//                     END) PRIZE,
//             (
//                     CASE WHEN B.status = 0 THEN
//                             "Unprocessed"
//                     WHEN B.status = 2 THEN
//                             "Success"
//                     WHEN B.status = 3 THEN
//                             "Failed"
//                     ELSE
//                             "Processed"
//                     END) STATUS,
//             B.account_number TOPUP_NUMBER,
//         A.redeem redeemCode,
//             GROUP_CONCAT(G.sn SEPARATOR '
//     ') SERIAL_NUMBER,
//         B.ktp_name AS inputtedKTPname,
//         B.ktp_number AS inputterKTPnumber,
//         I.reason AS reject_reason,
//         B.reject_client,
//         J.name AS shippingMethod,
//         B.shipping_courier_name AS autan_courier_name,
//         B.shipping_courier_phone AS autan_courier_phone,
//         B.name AS sapNameInput,
//         B.hp AS sapHPInput,
//         B.address AS sapAddressInput,
//         B.postal_code AS sapKodeposInput,
//         B.district AS sapDistrictInput,
//         B.quantity AS sapQuantityInput,
//         B.approver AS sapApproverInput
//     FROM
//         winner B
//         LEFT JOIN entries_grosir L ON L.id = B.entriesGrosirId
//         LEFT JOIN entries A ON L.entriesId = A.id
//         JOIN users E ON E.id = B.userId
//         LEFT JOIN job H ON E.jobId = H.id
//         LEFT JOIN prize D ON B.prizeId = D.id
//         LEFT JOIN voucher F ON B.voucherId = F.id
//         LEFT JOIN transaction G ON B.id = G.winnerId
//         LEFT JOIN attachment C ON (A.id = C.entriesId OR B.id = C.winnerId)
//         LEFT JOIN reject_reason I ON I.id = B.rejectId
//         LEFT JOIN general_parameter X ON X.name = "imgUrl"
//         LEFT JOIN master_shipping J ON B.masterShippingId = J.id
//         WHERE 0 = 0 ${dateWhere(params.startDate, params.endDate)}${statusWhere(params.status)}${typeWhere(params.userType)}${keyWhere(params)}${prizeWhere(params.prize)} GROUP BY B.id  ${orderBy(params)}`:
// params.userType === 'grosir' ?
// `SELECT
//     B.id WINNER_ID,
//     A.id ENTRIES_ID,
//     DATE_FORMAT(A.rcvd_time, '%Y-%M-%d %H:%i:%S') RECEIVED_DATE,
//     DATE_FORMAT(B.updated_at, '%Y-%M-%d %H:%i:%S') CLAIM_DATE,
//     L.store AS store_name,
//     B.name AS store_name_modified,
//     B.hp AS store_hp_modified,
//     E.fullname,
//     E.ref_code,
//     E.hp HP,
//     L.address AS store_address,
//     B.address AS store_address_modified,
//     E.identity KTP,
//     H.name AS profession,
//     A.coupon unique_code,
//     GROUP_CONCAT(CONCAT(X.value, '/api/images/', C.url) SEPARATOR ", ") url_photo,
//     (
//             CASE B.is_approved WHEN 0 THEN "PENDING" WHEN 1 THEN "APPROVED" WHEN 2 THEN "REJECTED" END
//     ) STATUS_APPROVE,
//     (
//             CASE WHEN F.name IS NOT NULL THEN
//                     CONCAT(D.name, " - ", F.name)
//             ELSE
//                     D.name
//             END) PRIZE,
//     (
//             CASE WHEN B.status = 0 THEN
//                     "Unprocessed"
//             WHEN B.status = 2 THEN
//                     "Success"
//             WHEN B.status = 3 THEN
//                     "Failed"
//             ELSE
//                     "Processed"
//             END) STATUS,
//     B.account_number TOPUP_NUMBER,
//     A.redeem redeemCode,
//     GROUP_CONCAT(G.sn SEPARATOR '
//     ') SERIAL_NUMBER,
//     B.ktp_name AS inputtedKTPname,
//     B.ktp_number AS inputterKTPnumber,
//     I.reason AS reject_reason,
//     B.reject_client,
//     J.name AS shippingMethod,
//     B.shipping_courier_name AS autan_courier_name,
//     B.shipping_courier_phone AS autan_courier_phone,
//     B.name AS sapNameInput,
//     B.hp AS sapHPInput,
//     B.address AS sapAddressInput,
//     B.postal_code AS sapKodeposInput,
//     B.district AS sapDistrictInput,
//     B.quantity AS sapQuantityInput,
//     B.approver AS sapApproverInput
// FROM
// 	winner B
//     LEFT JOIN entries_grosir L ON L.id = B.entriesGrosirId
// 	LEFT JOIN entries A ON L.entriesId = A.id
// 	JOIN users E ON E.id = B.userId
//     LEFT JOIN job H ON E.jobId = H.id
// 	LEFT JOIN prize D ON B.prizeId = D.id
// 	LEFT JOIN voucher F ON B.voucherId = F.id
// 	LEFT JOIN transaction G ON B.id = G.winnerId
// 	LEFT JOIN attachment C ON (A.id = C.entriesId OR B.id = C.winnerId)
//     LEFT JOIN reject_reason I ON I.id = B.rejectId
//     LEFT JOIN general_parameter X ON X.name = "imgUrl"
//     LEFT JOIN master_shipping J ON B.masterShippingId = J.id
//     WHERE 0 = 0 ${dateWhere(params.startDate, params.endDate)}${statusWhere(params.status)}${typeWhere(params.userType)}${keyWhere(params)}${prizeWhere(params.prize)} GROUP BY B.id  ${orderBy(params)}`:

//     `SELECT
// 	B.id WINNER_ID,
// 	A.id ENTRIES_ID,
// 	DATE_FORMAT(A.rcvd_time, '%Y-%M-%d %H:%i:%S') RECEIVED_DATE,
// 	DATE_FORMAT(B.updated_at, '%Y-%M-%d %H:%i:%S') CLAIM_DATE,
// 	E.fullname,
// 	E.ref_code,
// 	E.hp HP,
// 	E.identity KTP,
//     H.name AS profession,
// 	A.coupon unique_code,
// 	GROUP_CONCAT(CONCAT(X.value, '/api/images/', C.url) SEPARATOR ", ") url_photo,
// 	(
// 		CASE B.is_approved WHEN 0 THEN "PENDING" WHEN 1 THEN "APPROVED" WHEN 2 THEN "REJECTED" END
// 	) STATUS_APPROVE,
// 	(
// 		CASE WHEN F.name IS NOT NULL THEN
// 			CONCAT(D.name, " - ", F.name)
// 		ELSE
// 			D.name
// 		END) PRIZE,
// 	(
// 		CASE WHEN B.status = 0 THEN
// 			"Unprocessed"
// 		WHEN B.status = 2 THEN
// 			"Success"
// 		WHEN B.status = 3 THEN
// 			"Failed"
// 		ELSE
// 			"Processed"
// 		END) STATUS,
// 	B.account_number TOPUP_NUMBER,
//     A.redeem redeemCode,
// 	GROUP_CONCAT(G.sn SEPARATOR '\n') SERIAL_NUMBER,
//     B.ktp_name AS inputtedKTPname,
//     B.ktp_number AS inputterKTPnumber,
//     I.reason AS reject_reason,
//     B.reject_client,
//     J.name AS shippingMethod,
//     B.shipping_courier_name AS autan_courier_name,
//     B.shipping_courier_phone AS autan_courier_phone,
//     B.name AS sapNameInput,
//     B.hp AS sapHPInput,
//     B.address AS sapAddressInput,
//     B.postal_code AS sapKodeposInput,
//     B.district AS sapDistrictInput,
//     B.quantity AS sapQuantityInput,
//     B.approver AS sapApproverInput
// FROM
// 	winner B
// 	LEFT JOIN entries A ON B.entriesId = A.id
// 	JOIN users E ON E.id = B.userId
//     LEFT JOIN job H ON E.jobId = H.id
// 	LEFT JOIN prize D ON B.prizeId = D.id
// 	LEFT JOIN voucher F ON B.voucherId = F.id
// 	LEFT JOIN transaction G ON B.id = G.winnerId
// 	LEFT JOIN attachment C ON (A.id = C.entriesId OR B.id = C.winnerId)
//     LEFT JOIN reject_reason I ON I.id = B.rejectId
//     LEFT JOIN general_parameter X ON X.name = "imgUrl"
//     LEFT JOIN master_shipping J ON B.masterShippingId = J.id
//     WHERE 0 = 0 ${dateWhere(params.startDate, params.endDate)}${statusWhere(params.status)}${typeWhere(params.userType)}${keyWhere(params)}${prizeWhere(params.prize)} GROUP BY B.id  ${orderBy(params)}`;

//     return exeQuery(query, [])
// }

export const exprtWinner = (params: RgParams) => {
  let query = `SELECT
    	B.id WINNER_ID,
    	A.id ENTRIES_ID,
    	TO_CHAR(A.rcvd_time, 'DD/MM/YYYY') RECEIVED_DATE,
    	TO_CHAR(B.updated_at, 'DD/MM/YYYY HH:mm:ss') CLAIM_DATE,
    	E.fullname,
    	E.ref_code,
        A.sender,
    	E.hp HP,
    	E.identity KTP,
    	A.coupon unique_code,
    	STRING_AGG(CONCAT(C.url), ', ') url_photo,
    	(
    		CASE B.is_approved WHEN 0 THEN 'PENDING' WHEN 1 THEN 'APPROVED' WHEN 2 THEN 'REJECTED' END
    	) STATUS_APPROVE,
    	(
    		CASE WHEN F.name IS NOT NULL THEN
    			CONCAT(D.name, ' - ', F.name)
    		ELSE
    			D.name
    		END) PRIZE,
    	(
    		CASE WHEN B.status = 0 THEN
    			'Unprocessed'
    		WHEN B.status = 2 THEN
    			'Success'
    		WHEN B.status = 3 THEN
    			'Failed'
    		ELSE
    			'Processed'
    		END) AS STATUS,
    	B.account_number TOPUP_NUMBER,
        STRING_AGG(CONCAT(G.sn), '\n') SERIAL_NUMBER,
        STRING_AGG(CONCAT(G.proccesed_date), '\n') PROCESSED_DATE_TOPUP,
        A.ktp_name_admin AS "inputtedKTPname",
        A.id_number_admin AS "inputterKTPnumber",
        I.name AS invalid_reasons
    FROM
    	winner B
    	LEFT JOIN entries A ON B."entriesId" = A.id
    	JOIN users E ON E.id = B."userId"
    	LEFT JOIN prize D ON B."prizeId" = D.id
    	LEFT JOIN voucher F ON B."voucherId" = F.id
    	LEFT JOIN transaction G ON B.id = G."winnerId"
    	LEFT JOIN attachment C ON A.id = C."entriesId"
        LEFT JOIN invalid_reason I ON I.id = B."invalidReasonId"
        LEFT JOIN general_parameter X ON X.name = 'imgUrl'
        WHERE 0 = 0 ${dateWhere(
          params.startDate,
          params.endDate
        )}${approveWhere(params.isApproved)}${statusWhere(
    params.isValid
  )}${keyWhere(params)}${prizeIdWhere(
    params.prizeId
  )} GROUP BY A.id, B.id, E.fullname, E.ref_code, E.hp, E.identity, F.name, D.name, I.name ${orderBy(
    params
  )}`;

  return exeQuery(query, []);
};

export const exprtWinnerWTr = (params: RgParams, threshold: number) => {
  let query = `SELECT
    	B.id WINNER_ID,
    	A.id ENTRIES_ID,
    	E.id USER_ID,
    	TO_CHAR(A.rcvd_time, 'DD/MM/YYYY') RECEIVED_DATE,
    	TO_CHAR(B.updated_at, 'DD/MM/YYYY HH:mm:ss') CLAIM_DATE,
    	E.fullname,
    	E.ref_code,
        CONCAT('''', A.sender) sender,
    	CONCAT('''', E.hp) hp,
    	CONCAT('''', E.identity) KTP,
    	A.coupon unique_code,
    	STRING_AGG(C.url, ', ') url_photo,
        A.voucher_number AS coupon_number,
    	(
    		CASE B.is_approved WHEN 0 THEN 'PENDING' WHEN 1 THEN 'APPROVED' WHEN 2 THEN 'REJECTED' END
    	) STATUS_APPROVE,
    	(
    		CASE WHEN F.name IS NOT NULL THEN
    			CONCAT(D.name, ' - ', F.name)
    		ELSE
    			D.name
    		END) PRIZE,
    	(
    		CASE WHEN B.status = 0 THEN
    			'Unprocessed'
    		WHEN B.status = 2 THEN
    			'Success'
    		WHEN B.status = 3 THEN
    			'Failed'
    		ELSE
    			'Processed'
    		END) AS STATUS,
    	CONCAT('''', B.account_number) TOPUP_NUMBER,
        STRING_AGG(CONCAT(G.reference), ', ') SERIAL_NUMBER,
        STRING_AGG(CONCAT(G.proccesed_date), ', ') PROCESSED_DATE_TOPUP,
        A.ktp_name_admin AS inputted_name_by_image,
        A.id_number_admin AS inputted_ktpno_by_image,
        I.name AS invalid_reasons
    FROM
    	winner B
    	LEFT JOIN entries A ON B."entriesId" = A.id
    	JOIN users E ON E.id = B."userId"
    	LEFT JOIN (SELECT "winnerId", STRING_AGG(url, ', ') AS url FROM attachment WHERE "winnerId" IS NOT NULL GROUP BY "winnerId") C ON B.id = C."winnerId"
    	LEFT JOIN prize D ON B."prizeId" = D.id
    	LEFT JOIN voucher F ON B."voucherId" = F.id
    	LEFT JOIN (SELECT * FROM transaction WHERE recipient = '' OR recipient IS NULL) G ON B.id = G."winnerId"
        LEFT JOIN invalid_reason I ON I.id = B."invalidReasonId"
        WHERE 0 = 0 ${prizeIdWhere(params.prizeId)} ${dateWhere(
    params.startDate,
    params.endDate
  )}${approveWhere(params.isApproved)}${statusWhere(params.isValid)}${keyWhere(
    params
  )}${first100Where(
    params.prize
  )} GROUP BY A.id, B.id, E.id, F.id, D.id, I.id ${orderBy(
    params
  )} LIMIT 10000 OFFSET ${threshold}`;

  return exeQuery(query, []);
};

export const transaction = (id: string) => {
  let query = `SELECT 
    A.status,
    A.reason,
    A.reference,
    A.code,
    A.sn,
    A.amount,
    A.proccesed_date
    FROM transaction A 
    WHERE A."winnerId" = $1 AND (A.recipient IS NULL OR A.recipient = '') ORDER BY A.proccesed_date DESC`;
  return exeQuery(query, [id]);
};

export const insertTransaction = (params: insertTransaction) => {
  let query = `INSERT INTO transaction(status,reason,account_number,reference,proccesed_date,createdById,winnerId,amount,code) VALUES(?,?,?,?,?,?,?,?,?)`;
  return exeQuery(query, [
    params.status,
    params.reason,
    params.hp,
    params.reference,
    params.proccesDate,
    params.createdById,
    params.winnerId,
    params.amount,
    params.code,
  ]);
};

export const updateTransaction = (trx: string, date: string, id: number) => {
  let query = `UPDATE transaction SET tr_id = ?, proccesed_date = ?, status = 2 WHERE id = ?`;
  return exeQuery(query, [trx, date, id]);
};

export const getTrxLast = (id: string) => {
  let detQ = `
    SELECT 
    id 
    FROM
    transaction 
    WHERE winnerId = ?
    ORDER BY updated_at DESC
    `;
  return exeQuery(detQ, [id]);
};

export const detail = (id: string) => {
  let detQ = `
    SELECT 
    B.id,
    D.identity, 
    A.rcvd_time created_at, 
    B.account_number "hpTopup", 
    B.status, 
    B."masterBrandId",
    E.name AS prize,
    D.regency AS city,
    B.amount, 
    F.name AS voucher,
    CONCAT(F.id,',',F.category) AS "voucherValue",
    F.amount AS "voucherAmount",
    F.type AS "voucherType",
    B.account_number AS hp,
    B."voucherId",
    B."masterBrandId",
    B."userId",
    E."topupType",
    D.identity,
    A.id AS "entriesId",
    D.fullname AS name,
    B."invalidReasonId" AS "rejectId",
    G.proccesed_date AS trf_date,
    G.status AS trf_status,
    G.tr_id AS trf_no,
    STRING_AGG(G.sn, '\n') sn
    FROM winner B 
    LEFT JOIN entries A ON B."entriesId" = A.id 
    JOIN users D ON D.id = B."userId" 
    LEFT JOIN prize E ON B."prizeId" = E.id
    LEFT JOIN voucher F ON F.id = B."voucherId"
    LEFT JOIN transaction G ON G."winnerId" = B.id
    WHERE B.id = $1
    GROUP BY B.id, D.identity, A.rcvd_time, E.name, D.regency, F.name, F.id, E."topupType", A.id, D.fullname, G.proccesed_date, G.status, G.tr_id
    `;
  return exeQuery(detQ, [id]);
};

export const voucher = (category: number) => {
  let query = `SELECT id,name,amount,category FROM voucher WHERE category = $1`;
  return exeQuery(query, [category]);
};

export const attachments = (id: string, type: any) => {
  let query = `SELECT CONCAT(A.url) AS url, A.id
        FROM attachment A
        LEFT JOIN general_parameter B ON B.name = 'imgUrl2'
        WHERE "winnerId" = $1
        `;
  return exeQuery(query, [id]);
};

export const detailWinner = (id: string) => {
  // c.id as store_city, c.city as storeCityName, c.province as store_province,
  // LEFT JOIN store_city c ON A.store_city = c.id
  const syntax = `SELECT A.coupon, K.name AS media, G."voucherId" AS "prizeType", A.name, A."userId", A.id_number AS "idNumber", A.hp, A.sender, A.message, B.regency, A.rcvd_time, A.message, A.is_valid, A.is_valid_admin AS "isValidAdmin", F.name AS "invalidReason", A.purchase_date, A.purchase_date_admin AS "purchaseDateInput", A.purchase_no_admin AS "purchaseNoInput", A."storeId", C.name AS "storeNameTxt", H.name AS prize_name, H.amount, A.purchase_amount_admin AS "purchaseAmountAdmin",
    A.id_number AS ktp_number,
    G."prizeId",
    G.account_number,
    CONCAT(J.value, '/api/images/', I.url) AS url,
    A.email,
    A.id
        FROM entries A 
        LEFT JOIN users B ON A."userId" = B.id
        LEFT JOIN store C ON A."storeId" = C.id
        LEFT JOIN invalid_reason F ON A."invalidReasonId" = F.id
        LEFT JOIN winner G ON A.id = G."entriesId"
        LEFT JOIN prize H ON G."prizeId" = H.id
        LEFT JOIN attachment I ON I."entriesId" = A.id
        LEFT JOIN general_parameter J ON J.name = 'imgUrl'
        LEFT JOIN media K ON A."mediaId" = K.id
        WHERE G.id = $1`;
  return exeQuery(syntax, [id]);
};

export const detailWinner2 = (id: string) => {
  // c.id as store_city, c.city as storeCityName, c.province as store_province,
  // LEFT JOIN store_city c ON A.store_city = c.id
  const syntax = `SELECT E.message, E.store AS dStore, E.hp AS dHp, E.address AS dAddress, G.name AS grosirName, G.hp AS grosirHp, G.address AS grosirAddress, G.promoId,
    CONCAT(J.value, '/api/images/', I.url) AS url, H.categoryId
        FROM entries A 
        LEFT JOIN users B ON A.userId = B.id
        LEFT JOIN invalid_reason F ON A.invalidReasonId = F.id
        RIGHT JOIN winner G ON A.id = G.entriesId
        LEFT JOIN entries_grosir E ON E.id = G.entriesGrosirId
        LEFT JOIN prize H ON G.prizeId = H.id
        LEFT JOIN attachment I ON I.winnerId = G.id
        LEFT JOIN general_parameter J ON J.name = "imgUrl"
        WHERE G.id = ?`;
  return exeQuery(syntax, [id]);
};

export const detailWinnerAtt = (id: string) => {
  // c.id as store_city, c.city as storeCityName, c.province as store_province,
  // LEFT JOIN store_city c ON A.store_city = c.id
  const syntax = `SELECT 
    B.id AS "key",
    B.id AS value,
    CONCAT(B.url) AS src
       FROM winner A 
       LEFT JOIN attachment B ON B."winnerId" = A.id
       LEFT JOIN general_parameter C ON C.name = 'imgUrl'
       WHERE A.id = $1`;
  return exeQuery(syntax, [id]);
};

export const detailWinnerAtt2 = (id: string) => {
  // c.id as store_city, c.city as storeCityName, c.province as store_province,
  // LEFT JOIN store_city c ON A.store_city = c.id
  const syntax = `SELECT 
    B.id AS 'key',
    B.id AS value,
    CONCAT(C.value, '/api/images/', B.url) AS url
       FROM users A 
       LEFT JOIN attachment B ON B.userId = A.id
       LEFT JOIN general_parameter C ON C.name = "imgUrl"
       WHERE A.id = ? AND B.winnerId IS NULL`;
  return exeQuery(syntax, [id]);
};

export const detailSelectedWinnerAtt = (sender: string) => {
  const syntax = `SELECT 
    CONCAT(C.value, '/api/images/', B.url) AS src
       FROM winner A 
       LEFT JOIN attachment B ON B.winnerId = A.id
       LEFT JOIN general_parameter C ON C.name = "imgUrl"
       WHERE A.id = ?`;
  return exeQuery(syntax, [sender]);
};

export const getWinPreventor = (ktp: string, userWinner: number) => {
  const stx = `SELECT COUNT(1) AS counts FROM winner WHERE ktp_number = ? AND userId != ?`;
  return exeQuery(stx, [ktp, userWinner]);
};

export const deleteAttachment = (id: string) => {
  let query = `DELETE FROM attachment WHERE id = $1`;
  return exeQuery(query, [id]);
};

export const prize = (type: string, category: string) => {
  let query = `SELECT A.id,
    A.name
    FROM prize A WHERE categoryId = ? AND typeId = ?
    `;
  return exeQuery(query, [category, type]);
};
// export const exportWinner = (params: RgParams) => {
//     let exportWinnerquery = `SELECT winners.id, entries.created_at, entries.name, entries.sender, entries.media, prizes.name AS prizeName, region.name AS winRegion FROM winners B JOIN entries A ON winners.entries_id = entries.id JOIN prizes C ON winners.prize_id = prizes.id JOIN allocations D ON winners.allocation_id = allocations.id JOIN region E ON allocations.region_id = region.id WHERE entries.is_valid = 1 ${keyWhere(params)}${mediaWhere(params.media)}${dateWhere(params.startDate, params.endDate)} GROUP BY profiles.id${orderBy(params)} ${params.limit}`;

//     return exeQuery(exportWinnerquery, []);
// };

export const getWinnerFw = (id: number) => {
  const stx = `SELECT winner."entriesId", winner."masterBrandId", winner."allocationId", winner."userId", users.id_type, user_mobile.id AS "mobileId", winner.is_approved, entries.id_number_admin, prize.name AS prz_name FROM winner LEFT JOIN users ON winner."userId" = users.id LEFT JOIN prize ON prize.id = winner."prizeId" LEFT JOIN entries ON winner."entriesId" = entries.id LEFT JOIN user_mobile ON users.id = user_mobile."userId" WHERE winner.id = $1`;
  return exeQuery(stx, [id]);
};

export const getUserDet = (id: number) => {
  const stx = `SELECT users.fullname, users.hp FROM winner JOIN users ON winner."userId" = users.id WHERE winner.id = $1`;
  return exeQuery(stx, [id]);
};

export const getSpecific = (id: number) => {
  return exeQuery(
    `SELECT entries.id "entriesId", winner.id "winnerId", history.id "historyId", winner."prizeId" from entries,winner,history where entries.id = winner."entriesId" AND entries.id = history."entriesId" AND winner.id = $1`,
    [id]
  );
};

export const getWinnerGsFw = (id: number) => {
  const stx = `SELECT winner.approvalStep, winner.entriesGrosirId, winner.allocationId, winner.ktp_number, winner.userId,users.id_type, winner.total_reject AS totalReject FROM winner,users WHERE winner.userId = users.id AND winner.id = ?`;
  return exeQuery(stx, [id]);
};

export const getPrzType = (id: number) => {
  const stx = `SELECT prize.categoryId FROM winner JOIN prize ON winner.prizeId = prize.id WHERE winner.id = ?`;
  return exeQuery(stx, [id]);
};

export const updateStep = (id: number) => {
  const stx = `UPDATE winner SET approvalStep = 1 WHERE winner.id = ?`;
  return exeQuery(stx, [id]);
};

export const updateSAPtoEntriesData = (
  address: string,
  kodepos: string | number,
  district: string,
  quantity: number,
  receiver_name: string,
  receiver_phone: string | number,
  approver: string,
  id: number
) => {
  const stx = `UPDATE winner SET address = ?, postal_code = ?, district = ?, quantity = ?, name = ?, hp = ?, approver = ? WHERE id = ?`;
  return exeQuery(stx, [
    address,
    kodepos,
    district,
    quantity,
    receiver_name,
    receiver_phone,
    approver,
    id,
  ]);
};

export const getBrandId = (voucherId: number) => {
  const stx = `SELECT brandId, code, type FROM voucher WHERE id = ?`;
  return exeQuery(stx, [voucherId]);
};

export const getHomeURL = () => {
  return exeQuery(
    `SELECT value FROM general_parameter WHERE name = 'imgUrl2'`,
    []
  );
};

export const revertEntries = (id: string) => {
  return exeQuery(
    `UPDATE "entries" SET "approvedById" = NULL, "invalidReasonAdminId" = NULL, "is_valid" = 1, "is_approved" = 0 WHERE "id" = $1`,
    [id]
  );
};

export const revertWinner = (alloId: number, id: number) => {
  return exeQuery(
    `UPDATE "winner" SET "allocationId" = $1, "invalidReasonId" = NULL, "status" = 0, "is_approved" = 0 WHERE "id" = $2`,
    [alloId, id]
  );
};

export const revertHistory = (winnerId: number, tmplt: string, id: string) => {
  return exeQuery(
    `UPDATE history SET "winnerId" = $1,"desc" = $2,"type" = 2 WHERE id = $3`,
    [winnerId, tmplt, id]
  );
};

export const get1Allocation = (date: string, prizeId: string) => {
  return exeQuery(
    `SELECT id FROM allocation WHERE DATE(allocation_date) = $1 AND "prizeId" = $2 AND status = 0`,
    [date, prizeId]
  );
};

export const useAllocation = (id: string) => {
  return exeQuery(
    `UPDATE allocation SET used_date = CURRENT_DATE, status = 1 WHERE id = $1 AND status = 0`,
    [id]
  );
};

export const getTemplate = () => {
  return exeQuery(
    `SELECT value FROM general_parameter WHERE name = 'revertTemplate'`,
    []
  );
};

export const getPushTemplate = (id: number) => {
  return exeQuery(
    `SELECT reply, template_name from invalid_reason WHERE id = $1`,
    [id]
  );
};

export const updateCountPush = (id: number) => {
  return exeQuery(`UPDATE winner SET is_push = is_push + 1 WHERE id = $1`, [
    id,
  ]);
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

export const getUnprocessedLt = () => {
  return exeQuery(
    `SELECT A.id, B.fullname, B.hp, C.email, COUNT(D.id) AS total_attach FROM winner A JOIN users B ON A."userId" = B.id JOIN entries C ON A."entriesId" = C.id LEFT JOIN attachment D ON A.id = D."winnerId" WHERE A.is_approved = 0 AND (CURRENT_DATE::DATE - A.created_at::DATE) >= 8 GROUP BY A.id, B.id, C.id ORDER BY A.id ASC`,
    []
  );
};

export const autoRejectById = (id: string) => {
  return exeQuery(
    `UPDATE winner SET is_approved = 2, "invalidReasonId" = 16, "prizeId" = NULL, type = 0 WHERE id = $1`,
    [id]
  );
};
