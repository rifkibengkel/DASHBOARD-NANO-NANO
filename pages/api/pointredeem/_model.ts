import { exeQuery } from "../../../lib/db";
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
  prizeId: string;
  isValid: string;
  isApproved: string;
  mode: string;
}

interface insertAttachmentParams {
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
  hp: string;
  voucherId: number;
  status: number;
  userId: number;
  ktpName?: string;
  ktpNumber?: string;
  ktpAddress?: string;
  coupon?: string;
  reject?: string;
  approve?: number;
  prizeType?: number;
  invalidId?: number;
  entriesId?: number;
  itemSize?: string;
}

interface editTrxParams {
  id: number;
  name: string;
  bank_name: string;
  nomor_rekening: string;
  userId: number;
}

const statusWhere = (param: string) => {
  if (Number(param) == 4) {
    return ` AND A.status = 0`;
  } else if (param !== "") {
    return ` AND A.status = ${param}`;
  }
  return "";
};

const isApprWhere = (param: string) => {
  if (Number(param) == 3) {
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
  const query = `UPDATE winner SET "updatedById" = $1, account_number = $2 WHERE id = $3 AND status IN(0,3)`;
  return exeQuery(query, [params.userId, params.hp, params.id]);
};

export const getUploadUrl = () => {
  return exeQuery(
    `SELECT value FROM general_parameter WHERE name = 'imgUrlLocal'`,
    []
  );
};
export const editWinner2 = (userId: number, status: number, id: number) => {
  const query = `UPDATE winner SET updatedById = ?, status = ? WHERE id = ? AND status IN(0,3,4)`;
  return exeQuery(query, [userId, status, id]);
};

export const editWinnerTrx = (params: editTrxParams) => {
  const query = `UPDATE transaction SET updatedById = ?, name = ?, bank_name = ?, nomor_rekening = ? WHERE winnerId = ? AND is_deleted = 0`;
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
  const query = `UPDATE winner SET updatedById = ?, ktp_number = ?, ktp_name = ? WHERE id = ? AND status IN(0)`;
  return exeQuery(query, [
    params.userId,
    params.ktpNumber,
    params.ktpName,
    params.id,
  ]);
};

export const editWinnerKTPOnly2 = (params: editParams) => {
  const query = `UPDATE winner SET is_approved = ?, updatedById = ?, ktp_number = ?, ktp_name = ?, ktp_address = ?, code_size = ? WHERE id = ? AND status IN(0, 1)`;
  return exeQuery(query, [
    params.approve,
    params.userId,
    params.ktpNumber,
    params.ktpName,
    params.ktpAddress,
    params.itemSize,
    params.id,
  ]);
};

export const editCoupon = (params: editParams) => {
  const query = `UPDATE entries SET coupon = ? WHERE id = ?`;
  return exeQuery(query, [params.coupon, params.entriesId]);
};

export const editAndApproveWinnerKTPOnly = (
  approve: number,
  params: editParams
) => {
  const query = `UPDATE winner SET status = ?, updatedById = ?, ktp_number = ?, ktp_name = ?, invalidReasonId = ? WHERE id = ? AND status IN(0)`;
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
  const query = `UPDATE winner SET is_approved = 2, updatedById = ?, ktp_number = ?, ktp_name = ?, ktp_address = ? WHERE id = ?`;
  return exeQuery(query, [
    params.userId,
    params.ktpNumber,
    params.ktpName,
    params.ktpAddress,
    params.id,
  ]);
};

export const updateIsvalidOnEntries = (id: string, status: number) => {
  const query = `UPDATE entries SET is_valid = ? WHERE id = ? AND is_valid IN(2)`;
  return exeQuery(query, [status, id]);
};

export const checkKTPAnotherUser = (
  userId: number,
  ktpNumber: string
): Promise<any> => {
  const query =
    "SELECT COUNT(1) cnt FROM winner WHERE status = 1 AND ktp_number = ? AND userId != ?";
  return exeQuery(query, [ktpNumber, userId]);
};

export const checkCoupon = (userId: number, coupon: string): Promise<any> => {
  const query =
    "SELECT COUNT(1) cnt FROM winner JOIN entries WHERE winner.is_approved = 1 AND entries.coupon = ? AND winner.userId != ?";
  return exeQuery(query, [coupon, userId]);
};

export const rejectWinner = (
  winnerId: number,
  updatedById: number,
  reason: string
) => {
  const query =
    "UPDATE winner SET updatedById = ?, invalidReasonId = ?, status = 3, is_approved = 2 WHERE id = ?";
  return exeQuery(query, [updatedById, reason, winnerId]);
};
//DNF
export const checkIfInternalTeam = (idNumber: string) => {
  const query = `SELECT id_number FROM employee_family WHERE id_number = ?`;
  return exeQuery(query, [idNumber]);
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
  address: string
) => {
  const query =
    "UPDATE entries_grosir SET grosir_name = ?, grosir_hp = ?, grosir_address = ? WHERE id = ?";
  return exeQuery(query, [name, hp, address, entryId]);
};

export const updateWinnerGrosir = (entryId: number, userUpdater: number) => {
  const query = "UPDATE winner SET updatedById = ? WHERE id = ?";
  return exeQuery(query, [userUpdater, entryId]);
};

export const updatePrizeSize = (
  entryId: number,
  size: string,
  userUpdater: number
) => {
  const query = "UPDATE winner SET updatedById = ?, code_size = ? WHERE id = ?";
  return exeQuery(query, [userUpdater, size, entryId]);
};

export const getHisDetId = (id: number, type: string) => {
  return exeQuery(
    `SELECT C.id FROM winner A JOIN history B ON A.id = B."winnerId" JOIN history_detail C ON C."historyId" = B.id WHERE A.id = $1 AND C.description = $2`,
    [id, type]
  );
};

export const updateHistoryDet = (id: number) => {
  return exeQuery(
    `UPDATE history_detail SET status = 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id]
  );
};

export const updateSAPStatus = (
  date: string,
  entryId: number,
  userUpdater: number,
  step: number
) => {
  const query =
    step == 1
      ? `UPDATE winner SET status = 2, shipped_process_date = $1, "updatedById" = $2 WHERE id = $3`
      : step == 2
      ? `UPDATE winner SET status = 3, shipped_date = $1, "updatedById" = $2 WHERE id = $3`
      : `UPDATE winner SET status = 4, shipped_received_date = $1, "updatedById" = $2 WHERE id = $3`;
  return exeQuery(query, [date, userUpdater, entryId]);
};

export const getApproveURLpush = () => {
  const query =
    "SELECT VALUE AS push FROM general_parameter WHERE NAME = 'pushUrlA'";
  return exeQuery(query, []);
};

export const getTopupURL = () => {
  const query =
    "SELECT VALUE AS push FROM general_parameter WHERE NAME = 'topupUrl'";
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
    return " ORDER BY A.created_at DESC";
  } else {
    return ` ORDER BY ${params.column}  ${directionType}`;
  }
};

const keyWhere = (params: RgParams) => {
  if (params.key == "") {
    return "";
  } else {
    return ` AND (B.fullname ILIKE '%${params.key}%' OR A.code_topup ILIKE '%${params.key}%' OR B.hp ILIKE '%${params.key}%' OR A.account_number ILIKE '%${params.key}%' OR C.name ILIKE '%${params.key}%' OR E.code ILIKE '%${params.key}%')`;
  }
};

const prizeWhere = (prize: string) => {
  if (prize === "" || !prize) {
    return "";
  } else {
    return ` AND C.id = ${prize}`;
  }
};

const dateWhere = (startDate: string, endDate: string) => {
  if (startDate == "" || endDate == "") {
    return "";
  } else {
    return ` AND DATE(A.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
  }
};

// const mediaWhere = (media: string) => {
//     if (media == "") {
//         return ""
//     } else {
//         return ` AND (profiles.media = ${media})`
//     }
// }

export const modeWhere = (mode: string) => {
  if (mode == "physical") {
    return ` AND (C."typeId" = 1)`;
  } else if (mode == "lottery") {
    return ` AND C."typeId" = 2`;
  } else if (mode == "evoucher") {
    return ` AND (C."typeId" = 3)`;
  } else {
    return ` AND C."typeId" = 1`;
  }
};

export const countWinner = (params: RgParams) => {
  let countQuery = `SELECT COUNT(1) OVER () AS counts 
    FROM winner A
    JOIN users B ON A."userId" = B.id
    JOIN prize C ON A."prizeId" = C.id 
	  JOIN history D ON A.id = D."winnerId"
    LEFT JOIN coupon E ON A."couponId" = E.id
    WHERE 0 = 0 ${modeWhere(params.mode)} ${statusWhere(
    params.isValid
  )}${keyWhere(params)}${dateWhere(
    params.startDate,
    params.endDate
  )}${prizeWhere(params.prizeId)} GROUP BY A.id`;

  return exeQuery(countQuery, []);
};

export const getUser = (username: string) => {
  const query = `SELECT id FROM user_mobile WHERE user_mobile.username = $1`;
  return exeQuery(query, [username]);
};

export const revertAllocation = (allocationId: number) => {
  const query =
    "UPDATE allocation SET allocation.status = 0, allocation.used_date = null WHERE id = ?";
  return exeQuery(query, [allocationId]);
};

export const listWinner = (params: RgParams) => {
  let listWinnerQuery =
    params.mode == "physical"
      ? `SELECT
    A.id, A."userId",
    A.created_at, 
    B.fullname, B.hp, C.name AS claimedPrize, A.status AS shipment_status
    FROM winner A 
    JOIN users B ON A."userId" = B.id 
    JOIN prize C ON A."prizeId" = C.id 
    JOIN history D ON A.id = D."winnerId"
    LEFT JOIN coupon E ON A."couponId" = E.id
    WHERE C."typeId" = 1 ${statusWhere(params.isValid)}${keyWhere(
          params
        )}${dateWhere(params.startDate, params.endDate)}${prizeWhere(
          params.prizeId
        )} ${orderBy(params)} ${params.limit}`
      : params.mode == "evoucher"
      ? `SELECT
    A.id,
    A.created_at, B.fullname, A.account_number, C.name AS claimedPrize, A.status, C."isTopup"
    FROM winner A 
    JOIN users B ON A."userId" = B.id 
    JOIN prize C ON A."prizeId" = C.id
    JOIN history D ON A.id = D."winnerId" 
    LEFT JOIN coupon E ON A."couponId" = E.id
    WHERE C."typeId" = 3 ${statusWhere(params.isValid)}${keyWhere(
          params
        )}${dateWhere(params.startDate, params.endDate)}${prizeWhere(
          params.prizeId
        )} ${orderBy(params)} ${params.limit}`
      : `SELECT
    A.id,
    A.created_at, B.fullname, B.hp, E.code AS codePrize
    FROM winner A 
    JOIN users B ON A."userId" = B.id 
    JOIN prize C ON A."prizeId" = C.id
    JOIN history D ON A.id = D."winnerId" 
    LEFT JOIN coupon E ON A."couponId" = E.id
    WHERE C."typeId" = 2 ${statusWhere(params.isValid)}${keyWhere(
          params
        )}${dateWhere(params.startDate, params.endDate)}${prizeWhere(
          params.prizeId
        )} ${orderBy(params)}`;
  return exeQuery(listWinnerQuery, []);
};

export const insertAttachment = (params: insertAttachmentParams) => {
  let query = `INSERT INTO attachment(url,status,"entriesId","userId","createdById") VALUES($1,$2,$3,$4,$5)`;
  return exeQuery(query, [
    params.url,
    1,
    params.entriesId,
    params.userId,
    params.createdById,
  ]);
};

export const nonActiveAttachment = (id: string) => {
  let stx = `UPDATE attachment SET status = 0 WHERE entriesId = ?`;
  return exeQuery(stx, [id]);
};

export const setActiveAttachment = (entryId: string, id: string) => {
  let stx = `UPDATE attachment SET winnerId = ? WHERE id = ?`;
  return exeQuery(stx, [entryId, id]);
};

export const exprtWinnerTopup = () => {
  return exeQuery(
    `SELECT entries.name AS "Nama Pegawai", winner.account_number AS "Nomor Telepon", prize.amount AS "Jumlah Top Up", prize.name AS "Deskripsi", winner.id AS "Nomor Induk Karyawan" FROM winner JOIN entries ON winner.entriesId = entries.id JOIN prize ON winner.prizeId = prize.id WHERE prize.categoryId = 2 AND winner.status = 1 AND winner.is_approved = 1`,
    []
  );
};

export const exprtWinner = (params: RgParams) => {
  let query =
    params.mode == "physical"
      ? `SELECT
    A.id,
    A."userId",
    TO_CHAR(
      A.created_at,
      'DD/MM/YYYY HH24:MI:SS'
    ) AS created_at, B.fullname, B.hp, C.name AS claimedPrize,
    (CASE A.status WHEN 2 THEN 'PROCESSED/ON SHIPPING' WHEN 3 THEN 'DELIVERED' WHEN 4 THEN 'COMPLETED' WHEN 1 THEN 'UNPROCESSED' WHEN 0 THEN 'UNPROCESSED' ELSE 'FAILED' END) AS shipment_status,
    A.shipped_process_date,
    A.shipped_date,
    A.shipped_received_date,
    (CASE A.status WHEN 0 THEN 'Unprocessed' WHEN 1 THEN 'Processed' WHEN 4 THEN 'On Shipping' WHEN 2 THEN 'Arrived' ELSE '' END) as shipment_status,
    (CASE WHEN D.name IS NOT NULL THEN D.name ELSE '-' END) AS invalid_reason
    FROM winner A 
    JOIN users B ON A."userId" = B.id 
    JOIN prize C ON A."prizeId" = C.id
    LEFT JOIN invalid_reason D ON A."invalidReasonId" = D.id
    WHERE C."typeId" = 1 ${statusWhere(params.isValid)}${keyWhere(
          params
        )}${dateWhere(params.startDate, params.endDate)}${prizeWhere(
          params.prizeId
        )} ${orderBy(params)}`
      : params.mode == "lottery"
      ? `SELECT
    A.id,
    A."userId",
    TO_CHAR(
      A.created_at,
      'DD/MM/YYYY HH24:MI:SS'
    ) AS tanggal_terima,
    B.fullname, B.hp, E.code AS codePrize
    FROM winner A 
    JOIN users B ON A."userId" = B.id 
    JOIN prize C ON A."prizeId" = C.id
    LEFT JOIN coupon E ON A."couponId" = E.id
    WHERE C."typeId" = 2 ${statusWhere(params.isValid)}${keyWhere(
          params
        )}${dateWhere(params.startDate, params.endDate)}${prizeWhere(
          params.prizeId
        )} ${orderBy(params)}`
      : params.mode == "evoucher"
      ? `SELECT
    A.id,
    A."userId",
    TO_CHAR(
      A.created_at,
      'DD/MM/YYYY HH24:MI:SS'
    ) AS tanggal_terima, B.fullname, A.account_number, C.name AS claimedPrize, 
    (CASE A.status WHEN 1 THEN 'Processed' WHEN 2 THEN 'Success' WHEN 3 THEN 'Failed' ELSE 'Unprocessed' END) AS status,
    D.reference
    FROM winner A 
    JOIN users B ON A."userId" = B.id 
    JOIN prize C ON A."prizeId" = C.id 
    LEFT JOIN transaction D ON A.id = D."winnerId"
    WHERE C."typeId" = 3 ${statusWhere(params.isValid)}${keyWhere(
          params
        )}${dateWhere(params.startDate, params.endDate)}${prizeWhere(
          params.prizeId
        )} ${orderBy(params)}`
      : `SELECT
    A.id,
    A."userId",
    TO_CHAR(
      A.created_at,
      'DD/MM/YYYY HH24:MI:SS'
    ) AS tanggal_terima, B.fullname, B.hp, C.name AS claimedPrize, A.code_topup
    FROM winner A 
    JOIN users B ON A."userId" = B.id 
    JOIN prize C ON A."prizeId" = C.id WHERE C."typeId" = 1 ${statusWhere(
      params.isValid
    )}${keyWhere(params)}${dateWhere(
          params.startDate,
          params.endDate
        )}${prizeWhere(params.prizeId)} ${orderBy(params)}`;

  return exeQuery(query, []);
};

export const updateTopupStatus = (
  idNumber: string,
  trx: string,
  status: number,
  id: number
) => {
  let query = `UPDATE winner SET account_number = ?, transaction_number = ?, status = ? WHERE id = ?`;
  return exeQuery(query, [idNumber, trx, status, id]);
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
    WHERE A."winnerId" = $1`;
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

export const updateTransaction = (
  trx: string,
  date: string,
  status: number,
  id: number
) => {
  let query = `UPDATE transaction SET tr_id = ?, proccesed_date = ?, status = ? WHERE id = ?`;
  return exeQuery(query, [trx, date, status, id]);
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
    A.id,
    A.created_at,
    A.created_at AS received_date, 
    B.fullname AS name, 
    B.hp, 
    C.name AS prize, 
    A.status, 
    (CASE WHEN A.account_number = '' THEN B.hp ELSE A.account_number END) AS "hpTopup",
    B.regency_ktp AS regency,
    A."voucherId" ,
    A."masterBrandId" ,
    (CASE WHEN D.name IS NOT NULL THEN D.name ELSE '-' END) AS invalid_reason
    FROM winner A 
    JOIN users B ON A."userId" = B.id 
    JOIN prize C ON A."prizeId" = C.id 
    LEFT JOIN invalid_reason D ON A."invalidReasonId" = D.id
    WHERE A.id = $1
  `;
  return exeQuery(detQ, [id]);
};

export const voucher = (category: number) => {
  let query = `SELECT id,name,amount,category FROM voucher WHERE category = ?`;
  return exeQuery(query, [category]);
};

export const attachments = (entriesId: string, type: any) => {
  // let query = `SELECT A.url, A.id
  //       FROM attachment A
  //       LEFT JOIN winner C ON C.id = A.winnerId
  //       LEFT JOIN general_parameter B ON B.name = 'imgUrl'
  //       WHERE C.id = ?`;

  let query = ` 
  SELECT A.url, A.id
        FROM attachment A
        LEFT JOIN winner C ON A."entriesId" = C.id
        LEFT JOIN general_parameter B ON B.name = 'imgUrl'
        WHERE C.id = $1 
  `;
  return exeQuery(query, [entriesId]);
};

export const attachmentsFromEntries = (entriesId: string, type: any) => {
  let query = `SELECT A.url, A.id
        FROM attachment A
        LEFT JOIN entries C ON A."entriesId" = A.id 
        LEFT JOIN general_parameter B ON B.name = 'imgUrl'
        WHERE C.id = $1`;
  return exeQuery(query, [entriesId]);
};

export const getEntriesId = (id: string) => {
  return exeQuery(`SELECT "entriesId" FROM winner WHERE id = $1`, [id]);
};

export const detailWinner = (id: string) => {
  // c.id as store_city, c.city as storeCityName, c.province as store_province,
  // LEFT JOIN store_city c ON A.store_city = c.id
  const syntax = `
  SELECT B."identity", B.fullname AS "name" , B.hp AS sender, B.email AS "email" ,
  F.name AS media, B.hp, B.regency_ktp AS regency,  B."identity" AS "idNumber",
   A.created_at AS rcvd_time,
   A."invalidReasonId" AS "invalidId",
      E.name AS "prizeName",
    A.status
    FROM winner A
    LEFT JOIN users B ON A."userId" = B.id 
    LEFT JOIN prize E ON A."prizeId" = E.id
    LEFT JOIN media F ON B."mediaId" = F.id
    WHERE A.id = $1
  `;
  return exeQuery(syntax, [id]);
};

export const detailWinner2 = (id: string) => {
  // c.id as store_city, c.city as storeCityName, c.province as store_province,
  // LEFT JOIN store_city c ON A.store_city = c.id
  //   const syntax = `SELECT E.store AS dStore, E.hp AS dHp, E.address AS dAddress, E.grosir_name AS grosirName, E.grosir_hp AS grosirHp, E.grosir_address AS grosirAddress, G.promoId,
  //     CONCAT(J.value, '/api/images/', I.url) AS url
  //         FROM entries A
  //         LEFT JOIN users B ON A."userId" = B.id
  //         LEFT JOIN invalid_reason F ON A.invalidReasonId = F.id
  //         RIGHT JOIN winner G ON A.id = G.entriesId
  //         LEFT JOIN entries_grosir E ON E.id = G.entriesGrosirId
  //         LEFT JOIN prize H ON G.prizeId = H.id
  //         LEFT JOIN attachment I ON I.winnerId = G.id
  //         LEFT JOIN general_parameter J ON J.name = "imgUrl"
  //         WHERE G.id = ?`;
  const syntax = `SELECT J.value,CONCAT(J.value, '/api/images/', I.url) AS url
        FROM entries A 
        LEFT JOIN users B ON A."userId" = B.id
        LEFT JOIN invalid_reason F ON A."invalidReasonId" = F.id
        right JOIN winner G ON A.id = G."entriesId"
        LEFT JOIN prize H ON G."prizeId" = H.id
        LEFT JOIN attachment I ON I.id = G.id
        LEFT JOIN general_parameter J ON J.name = 'imgUrl'
        WHERE G.id = $1`;
  return exeQuery(syntax, [id]);
};

export const detailWinnerAtt = (id: string) => {
  // c.id as store_city, c.city as storeCityName, c.province as store_province,
  // LEFT JOIN store_city c ON A.store_city = c.id
  //   const syntax = `SELECT
  //     B.id AS 'key',
  //     B.id AS value,
  //     CONCAT(C.value, '/api/images/', B.url) AS url
  //        FROM users A
  //        LEFT JOIN attachment B ON B.userId = A.id
  //        LEFT JOIN general_parameter C ON C.name = "imgUrl"
  //        WHERE A.id = ? AND B.winnerId IS NULL`;
  const syntax = `
    SELECT 
    B.id AS key,
    B.id AS value,
    CONCAT(C.value, '/api/images/', B.url) AS url
   FROM users A 
   LEFT JOIN attachment B ON B."userId" = A.id
   LEFT JOIN general_parameter C ON C.name = 'imgUrl'
   WHERE A.id = $1 AND B.id IS null
`;
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
        B.url AS src
       FROM winner A 
       LEFT JOIN attachment B ON B.id = A.id
       LEFT JOIN general_parameter C ON C.name = 'imgUrl'
       WHERE A.id = $1`;
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
  const stx = `SELECT winner.allocationId, winner.status, winner.id, users.identity, winner.userId, prize.categoryId AS prizeType, winner.entriesId FROM winner LEFT JOIN users ON winner.userId = users.id LEFT JOIN prize ON prize.id = winner.prizeId WHERE winner.id = ?`;
  return exeQuery(stx, [id]);
};

export const getHistoryDet = (id: number) => {
  const stx = `SELECT id, point FROM history WHERE id_activity = ? AND categoryId = 2`;
  return exeQuery(stx, [id]);
};

export const revUserPoints = (id: number, amount: number) => {
  const stx = "UPDATE users SET `point` = `point` + ? WHERE id = ?";
  return exeQuery(stx, [amount, id]);
};

export const revHistory = (id: number) => {
  const stx = `UPDATE history SET point = 0 WHERE id_activity = ? AND categoryId = 2`;
  return exeQuery(stx, [id]);
};

export const revAllocation = (id: number) => {
  const stx = `UPDATE allocation SET status = 0 AND used_date = NULL WHERE id = ?`;
  return exeQuery(stx, [id]);
};

export const dsgAllocation = (id: number) => {
  const stx = `UPDATE winner SET allocationId = NULL WHERE id = ?`;
  return exeQuery(stx, [id]);
};

export const setWinnerAsUnp = (id: number) => {
  const stx = `UPDATE winner SET status = 0 WHERE id = ?`;
  return exeQuery(stx, [id]);
};

export const getWinnerGsFw = (id: number) => {
  const stx = `SELECT winner.entriesGrosirId, winner.allocationId, winner.ktp_number, winner.userId,users.id_type, winner.total_reject AS totalReject FROM winner,users WHERE winner.userId = users.id AND winner.id = ?`;
  return exeQuery(stx, [id]);
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
