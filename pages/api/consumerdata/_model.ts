import { exeQuery } from "@/lib/db";
// import { multiPromo } from "../dashboard/_model"

interface CDParams {
  row: string | number;
  page: string | number;
  key: string;
  direction: string;
  column: string;
  limit: number | string;
  media: string;
  startDate: string;
  endDate: string;
}

const orderBy = (params: CDParams) => {
  const directionType =
    params.direction == "ascend"
      ? "ASC"
      : params.direction == "descend"
      ? "DESC"
      : "";
  if (!params.column || !directionType) {
    return " ORDER BY profiles.created_at DESC";
  } else {
    return ` ORDER BY "${params.column}" ${directionType}`;
  }
};

const keyWhere = (params: CDParams) => {
  if (params.key == "") {
    return "";
  } else {
    return ` AND (profiles.name LIKE '%${params.key}%' OR profiles.hp LIKE '%${params.key}%' OR profiles.id_number LIKE '%${params.key}%' OR profiles.sender LIKE '%${params.key}%' OR profiles.regency LIKE '%${params.key}%')`;
  }
};

const dateWhere = (startDate: string, endDate: string) => {
  if (startDate == "" || endDate == "") {
    return "";
  } else {
    return ` AND DATE(profiles.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
  }
};

const orderBy2 = (params: CDParams) => {
  const directionType =
    params.direction == "ascend"
      ? "ASC"
      : params.direction == "descend"
      ? "DESC"
      : "";
  if (!params.column || !directionType) {
    return " ORDER BY A.created_at DESC nulls LAST";
  } else {
    return ` ORDER BY "${params.column}" ${directionType} nulls LAST`;
  }
};

const keyWhere2 = (params: CDParams) => {
  if (params.key == "") {
    return "";
  } else {
    return ` AND (UPPER(A.username) LIKE '%${params.key}%' OR A.hp LIKE '%${params.key}%' OR UPPER(A.fullname) LIKE '%${params.key}%' OR UPPER(A.regency) LIKE '%${params.key}%' OR UPPER(A.identity) LIKE '%${params.key}%')`;
  }
};

const dateWhere2 = (startDate: string, endDate: string) => {
  if (startDate == "" || endDate == "") {
    return "";
  } else {
    return ` AND DATE(A.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
  }
};

const mediaWhere = (media: string) => {
  if (media == "") {
    return "";
  } else {
    return ` AND (profiles.media = ${media})`;
  }
};

const mediaWhere2 = (media: string) => {
  if (media == "") {
    return "";
  } else {
    return ` AND (users.media = ${media})`;
  }
};

export const countConsumer = (params: CDParams) => {
  let countQuery = `SELECT count(*) as counts,
    sum(consumer."totalValid") as "totalValid",
    sum(consumer."totalInvalid") as "totalInvalid",
    sum(consumer."totalPending") as "totalPending",
    sum("totalValid"+"totalInvalid"+"totalPending") as total
    from(SELECT SUM(CASE WHEN entries.is_valid = 1 THEN 1 ELSE 0 END) AS "totalValid",
        SUM(CASE WHEN entries.is_valid = 0 THEN 1 ELSE 0 END) AS "totalInvalid",
        SUM(CASE WHEN entries.is_valid = 2 THEN 1 ELSE 0 END) AS "totalPending"
        FROM profiles
        LEFT JOIN entries ON entries.profile_id = profiles.id
        WHERE 1 = 1 ${keyWhere(params)}${dateWhere(
    params.startDate,
    params.endDate
  )}${mediaWhere(params.media)} group by profiles.id) as consumer`;
  return exeQuery(countQuery, []);
};

export const transaction = (id: string) => {
  // let detQ = `
  // SELECT A.created_at, B.name AS trxType, A.coupon, A.point FROM history A JOIN history_category B ON A.categoryId = B.id WHERE A.status = 1 AND A.userId = ?
  // `;
  let detQ = `SELECT A.created_at, (CASE A.type WHEN 1 THEN 'Upload Struct' WHEN 2 THEN 'Ambil Hadiah' WHEN 3 THEN 'Tukar Point' WHEN 4 THEN 'Kupon Undian' ELSE 'Other History' END) AS "trxType", A.coupon, A.point
  FROM history A WHERE A.status = 1 AND A."userId" = $1 order by A.created_at DESC`;
  // let detQ = `SELECT A.created_at, B.name, (CASE A.type WHEN 1 THEN 'Upload Struct' WHEN 2 THEN 'Ambil Hadiah' WHEN 3 THEN 'Tukar Point' WHEN 4 THEN 'Kupon Undian' ELSE 'Other History' END) AS "trxType",
  // A.coupon, A.point
  // FROM history A
  // left join prize_type B on A."type" = B.id
  // WHERE A.status = 1 AND A."userId" = $1 group by B.name,A.coupon, A.created_at,A."type",A.point order by A.created_at desc`;
  return exeQuery(detQ, [id]);
};

export const countConsumer2 = (params: CDParams) => {
  let countQuery = `SELECT count(*) as counts,
    sum(consumer."totalValid") as "totalValid",
    sum(consumer."totalInvalid") as "totalInvalid",
    sum(consumer."totalPending") as "totalPending",
    sum("totalValid"+"totalInvalid"+"totalPending") as total
    from(SELECT SUM(CASE WHEN entries.is_valid_admin = 1 THEN 1 ELSE 0 END) AS "totalValid",
        SUM(CASE WHEN entries.is_valid_admin = 0 THEN 1 ELSE 0 END) AS "totalInvalid",
        SUM(CASE WHEN entries.is_valid_admin IS NULL THEN 1 ELSE 0 END) AS "totalPending"
        FROM entries
        JOIN users ON entries."userId" = users.id
        WHERE 0 = 0 ${keyWhere2(params)}${dateWhere2(
    params.startDate,
    params.endDate
  )} group by users.id) as consumer`;
  return exeQuery(countQuery, []);
};

export const countConsumer3 = (params: CDParams) => {
  // let countQuery = `SELECT count(*) as counts,
  // sum(consumer."totalValid") as "totalValid",
  // sum(consumer."totalInvalid") as "totalInvalid",
  // sum(consumer."totalPending") as "totalPending",
  // sum("totalValid"+"totalInvalid"+"totalPending") as total
  // from(SELECT SUM(CASE WHEN A.is_valid = 1 THEN 1 ELSE 0 END) AS "totalValid",
  //     SUM(CASE WHEN A.is_valid = 0 THEN 1 ELSE 0 END) AS "totalInvalid",
  //     SUM(CASE WHEN A.is_valid IS NULL THEN 1 ELSE 0 END) AS "totalPending"
  //     FROM entries AS A
  //     LEFT JOIN users ON A."userId" = users.id
  //     WHERE 0 = 0 ${keyWhere2(params)}${dateWhere2(params.startDate, params.endDate)} group by users.id) as consumer`;

  let countQuery = `SELECT count(*) as counts,
    sum(consumer."totalValid") as "totalValid",
    sum(consumer."totalInvalid") as "totalInvalid",
    sum(consumer."totalPending") as "totalPending",
    sum("totalValid"+"totalInvalid"+"totalPending") as total
    from(SELECT SUM(CASE WHEN entries.is_valid = 1 OR (entries.is_valid = 0 AND entries."invalidReasonId" = 99) THEN 1 ELSE 0 END) AS "totalValid",
        SUM(CASE WHEN entries.is_valid = 0 AND entries."invalidReasonId" != 99 THEN 1 ELSE 0 END) AS "totalInvalid",
        SUM(CASE WHEN entries.is_valid = 2 THEN 1 ELSE 0 END) AS "totalPending"
        FROM entries
        LEFT JOIN users AS A ON entries."userId" = A.id
        WHERE 0 = 0 ${keyWhere2(params)}${dateWhere2(
    params.startDate,
    params.endDate
  )} group by A.id) as consumer`;

  return exeQuery(countQuery, []);
};

export const listConsumer = (params: CDParams) => {
  let listConsumerQuery = `SELECT profiles.created_at,
    entries.id AS id,
    profiles.name,
    profiles.hp AS sender,
    profiles.hp,
    profiles.id_number,
    regency AS city,
    SUM(CASE WHEN entries.is_valid = 1 THEN 1 ELSE 0 END) AS total_submit_valid,
    SUM(CASE WHEN entries.is_valid = 0 THEN 1 ELSE 0 END) AS total_submit_invalid,
    SUM(CASE WHEN entries.is_valid = 2 THEN 1 ELSE 0 END) AS total_submit_pending,
    COUNT(entries.id) AS total_submit
FROM profiles
LEFT JOIN entries ON entries.profile_id = profiles.id
WHERE 1 = 1 ${keyWhere(params)}${dateWhere(
    params.startDate,
    params.endDate
  )}${mediaWhere(params.media)} GROUP BY profiles.id${orderBy(params)} ${
    params.limit
  }`;
  return exeQuery(listConsumerQuery, []);
};

export const listConsumer2 = (params: CDParams) => {
  let listConsumerQuery = `SELECT users.created_at,
    entries.id AS id,
    users.hp,
    users.fullname,
    regency AS city,
    SUM(CASE WHEN entries.is_valid_admin = 1 THEN 1 ELSE 0 END) AS total_submit_valid,
    SUM(CASE WHEN entries.is_valid_admin = 0 THEN 1 ELSE 0 END) AS total_submit_invalid,
    SUM(CASE WHEN entries.is_valid_admin IS NULL THEN 1 ELSE 0 END) AS total_submit_pending,
    COUNT(*) AS total_submit
FROM entries
JOIN users ON entries."userId" = users.id
WHERE 0 = 0 ${keyWhere2(params)}${dateWhere2(
    params.startDate,
    params.endDate
  )} GROUP BY users.id${orderBy2(params)} ${params.limit}`;
  return exeQuery(listConsumerQuery, []);
};

export const listConsumer3 = (params: CDParams) => {
  //     let listConsumerQuery = `SELECT users.created_at,
  //     users.hp,
  //     (CASE WHEN users.fullname IS NULL then 'Invalid KTP' ELSE users.fullname END) AS fullname,
  //     regency AS city,
  //     SUM(CASE WHEN A.is_valid = 1 THEN 1 ELSE 0 END) AS total_submit_valid,
  //     SUM(CASE WHEN A.is_valid = 0 THEN 1 ELSE 0 END) AS total_submit_invalid,
  //     SUM(CASE WHEN A.is_valid IS NULL THEN 1 ELSE 0 END) AS total_submit_pending,
  //     COUNT(*) AS total_submit
  // FROM entries AS A
  // LEFT JOIN users ON A."userId" = users.id
  // WHERE 0 = 0 ${keyWhere2(params)}${dateWhere2(params.startDate, params.endDate)} GROUP BY users.id${orderBy2(params)} ${params.limit}`;

  let listConsumerQuery = `SELECT A.created_at,
    A.hp,
    A.id AS id,
    (CASE WHEN A.fullname IS NULL then 'Invalid Data' ELSE A.fullname END) AS fullname,
    A.regency_ktp AS city,
    A.identity AS no_ktp,
    A.point AS remaining_points,
    A.coupon,
    SUM(CASE WHEN entries.is_valid = 1 OR (entries.is_valid = 0 AND entries."invalidReasonId" = 99) THEN 1 ELSE 0 END) AS total_submit_valid,
    SUM(CASE WHEN entries.is_valid = 0 AND entries."invalidReasonId" != 99 THEN 1 ELSE 0 END) AS total_submit_invalid,
    SUM(CASE WHEN entries.is_valid = 2 THEN 1 ELSE 0 END) AS total_submit_pending,
    COUNT(entries.is_valid) AS total_submit
    FROM entries
    LEFT JOIN users AS A ON entries."userId" = A.id
    WHERE 0 = 0 ${keyWhere2(params)}${dateWhere2(
    params.startDate,
    params.endDate
  )} GROUP BY A.id${orderBy2(params)} ${params.limit}`;

  return exeQuery(listConsumerQuery, []);
};

export const exportConsumer = (params: CDParams) => {
  let exportquery = `SELECT profiles.created_at,
    entries.id AS id,
    profiles.name,
    entries.sender,
    profiles.hp,
    profiles.id_number,
    regency AS city,
    SUM(CASE WHEN entries.is_valid = 1 THEN 1 ELSE 0 END) AS total_submit_valid,
    SUM(CASE WHEN entries.is_valid = 0 THEN 1 ELSE 0 END) AS total_submit_invalid,
    SUM(CASE WHEN entries.is_valid = 2 THEN 1 ELSE 0 END) AS total_submit_pending,
    COUNT(*) AS total_submit
FROM profiles
LEFT JOIN entries ON entries.profile_id = profiles.id
WHERE 1 = 1 ${keyWhere(params)}${mediaWhere(params.media)}${dateWhere(
    params.startDate,
    params.endDate
  )} GROUP BY profiles.id${orderBy(params)} ${params.limit}`;

  return exeQuery(exportquery, []);
};

export const exportConsumer2 = (params: CDParams) => {
  let exportquery = `SELECT users.created_at,
    entries.id AS id,
    users.name,
    users.sender,
    users.hp,
    users.id_number,
    regency AS city,
    SUM(CASE WHEN entries.is_valid_admin = 1 THEN 1 ELSE 0 END) AS total_submit_valid,
    SUM(CASE WHEN entries.is_valid_admin = 0 THEN 1 ELSE 0 END) AS total_submit_invalid,
    SUM(CASE WHEN entries.is_valid_admin IS NULL THEN 1 ELSE 0 END) AS total_submit_pending,
    COUNT(*) AS total_submit
FROM entries
RIGHT JOIN users ON entries."userId" = users.id
WHERE 0 = 0 ${keyWhere2(params)}${dateWhere2(
    params.startDate,
    params.endDate
  )} GROUP BY users.id${orderBy2(params)} ${params.limit}`;

  return exeQuery(exportquery, []);
};

export const exportConsumer3 = (params: CDParams) => {
  let exportquery = `SELECT A.created_at,
    A.id AS "userId",
    (CASE WHEN A.fullname IS NULL then 'Invalid KTP' ELSE A.fullname END) AS fullname,
    A.hp,
    A.identity AS no_ktp,
    regency_ktp AS city,
    SUM(CASE WHEN entries.is_valid = 1 OR (entries.is_valid = 0 AND entries."invalidReasonId" = 99) THEN 1 ELSE 0 END) AS total_submit_valid,
    SUM(CASE WHEN entries.is_valid = 0 AND entries."invalidReasonId" != 99 THEN 1 ELSE 0 END) AS total_submit_invalid,
    SUM(CASE WHEN entries.is_valid IS NULL THEN 1 ELSE 0 END) AS total_submit_pending,
    COUNT(*) AS total_submit
FROM entries
LEFT JOIN users AS A ON entries."userId" = A.id
WHERE 0 = 0 ${keyWhere2(params)}${dateWhere2(
    params.startDate,
    params.endDate
  )} GROUP BY A.id${orderBy2(params)}`;
  return exeQuery(exportquery, []);
};
