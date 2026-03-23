import { exeQuery } from "@/lib/db";
import { formatDashboard } from "@/interfaces/dashboard.interface";
import dayjs from "dayjs";

interface specialType {
  condition: any;
  type: string;
  subtract: number;
  startDate: any;
  endDate: any;
  // media: string;
}
interface IParams {
  mode?: string;
  row: string | number;
  page: string | number;
  key: string;
  startDate: string;
  endDate: string;
  direction: string;
  column: string;
  limit: number | string;
}

interface IPrzParams {
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

interface ProdParams {
  productId: string | number;
  row: string | number;
  page: string | number;
  key: string;
  direction: string;
  column: string;
  limit: number | string;
}

export const getPeriode = () => {
  let query = `SELECT periode_start AS "startDate", periode_end AS "endDate" FROM periode`;
  return exeQuery(query, []);
};

const time = (condition: number, column: string) => {
  switch (true) {
    case condition == 1:
      return column !== ""
        ? `TO_CHAR(DATE(${column}.created_at),'dd Mon yyyy') AS "DATE",`
        : `TO_CHAR(DATE(A.rcvd_time),'dd Mon yyyy') AS "DATE",`;
      break;

    case condition == 2:
      return column !== ""
        ? `TO_CHAR(date_trunc('week', ${column}.created_at::timestamp)::DATE, 'dd Mon YYYY')
                || ' - '	
                || TO_CHAR((date_trunc('week', ${column}.created_at::timestamp)+ '6 days'::interval)::DATE, 'dd Mon YYYY') AS "DATE",`
        : `TO_CHAR(date_trunc('week', A.rcvd_time::timestamp)::DATE, 'dd Mon YYYY')
                || ' - '	
                || TO_CHAR((date_trunc('week', A.rcvd_time::timestamp)+ '6 days'::interval)::DATE, 'dd Mon YYYY') AS "DATE",`;
      break;
    case condition == 3:
      return column !== ""
        ? `TO_CHAR(date_trunc('month', ${column}.created_at::timestamp),'Mon yyyy') AS "DATE",`
        : `TO_CHAR(date_trunc('month', A.rcvd_time::timestamp),'Mon yyyy') AS "DATE",`;
      break;
    case condition == 99:
      return column !== ""
        ? `TO_CHAR(date_trunc('hour', ${column}.created_at::timestamp), 'HH24') AS "DATE",`
        : `TO_CHAR(date_trunc('hour', A.rcvd_time::TIMESTAMP), 'HH24') AS "DATE",`;
      break;
  }
};

const timeProfile = (condition: number, column: string) => {
  switch (true) {
    case condition == 1:
      return column !== ""
        ? `DATE_FORMAT(${column}.created_at,'%d %b %Y') AS DATE,`
        : `DATE_FORMAT(rcvd_time,'%d %b %Y') AS DATE,`;
      break;

    case condition == 2:
      return column !== ""
        ? `CONCAT(DATE_FORMAT(DATEADD(${column}.created_at, INTERVAL(1-DAYOFWEEK(${column}.created_at)) DAY),'%e %b %Y'), ' - ',    
        DATE_FORMAT(DATEADD(${column}.created_at, INTERVAL(7-DAYOFWEEK(${column}.created_at)) DAY),'%e %b %Y')) AS DATE,`
        : `CONCAT(DATE_FORMAT(DATEADD(rcvd_time, INTERVAL(1-DAYOFWEEK(rcvd_time)) DAY),'%e %b %Y'), ' - ',    
          DATE_FORMAT(DATEADD(rcvd_time, INTERVAL(7-DAYOFWEEK(rcvd_time)) DAY),'%e %b %Y')) AS DATE,
      `;
      break;
    case condition == 3:
      return column !== ""
        ? `TO_CHAR(date_trunc('month', ${column}.created_at::timestamp),'Mon yyyy') AS "DATE",`
        : `TO_CHAR(date_trunc('month', A.rcvd_time::timestamp),'Mon yyyy') AS "DATE",`;
      break;
    case condition == 99:
      return column !== ""
        ? `DATE_FORMAT(${column}.created_at,'%H') AS DATE,`
        : `DATE_FORMAT(rcvd_time,'%H') AS DATE,`;
      break;
  }
};

export const multiPromo = (promo?: number, table?: string) => {
  if (promo) {
    return ` AND ${table ? table : "A"}.promoId = ${promo}`;
  } else {
    return ``;
  }
};

const orderBy = (direction: string, column: string) => {
  const directionType =
    direction == "ASC" ? "ASC" : direction == "DESC" ? "DESC" : "";
  if (column == "" || directionType == "") {
    return " ORDER BY users.regency_ktp ASC";
  } else {
    return ` ORDER BY "${column}" ${directionType}`;
  }
};

const orderByProvince = (direction: string, column: string) => {
  const directionType =
    direction == "ASC" ? "ASC" : direction == "DESC" ? "DESC" : "";
  if (column == "" || directionType == "") {
    return " ORDER BY users.regency_ktp ASC";
  } else {
    return ` ORDER BY "${column}" ${directionType}`;
  }
};

const orderByPrd = (direction: string, column: string) => {
  const directionType =
    direction == "ASC" ? "ASC" : direction == "DESC" ? "DESC" : "";
  if (column == "" || directionType == "") {
    return " ORDER BY variants.variant_name ASC";
  } else {
    return ` ORDER BY "${column}" ${directionType}`;
  }
};

const storeOrderBy = (direction: string, column: string) => {
  const directionType =
    direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
  if (!column || !directionType) {
    return " ORDER BY store_master.store_name DESC";
  } else {
    return ` ORDER BY "${column}" ${directionType}`;
  }
};

const cutOfWhere = (subtract: number | string, column: string) => {
  if (subtract == 0) {
    return "";
  } else {
    return ` AND (DATE(A.rcvd_time)<="${dayjs()
      .subtract(2, "days")
      .format("YYYY-MM-DD")}")`;
  }
};

const whereCondition = (
  condition: number,
  startDate: string,
  endDate: string
) => {
  let date = new Date();
  switch (true) {
    case condition == 1 || condition == 99:
      if ((startDate == "" || endDate == "") && condition == 1) {
        return ` AND (DATE(A.rcvd_time)>="${dayjs(
          date.setDate(date.getDate() - 365)
        ).format("YYYY-MM-DD")}" AND DATE(A.rcvd_time)<="${dayjs().format(
          "YYYY-MM-DD"
        )}")`;
      } else if ((startDate == "" || endDate == "") && condition == 99) {
        return ` AND DATE(A.rcvd_time) >= CURRENT_DATE AND DATE(A.rcvd_time) <= CURRENT_DATE`;
      } else {
        return ` AND DATE(A.rcvd_time) >= '${startDate}' AND DATE(A.rcvd_time) <= '${endDate}'`;
      }
      break;
    case condition == 2 || condition == 3:
      return "";
      break;
  }
};

const whereProfileCondition = (
  condition: number,
  startDate: string,
  endDate: string
) => {
  let date = new Date();
  switch (true) {
    case condition == 1 || condition == 99:
      if ((startDate == "" || endDate == "") && condition == 1) {
        return ` AND (DATE(users.created_at)>="${dayjs(
          date.setDate(date.getDate() - 365)
        ).format("YYYY-MM-DD")}" AND DATE(users.created_at)<="${dayjs().format(
          "YYYY-MM-DD"
        )}")`;
      } else if (condition == 99) {
        return ` AND DATE(users.created_at) >= CURRENT_DATE AND DATE(users.created_at) <= CURRENT_DATE`;
      } else {
        return ` AND DATE(users.created_at) >= '${startDate}' AND DATE(users.created_at) <= '${endDate}'`;
      }
      break;
    case condition == 2 || condition == 3:
      return "";
      break;
  }
};

const groupBy = (condition: number, column: string) => {
  switch (true) {
    case condition == 1:
      return column !== ""
        ? `GROUP BY DATE(${column}.created_at) ORDER BY date(${column}.created_at) ASC`
        : `GROUP BY DATE(A.rcvd_time) ORDER BY date(A.rcvd_time) ASC`;
      break;

    case condition == 2:
      return column !== ""
        ? `GROUP BY date_trunc('week', ${column}.created_at::timestamp) ORDER BY date_trunc('week', ${column}.created_at::timestamp) ASC`
        : `GROUP BY date_trunc('week', A.rcvd_time::timestamp) ORDER BY date_trunc('week', A.rcvd_time::timestamp) ASC`;
      break;
    case condition == 3:
      return column !== ""
        ? `GROUP BY date_trunc('month', ${column}.created_at::timestamp) ORDER BY date_trunc('month', ${column}.created_at::timestamp) ASC`
        : `GROUP BY date_trunc('month', A.rcvd_time::timestamp) ORDER BY date_trunc('month', A.rcvd_time::timestamp) ASC`;
      break;
    case condition == 99:
      return column !== ""
        ? `GROUP BY DATE_TRUNC('hour', ${column}.created_at::timestamp)`
        : `GROUP BY DATE_TRUNC('hour', A.rcvd_time::timestamp)`;
      break;
  }
};

const groupByProfile = (condition: number, column: string) => {
  switch (true) {
    case condition == 1:
      return column !== ""
        ? `GROUP BY DATE_FORMAT(${column}.created_at,"%Y-%m-%d")`
        : `GROUP BY DATE_FORMAT(created_at,"%Y-%m-%d")`;
      break;

    case condition == 2:
      return column !== ""
        ? `GROUP BY DATE_FORMAT(${column}.created_at,"%Y-%U")`
        : `GROUP BY DATE_FORMAT(created_at,"%Y-%U")`;
      break;
    case condition == 3:
      return column !== ""
        ? `GROUP BY DATE_FORMAT(${column}.created_at,"%Y-%m")`
        : `GROUP BY DATE_FORMAT(created_at,"%Y-%m")`;
      break;
    case condition == 99:
      return column !== ""
        ? `GROUP BY HOUR(${column}.created_at)`
        : `GROUP BY HOUR(created_at)`;
      break;
  }
};

const keyWhere = (key: string) => {
  if (key == "") {
    return "";
  } else if ("OTHERS".search(key) >= 0) {
    return ` AND (profiles.regency IS NULL OR profiles.regency = "" OR profiles.regency LIKE '%${key}%')`;
  } else {
    return ` AND (profiles.regency LIKE '%${key}%')`;
  }
};

const storeKeyWhere = (key: string) => {
  if (key == "") {
    return "";
  } else {
    return ` AND (store_master.store_name LIKE '%${key}%')`;
  }
};

const whereMedia = (media: string) => {
  if (media == "") {
    return "";
  } else {
    return ` AND media.code = ${media}`;
  }
};

const whereStatus = (status: string) => {
  if (status == "") {
    return "";
  } else {
    return ` AND A.is_valid = ${status}`;
  }
};

const mediaWhereProfile = (media: string) => {
  if (media == "") {
    return "";
  } else {
    return ` AND profiles.media = ${media}`;
  }
};

const projectType = (prjType: string) => {
  if (prjType == "0") {
    return "";
  } else {
    return ` AND summary_mode."prjType" = '${prjType}'`;
  }
};

const dateWhere = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) {
    return "";
  } else {
    return ` AND DATE(A.rcvd_time) BETWEEN '${startDate}' AND '${endDate}'`;
  }
};

export const getTotCoupons = () => {
  return exeQuery(
    `SELECT value FROM general_parameter WHERE name = 'totalCoupon'`,
    []
  );
};

export const getClmCoupons = () => {
  return exeQuery(
    `SELECT COUNT(1) OVER () AS total FROM entries WHERE is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99) GROUP BY coupon`,
    []
  );
};

export const pendingMode = () => {
  return exeQuery(
    `SELECT value AS active FROM general_parameter WHERE name = 'prjType'`,
    []
  );
};

export const summaryColumns = (prjType: string) => {
  return exeQuery(
    `SELECT summary_mode.summary_name AS title, summary_mode.summary_cell_key AS title2, summary_mode.summary_key AS "dataIndex", general_parameter.value AS "pendingMode" FROM summary_mode JOIN media ON summary_mode.media = media.code LEFT JOIN general_parameter ON general_parameter.name = 'prjType' WHERE media.status = 1 ${projectType(
      prjType
    )}`,
    []
  );
};

export const summarySeriesActive = () => {
  return exeQuery(
    `SELECT graph, graph_name AS name FROM summary_mode JOIN media ON media.code = summary_mode.media WHERE media.status = 1 GROUP BY summary_mode.graph_name, summary_mode.graph`,
    []
  );
};

export const mediaSeriesActive = () => {
  return exeQuery(
    `SELECT name AS graph, name FROM media WHERE status = 1 ORDER BY id DESC`,
    []
  );
};

export const mediaUsed = () => {
  return exeQuery(`SELECT COUNT(1) AS medias FROM media WHERE status = 1`, []);
};

export const mediaUsed2 = () => {
  return exeQuery(
    `SELECT CODE AS code_media, name FROM media WHERE status = 1`,
    []
  );
};

export const mediaUsed3 = () => {
  return exeQuery(
    `SELECT code AS code_media, LOWER(name) AS name FROM media WHERE status = 1`,
    []
  );
};

export const mediaUsed4 = () => {
  return exeQuery(`SELECT id, name FROM media WHERE status = 1`, []);
};

export const countEntries = (
  subtract: number,
  condition: number,
  startDate: string,
  endDate: string,
  media: string
) => {
  //origin
  // let countQuery = `SELECT
  // SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) AS "totalValid",
  // SUM(CASE WHEN is_valid = 2 THEN 1 ELSE 0 END) AS "totalPending",
  // SUM(CASE WHEN is_valid = 0 THEN 1 ELSE 0 END) AS "totalInvalid",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '300' THEN 1 ELSE 0 END) AS "totalValidWa1",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '300' THEN 1 ELSE 0 END) AS "totalPendingWa1",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '300' THEN 1 ELSE 0 END) AS "totalInvalidWa1",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '301' THEN 1 ELSE 0 END) AS "totalValidWa2",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '301' THEN 1 ELSE 0 END) AS "totalPendingWa2",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '301' THEN 1 ELSE 0 END) AS "totalInvalidWa2",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '302' THEN 1 ELSE 0 END) AS "totalValidWa3",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '302' THEN 1 ELSE 0 END) AS "totalPendingWa3",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '302' THEN 1 ELSE 0 END) AS "totalInvalidWa3",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '400' THEN 1 ELSE 0 END) AS "totalValidMicrosite",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '400' THEN 1 ELSE 0 END) AS "totalPendingMicrosite",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '400' THEN 1 ELSE 0 END) AS "totalInvalidMicrosite",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '500' THEN 1 ELSE 0 END) AS "totalValidApp",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '500' THEN 1 ELSE 0 END) AS "totalPendingApp",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '500' THEN 1 ELSE 0 END) AS "totalInvalidApp",
  // count(*) AS counts
  // FROM entries AS A
  // JOIN media ON A."mediaId" = media.id
  // WHERE 1 = 1 ${cutOfWhere(subtract, "")}${whereCondition(condition, startDate, endDate)}${whereMedia(media)}`;

  let countQuery = `SELECT 
    SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) AS "totalValid",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" = 99 THEN 1 ELSE 0 END) AS "totalUnlucky",
    SUM(CASE WHEN is_valid = 2 THEN 1 ELSE 0 END) AS "totalPending",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 THEN 1 ELSE 0 END) AS "totalInvalid",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '300' THEN 1 ELSE 0 END) AS "totalValidWa1",
    SUM(CASE WHEN is_valid = 2 AND media.code = '300' THEN 1 ELSE 0 END) AS "totalPendingWa1",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '300' THEN 1 ELSE 0 END) AS "totalInvalidWa1",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '301' THEN 1 ELSE 0 END) AS "totalValidWa2",
    SUM(CASE WHEN is_valid = 2 AND media.code = '301' THEN 1 ELSE 0 END) AS "totalPendingWa2",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '301' THEN 1 ELSE 0 END) AS "totalInvalidWa2",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '302' THEN 1 ELSE 0 END) AS "totalValidWa3",
    SUM(CASE WHEN is_valid = 2 AND media.code = '302' THEN 1 ELSE 0 END) AS "totalPendingWa3",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '302' THEN 1 ELSE 0 END) AS "totalInvalidWa3",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '400' THEN 1 ELSE 0 END) AS "totalValidMicrosite",
    SUM(CASE WHEN is_valid = 2 AND media.code = '400' THEN 1 ELSE 0 END) AS "totalPendingMicrosite",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '400' THEN 1 ELSE 0 END) AS "totalInvalidMicrosite",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '500' THEN 1 ELSE 0 END) AS "totalValidApp",
    SUM(CASE WHEN is_valid = 2 AND media.code = '500' THEN 1 ELSE 0 END) AS "totalPendingApp",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '500' THEN 1 ELSE 0 END) AS "totalInvalidApp",
    count(*) AS counts
    FROM entries AS A
    JOIN media ON A."mediaId" = media.id
    WHERE 1 = 1 ${cutOfWhere(subtract, "")}${whereCondition(
    condition,
    startDate,
    endDate
  )}${whereMedia(media)}`;
  return exeQuery(countQuery, []);
};

export const totalEntries = (subtract: number, media: string) => {
  //origin
  // let countQuery = `SELECT
  // SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) AS "totalValid",
  // SUM(CASE WHEN is_valid = 2 THEN 1 ELSE 0 END) AS "totalPending",
  // SUM(CASE WHEN is_valid = 0 THEN 1 ELSE 0 END) AS "totalInvalid",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '300' THEN 1 ELSE 0 END) AS "validWa1",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '300' THEN 1 ELSE 0 END) AS "pendingWa1",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '300' THEN 1 ELSE 0 END) AS "invalidWa1",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '301' THEN 1 ELSE 0 END) AS "validWa2",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '301' THEN 1 ELSE 0 END) AS "pendingWa2",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '301' THEN 1 ELSE 0 END) AS "invalidWa2",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '302' THEN 1 ELSE 0 END) AS "validWa3",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '302' THEN 1 ELSE 0 END) AS "pendingWa3",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '302' THEN 1 ELSE 0 END) AS "invalidWa3",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '400' THEN 1 ELSE 0 END) AS "totalValidMicrosite",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '400' THEN 1 ELSE 0 END) AS "pendingMicrosite",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '400' THEN 1 ELSE 0 END) AS "totalInvalidMicrosite",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '500' THEN 1 ELSE 0 END) AS "totalValidApp",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '500' THEN 1 ELSE 0 END) AS "pendingApp",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '500' THEN 1 ELSE 0 END) AS "totalInvalidApp",
  // count(*) AS counts
  // FROM entries AS A
  // JOIN media ON A."mediaId" = media.id
  // WHERE 1 = 1 ${cutOfWhere(subtract, "")}${whereMedia(media)}`;
  let countQuery = `SELECT 
    SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) AS "totalValid",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" = 99 THEN 1 ELSE 0 END) AS "totalUnlucky",
    SUM(CASE WHEN is_valid = 2 THEN 1 ELSE 0 END) AS "totalPending",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 THEN 1 ELSE 0 END) AS "totalInvalid",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '300' THEN 1 ELSE 0 END) AS "validWa1",
    SUM(CASE WHEN is_valid = 2 AND media.code = '300' THEN 1 ELSE 0 END) AS "pendingWa1",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '300' THEN 1 ELSE 0 END) AS "invalidWa1",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '301' THEN 1 ELSE 0 END) AS "validWa2",
    SUM(CASE WHEN is_valid = 2 AND media.code = '301' THEN 1 ELSE 0 END) AS "pendingWa2",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '301' THEN 1 ELSE 0 END) AS "invalidWa2",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '302' THEN 1 ELSE 0 END) AS "validWa3",
    SUM(CASE WHEN is_valid = 2 AND media.code = '302' THEN 1 ELSE 0 END) AS "pendingWa3",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '302' THEN 1 ELSE 0 END) AS "invalidWa3",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '400' THEN 1 ELSE 0 END) AS "totalValidMicrosite",
    SUM(CASE WHEN is_valid = 2 AND media.code = '400' THEN 1 ELSE 0 END) AS "pendingMicrosite",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '400' THEN 1 ELSE 0 END) AS "totalInvalidMicrosite",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '500' THEN 1 ELSE 0 END) AS "totalValidApp",
    SUM(CASE WHEN is_valid = 2 AND media.code = '500' THEN 1 ELSE 0 END) AS "pendingApp",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '500' THEN 1 ELSE 0 END) AS "totalInvalidApp",
    count(*) AS counts 
    FROM entries AS A
    JOIN media ON A."mediaId" = media.id
    WHERE 1 = 1 ${cutOfWhere(subtract, "")}${whereMedia(media)}`;
  return exeQuery(countQuery, []);
};

export const currentWinner100 = () => {
  return exeQuery(
    "SELECT COUNT(1) AS counts FROM winner WHERE is_approved IN (0,1)",
    []
  );
};

export const entriesSummary = (
  subtract: number,
  condition: number,
  startDate: string,
  endDate: string
) => {
  //origin
  // const entriesSummaryQuery = `SELECT
  // ${time(condition, "")}
  // SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END ) AS valid,
  // SUM(CASE WHEN is_valid = 2 THEN 1 ELSE 0 END ) AS pending,
  // SUM(CASE WHEN is_valid = 0 THEN 1 ELSE 0 END ) AS invalid,
  // SUM(CASE WHEN is_valid = 1 AND media.code = '300' THEN 1 ELSE 0 END) AS "validWa1",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '300' THEN 1 ELSE 0 END) AS "pendingWa1",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '300' THEN 1 ELSE 0 END) AS "invalidWa1",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '301' THEN 1 ELSE 0 END) AS "validWa2",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '301' THEN 1 ELSE 0 END) AS "pendingWa2",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '301' THEN 1 ELSE 0 END) AS "invalidWa2",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '302' THEN 1 ELSE 0 END) AS "validWa3",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '302' THEN 1 ELSE 0 END) AS "pendingWa3",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '302' THEN 1 ELSE 0 END) AS "invalidWa3",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '400' THEN 1 ELSE 0 END ) AS "validMicrosite",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '400' THEN 1 ELSE 0 END) AS "pendingMicrosite",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '400' THEN 1 ELSE 0 END ) AS "invalidMicrosite",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '500' THEN 1 ELSE 0 END ) AS "validApp",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '500' THEN 1 ELSE 0 END) AS "pendingApp",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '500' THEN 1 ELSE 0 END ) AS "invalidApp",
  // SUM(CASE WHEN A.id IS NOT NULL AND media.code = '301' THEN 1 ELSE 0 END ) AS "allWa2",
  // SUM(CASE WHEN A.id IS NOT NULL AND media.code = '300' THEN 1 ELSE 0 END ) AS "allWa1",
  // SUM(CASE WHEN A.id IS NOT NULL AND media.code = '302' THEN 1 ELSE 0 END ) AS "allWa3",
  // SUM(CASE WHEN A.id IS NOT NULL AND media.code = '400' THEN 1 ELSE 0 END ) AS "allMicrosite",
  // SUM(CASE WHEN A.id IS NOT NULL AND media.code = '500' THEN 1 ELSE 0 END ) AS "allApp",
  // COUNT(1) AS "all"
  // FROM entries AS A
  // JOIN media ON A."mediaId" = media.id
  // WHERE 1 = 1 ${cutOfWhere(subtract, "")}${whereCondition(condition, startDate, endDate)} ${groupBy(
  //     condition,
  //     "")}`;

  const entriesSummaryQuery = `SELECT
    ${time(condition, "")}
    SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) AS valid,
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" = 99 THEN 1 ELSE 0 END) AS unlucky,
    SUM(CASE WHEN is_valid = 2 THEN 1 ELSE 0 END ) AS pending,
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 THEN 1 ELSE 0 END) AS invalid,
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '300' THEN 1 ELSE 0 END) AS "validWa1",
    SUM(CASE WHEN is_valid = 2 AND media.code = '300' THEN 1 ELSE 0 END) AS "pendingWa1",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '300' THEN 1 ELSE 0 END) AS "invalidWa1",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '301' THEN 1 ELSE 0 END) AS "validWa2",
    SUM(CASE WHEN is_valid = 2 AND media.code = '301' THEN 1 ELSE 0 END) AS "pendingWa2",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '301' THEN 1 ELSE 0 END) AS "invalidWa2",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '302' THEN 1 ELSE 0 END) AS "validWa3",
    SUM(CASE WHEN is_valid = 2 AND media.code = '302' THEN 1 ELSE 0 END) AS "pendingWa3",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '302' THEN 1 ELSE 0 END) AS "invalidWa3",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '400' THEN 1 ELSE 0 END ) AS "validMicrosite",
    SUM(CASE WHEN is_valid = 2 AND media.code = '400' THEN 1 ELSE 0 END) AS "pendingMicrosite",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '400' THEN 1 ELSE 0 END ) AS "invalidMicrosite",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99)) AND media.code = '500' THEN 1 ELSE 0 END ) AS "validApp",
    SUM(CASE WHEN is_valid = 2 AND media.code = '500' THEN 1 ELSE 0 END) AS "pendingApp",
    SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND media.code = '500' THEN 1 ELSE 0 END ) AS "invalidApp",
    SUM(CASE WHEN A.id IS NOT NULL AND media.code = '301' THEN 1 ELSE 0 END ) AS "allWa2",
    SUM(CASE WHEN A.id IS NOT NULL AND media.code = '300' THEN 1 ELSE 0 END ) AS "allWa1",
    SUM(CASE WHEN A.id IS NOT NULL AND media.code = '302' THEN 1 ELSE 0 END ) AS "allWa3",
    SUM(CASE WHEN A.id IS NOT NULL AND media.code = '400' THEN 1 ELSE 0 END ) AS "allMicrosite",
    SUM(CASE WHEN A.id IS NOT NULL AND media.code = '500' THEN 1 ELSE 0 END ) AS "allApp",
	COUNT(1) AS "all"
    FROM entries AS A
    JOIN media ON A."mediaId" = media.id
    WHERE 1 = 1 ${cutOfWhere(subtract, "")}${whereCondition(
    condition,
    startDate,
    endDate
  )} ${groupBy(condition, "")}`;
  return exeQuery(entriesSummaryQuery, []);
};

export const countProfiles = (params: formatDashboard) => {
  let countQuery = `SELECT COUNT(1) counts FROM (SELECT users.id
        FROM users
        LEFT JOIN entries AS A ON users.id = A."userId"
        WHERE 0 = 0
        ${cutOfWhere(params.subtract, "")}
        ${whereProfileCondition(
          params.condition,
          params.startDate,
          params.endDate
        )} 
        GROUP BY users.id) a`;
  // let countQuery = `SELECT
  // count(1) AS counts
  //   FROM profiles JOIN entries AS A ON profiles.id = A.userId WHERE 0 = 0${cutOfWhere(params.subtract, "")} ${whereCondition(params.condition, params.startDate, params.endDate)}`;
  return exeQuery(countQuery, []);
};

export const totalProfile = (
  subtract: number,
  condition: number,
  startDate: string,
  endDate: string,
  media: string[]
) => {
  let countQuery = `SELECT COUNT(1) counts,
    ${media}
    FROM (SELECT users.id, users."mediaId"
      FROM users
     LEFT JOIN entries AS A ON users.id = A."userId"
	 LEFT JOIN media ON A."mediaId" = media.id
    WHERE 0 = 0 ${whereProfileCondition(condition, startDate, endDate)}
    ${cutOfWhere(subtract, "")} 
    GROUP BY users.id) users`;
  // console.log(countQuery);

  // let countQuery = `SELECT COUNT(1) counts
  // FROM (SELECT users.id
  //   FROM users
  //  JOIN entries AS A ON users.id = A.userId
  //  JOIN media ON A.mediaId = media.id
  // WHERE 0 = 0
  //     ${whereMedia(media)}
  //     ${whereProfileCondition(condition, startDate, endDate)}
  //       ${cutOfWhere(subtract, "")}
  // GROUP BY users.id) a`;
  return exeQuery(countQuery, []);
};

export const profileSummary = (
  subtract: number,
  condition: number,
  startDate: string,
  endDate: string,
  media: string[]
) => {
  const profileSummaryQuery = `SELECT
      ${time(condition, "users")}
      ${media},
      count(1) AS "all"
      FROM (SELECT users.created_at, 
      users."mediaId" FROM users 
      LEFT JOIN entries AS A ON users.id = A."userId" 
      LEFT JOIN media ON A."mediaId" = media.id WHERE 0 = 0 ${cutOfWhere(
        subtract,
        "users"
      )} ${whereProfileCondition(condition, startDate, endDate)}
      GROUP BY users.id) users ${groupBy(condition, "users")}`;
  return exeQuery(profileSummaryQuery, []);
};

export const demographic = (
  subtract: number | string,
  media: string,
  status: string
) => {
  let demographicQuery = `SELECT
    SUM(CASE WHEN gender = 'M' OR gender = 'L' THEN 1 ELSE 0 END ) AS "Male",
    SUM(CASE WHEN gender = 'F' OR gender = 'P' THEN 1 ELSE 0 END ) AS "Female",
    SUM(CASE WHEN gender = '' OR gender IS NULL THEN 1 ELSE 0 END ) AS "NonKTPGender",
    SUM(CASE WHEN age > 0 AND age < 5 THEN 1 ELSE 0 END ) AS "umur5",
    SUM(CASE WHEN age > 4 AND age < 17 THEN 1 ELSE 0 END ) AS "umur5_17",
    SUM(CASE WHEN age > 16 AND age < 26 THEN 1 ELSE 0 END ) AS "umur17_25",
     SUM(CASE WHEN age > 25 AND age < 36 THEN 1 ELSE 0 END ) AS "umur26_35",
     SUM(CASE WHEN age > 35 AND age < 46 THEN 1 ELSE 0 END ) AS "umur36_45",
     SUM(CASE WHEN age > 45 AND age < 56 THEN 1 ELSE 0 END ) AS "umur46_55",
     SUM(CASE WHEN age > 55 THEN 1 ELSE 0 END ) AS "umur55",
     SUM(CASE WHEN age = 0 OR age IS NULL THEN 1 ELSE 0 END ) AS "NonKTPAge"
  FROM ( SELECT users.age AS age,users.gender AS gender FROM users LEFT JOIN entries AS A ON(users.id = A."userId") LEFT JOIN media ON users."mediaId" = media.id WHERE 0 = 0 ${whereMedia(
    media
  )} GROUP BY users.id) AS "profileEntries"`;

  return exeQuery(demographicQuery, []);
};

export const variants = (media: string) => {
  let syntax = `SELECT variant_name AS categories, SUM(quantity + 0) AS series
    FROM variants
    LEFT JOIN entries_variant ON entries_variant.variant_id = variants.id
    GROUP BY variants.id`;
  return exeQuery(syntax, []);
};

export const variants2 = (type: number) => {
  let syntax = `SELECT coupon_variant.description AS categories, COUNT(1) AS series
  FROM entries
  JOIN coupon_variant ON entries."couponVariantId" = coupon_variant.id
  WHERE entries.is_valid = 1 AND coupon_variant."couponTypeId" = $1
  GROUP BY coupon_variant.id`;
  return exeQuery(syntax, [type]);
};

export const professions = () => {
  let syntax = `SELECT job.name AS categories, COUNT(*) AS series FROM job 
    JOIN users ON users."jobId" = job.id
    WHERE users.id IN (SELECT "userId" FROM entries AS A)
    GROUP BY job.name`;
  return exeQuery(syntax, []);
};

export const sumCategoryProducts = (media: string) => {
  let syntax = `SELECT variant_category.id AS idSeries, variant_category.name AS categories, SUM(entries_variant.quantity) AS series FROM variant_category 
    JOIN variants ON variant_category.id = variants.category
    JOIN entries_variant ON entries_variant.variant_id = variants.id
    JOIN entries AS A ON A.id = entries_variant.entries_id
    WHERE 0 = 0
    ${whereMedia(media)}
    GROUP BY variant_category.id`;
  return exeQuery(syntax, []);
};

export const countProductsByCat = (params: ProdParams) => {
  const seentax = `SELECT COUNT(*) over () as total_all 
    FROM variants
    JOIN (SELECT variant_id, quantity, amount FROM entries_variant) AS entries_variant ON variants.id = entries_variant.variant_id 
    LEFT JOIN variant_category ON variant_category.id = variants.category
    WHERE variant_category.id = ?
    GROUP BY variants.id
    ${orderByPrd(params.direction, params.column)}`;
  return exeQuery(seentax, [params.productId]);
};

export const listProductsByCat = (params: ProdParams) => {
  const seentax = `SELECT variants.variant_name, SUM(entries_variant.quantity) AS quantity, SUM(entries_variant.amount) AS totalPrice 
    FROM variants
    JOIN (SELECT variant_id, quantity, amount FROM entries_variant) AS entries_variant ON variants.id = entries_variant.variant_id 
    LEFT JOIN variant_category ON variant_category.id = variants.category
    WHERE variant_category.id = ?
    GROUP BY variants.id
    ${orderByPrd(params.direction, params.column)} ${params.limit}`;
  return exeQuery(seentax, [params.productId]);
};

export const getInvalidReason = () => {
  //origin
  // let getRep = `SELECT id, alias, name AS reason FROM invalid_reason`

  let getRep = `SELECT id, alias, name AS reason FROM invalid_reason WHERE id != 99 AND status != 0`;
  return exeQuery(getRep, []);
};

export const statusSummary = (
  subtract: number,
  condition: number,
  startDate: string,
  endDate: string,
  invList: string[]
) => {
  //origin
  // const statusSummaryQuery = `SELECT
  // ${time(condition, "")}
  // ${invList},
  // SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) AS valid,
  // SUM(CASE WHEN is_valid = 0 THEN 1 ELSE 0 END) AS invalid,
  // SUM(CASE WHEN is_valid = 2 THEN 1 ELSE 0 END) AS pending,
  // SUM(CASE WHEN is_valid = 1 AND media.code = '300' THEN 1 ELSE 0 END) AS "validWa1",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '300' THEN 1 ELSE 0 END) AS "pendingWa1",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '300' THEN 1 ELSE 0 END) AS "invalidWa1",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '301' THEN 1 ELSE 0 END) AS "validWa2",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '301' THEN 1 ELSE 0 END) AS "pendingWa2",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '301' THEN 1 ELSE 0 END) AS "invalidWa2",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '302' THEN 1 ELSE 0 END) AS "validWa3",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '302' THEN 1 ELSE 0 END) AS "pendingWa3",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '302' THEN 1 ELSE 0 END) AS "invalidWa3",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '400' THEN 1 ELSE 0 END) AS "validMicrosite",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '400' THEN 1 ELSE 0 END) AS "pendingMicrosite",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '400' THEN 1 ELSE 0 END) AS "invalidMicrosite",
  // SUM(CASE WHEN is_valid = 1 AND media.code = '500' THEN 1 ELSE 0 END) AS "validApp",
  // SUM(CASE WHEN is_valid = 2 AND media.code = '500' THEN 1 ELSE 0 END) AS "pendingApp",
  // SUM(CASE WHEN is_valid = 0 AND media.code = '500' THEN 1 ELSE 0 END) AS "invalidApp"
  // FROM entries AS A
  // JOIN media ON A."mediaId" = media.id
  // LEFT JOIN invalid_reason ON (A."invalidReasonId" = invalid_reason.id)
  // WHERE 1 = 1 ${cutOfWhere(subtract, "")} ${whereCondition(condition, startDate, endDate)} ${groupBy(condition, "")}`;

  const statusSummaryQuery = `SELECT
    ${time(condition, "")}
    ${invList},
    
    SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) AS valid,
    SUM(CASE WHEN is_valid = 0 AND invalid_reason.id = 99 THEN 1 ELSE 0 END) AS unlucky,
    SUM(CASE WHEN is_valid = 0 AND invalid_reason.id != 99 THEN 1 ELSE 0 END) AS invalid,
    SUM(CASE WHEN is_valid = 2 THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND invalid_reason.id = 99)) AND media.code = '300' THEN 1 ELSE 0 END) AS "validWa1",
    SUM(CASE WHEN is_valid = 2 AND media.code = '300' THEN 1 ELSE 0 END) AS "pendingWa1",
    SUM(CASE WHEN is_valid = 0 AND invalid_reason.id != 99 AND media.code = '300' THEN 1 ELSE 0 END) AS "invalidWa1",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND invalid_reason.id = 99)) AND media.code = '301' THEN 1 ELSE 0 END) AS "validWa2",
    SUM(CASE WHEN is_valid = 2 AND media.code = '301' THEN 1 ELSE 0 END) AS "pendingWa2",
    SUM(CASE WHEN is_valid = 0 AND invalid_reason.id != 99 AND media.code = '301' THEN 1 ELSE 0 END) AS "invalidWa2",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND invalid_reason.id = 99)) AND media.code = '302' THEN 1 ELSE 0 END) AS "validWa3",
    SUM(CASE WHEN is_valid = 2 AND media.code = '302' THEN 1 ELSE 0 END) AS "pendingWa3",
    SUM(CASE WHEN is_valid = 0 AND invalid_reason.id != 99 AND media.code = '302' THEN 1 ELSE 0 END) AS "invalidWa3",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND invalid_reason.id = 99)) AND media.code = '400' THEN 1 ELSE 0 END) AS "validMicrosite",
    SUM(CASE WHEN is_valid = 2 AND media.code = '400' THEN 1 ELSE 0 END) AS "pendingMicrosite",
    SUM(CASE WHEN is_valid = 0 AND invalid_reason.id != 99 AND media.code = '400' THEN 1 ELSE 0 END) AS "invalidMicrosite",
    SUM(CASE WHEN (is_valid = 1 OR (is_valid = 0 AND invalid_reason.id = 99)) AND media.code = '500' THEN 1 ELSE 0 END) AS "validApp",
    SUM(CASE WHEN is_valid = 2 AND media.code = '500' THEN 1 ELSE 0 END) AS "pendingApp",
    SUM(CASE WHEN is_valid = 0 AND invalid_reason.id != 99 AND media.code = '500' THEN 1 ELSE 0 END) AS "invalidApp"
    FROM entries AS A
    JOIN media ON A."mediaId" = media.id 
    LEFT JOIN invalid_reason ON (A."invalidReasonId" = invalid_reason.id)
    WHERE 1 = 1 ${cutOfWhere(subtract, "")} ${whereCondition(
    condition,
    startDate,
    endDate
  )} ${groupBy(condition, "")}`;

  // console.log(statusSummaryQuery);

  return exeQuery(statusSummaryQuery, []);
};

export const statusSummaryInv = (
  subtract: number,
  condition: number,
  startDate: string,
  endDate: string,
  invList: string[]
) => {
  //origin
  // const statusSummaryQuery = `SELECT
  // ${invList.map(i => i)}
  // FROM entries AS A
  // LEFT JOIN invalid_reason ON (A."invalidReasonId" = invalid_reason.id)
  // WHERE 1 = 1 ${cutOfWhere(subtract, "")} ${whereCondition(condition, startDate, endDate)} ${groupBy(condition, "")}`;

  const statusSummaryQuery = `SELECT
    ${invList.map((i) => i)}
    FROM entries AS A
    LEFT JOIN invalid_reason ON (A."invalidReasonId" = invalid_reason.id)
    WHERE 1 = 1 AND invalid_reason.id != 99 ${cutOfWhere(
      subtract,
      ""
    )} ${whereCondition(condition, startDate, endDate)} ${groupBy(
    condition,
    ""
  )}`;
  return exeQuery(statusSummaryQuery, []);
};

export const validOnly = () => {
  return exeQuery(
    `SELECT COUNT(1) OVER () AS counts FROM entries WHERE is_valid = 1 OR (is_valid = 0 AND "invalidReasonId" = 99) GROUP BY "userId"`,
    []
  );
};

export const countDistribution = (
  // subtract: number,
  key: string,
  media: string
) => {
  //     let countQuery = `
  //   SELECT COUNT(*) as counts,
  //   SUM("countDistribution".valid) AS "totalValid",
  //   SUM("countDistribution".pending) AS "totalPending",
  //   SUM("countDistribution".invalid) AS "totalInvalid",
  //   SUM("countDistribution".total_submit) AS "totalSubmit",
  //   SUM("countDistribution"."totalUnik") AS "totalUniqueConsumen"
  //     FROM (SELECT
  //       COUNT(*) AS counts,
  // 	  SUM(CASE WHEN A.is_valid = 1 THEN 1 ELSE 0 END) AS valid,
  //       SUM(CASE WHEN A.is_valid IS NULL THEN 1 ELSE 0 END) AS pending,
  //       SUM(CASE WHEN A.is_valid = 0 THEN 1 ELSE 0 END) AS invalid,
  //       COUNT(*) AS total_submit,
  //       CASE WHEN "uniqueConsumen".counts > 0 THEN "uniqueConsumen".counts ELSE 0 END AS "totalUnik"
  //       FROM users
  //       LEFT JOIN entries AS A ON A."userId" = users.id
  //       LEFT JOIN (SELECT users.regency, COUNT(*) AS counts
  //       FROM users WHERE id IN (SELECT "userId" FROM entries) GROUP BY users.regency) AS "uniqueConsumen"
  //       ON users.regency = "uniqueConsumen".regency
  //       WHERE 0 = 0 ${keyWhere(key)}${whereMedia(media)} GROUP BY users.regency, "uniqueConsumen".counts) AS "countDistribution"`;

  let countQuery = `
  SELECT COUNT(*) as counts,
  SUM("countDistribution".valid) AS "totalValid",
  SUM("countDistribution".pending) AS "totalPending",
  SUM("countDistribution".invalid) AS "totalInvalid",
  SUM("countDistribution".total_submit) AS "totalSubmit",
  SUM("countDistribution"."totalUnik") AS "totalUniqueConsumen"
    FROM (SELECT 
      COUNT(*) AS counts,
	  SUM(CASE WHEN A.is_valid = 1 OR (A.is_valid = 0 AND A."invalidReasonId" = 99) THEN 1 ELSE 0 END) AS valid,
      SUM(CASE WHEN A.is_valid = 2 THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN A.is_valid = 0 AND A."invalidReasonId" != 99 THEN 1 ELSE 0 END) AS invalid,  
      COUNT(A.is_valid) AS total_submit,
      CASE WHEN "uniqueConsumen".counts > 0 THEN "uniqueConsumen".counts ELSE 0 END AS "totalUnik"
      FROM users
      LEFT JOIN entries AS A ON A."userId" = users.id
      LEFT JOIN (SELECT users.regency_ktp, COUNT(*) AS counts 
      FROM users GROUP BY users.regency_ktp) AS "uniqueConsumen" 
      ON users.regency_ktp = "uniqueConsumen".regency_ktp
      WHERE 0 = 0 ${keyWhere(key)}${whereMedia(
    media
  )} GROUP BY users.regency_ktp, "uniqueConsumen".counts) AS "countDistribution"`;
  return exeQuery(countQuery, []);
};

export const countDistributionByInput = (key: string, media: string) => {
  return exeQuery(
    `SELECT
    (CASE WHEN users.regency_ktp is null THEN 'OTHERS' ELSE users.regency_ktp END) AS regency_ktp,
    COUNT(A.is_valid) AS total_submit
    FROM users
    LEFT JOIN entries AS A ON A."userId" = users.id
    LEFT JOIN (SELECT users.regency_ktp, COUNT(*) AS counts 
    FROM users GROUP BY users.regency_ktp) AS "uniqueConsumen" 
    ON users.regency_ktp = "uniqueConsumen".regency_ktp
    WHERE 0 = 0 ${keyWhere(key)}${whereMedia(
      media
    )} GROUP BY users.regency_ktp, "uniqueConsumen".counts`,
    []
  );
};

export const countDistributionProvince = (
  // subtract: number,
  key: string,
  media: string
) => {
  //     let countQuery = `
  //   SELECT COUNT(*) as counts,
  //   SUM("countDistribution".valid) AS "totalValid",
  //   SUM("countDistribution".pending) AS "totalPending",
  //   SUM("countDistribution".invalid) AS "totalInvalid",
  //   SUM("countDistribution".total_submit) AS "totalSubmit",
  //   SUM("countDistribution"."totalUnik") AS "totalUniqueConsumen"
  //     FROM (SELECT
  //       COUNT(*) AS counts,
  // 	  SUM(CASE WHEN A.is_valid = 1 THEN 1 ELSE 0 END) AS valid,
  //       SUM(CASE WHEN A.is_valid IS NULL THEN 1 ELSE 0 END) AS pending,
  //       SUM(CASE WHEN A.is_valid = 0 THEN 1 ELSE 0 END) AS invalid,
  //       COUNT(*) AS total_submit,
  //       CASE WHEN "uniqueConsumen".counts > 0 THEN "uniqueConsumen".counts ELSE 0 END AS "totalUnik"
  //       FROM users
  //       LEFT JOIN entries AS A ON A."userId" = users.id
  //       LEFT JOIN (SELECT users.regency, COUNT(*) AS counts
  //       FROM users WHERE id IN (SELECT "userId" FROM entries) GROUP BY users.regency) AS "uniqueConsumen"
  //       ON users.regency = "uniqueConsumen".regency
  //       WHERE 0 = 0 ${keyWhere(key)}${whereMedia(media)} GROUP BY users.regency, "uniqueConsumen".counts) AS "countDistribution"`;

  let countQuery = `
  SELECT COUNT(*) as counts,
  SUM("countDistribution".valid) AS "totalValid",
  SUM("countDistribution".pending) AS "totalPending",
  SUM("countDistribution".invalid) AS "totalInvalid",
  SUM("countDistribution".total_submit) AS "totalSubmit",
  SUM("countDistribution"."totalUnik") AS "totalUniqueConsumen"
    FROM (SELECT 
      COUNT(*) AS counts,
	  SUM(CASE WHEN A.is_valid = 1 OR (A.is_valid = 0 AND A."invalidReasonId" = 99) THEN 1 ELSE 0 END) AS valid,
      SUM(CASE WHEN A.is_valid = 2 THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN A.is_valid = 0 AND A."invalidReasonId" != 99 THEN 1 ELSE 0 END) AS invalid,  
      COUNT(A.is_valid) AS total_submit,
      CASE WHEN "uniqueConsumen".counts > 0 THEN "uniqueConsumen".counts ELSE 0 END AS "totalUnik"
      FROM users
      LEFT JOIN entries AS A ON A."userId" = users.id
      LEFT JOIN (SELECT users.regency_ktp, COUNT(*) AS counts 
      FROM users GROUP BY users.regency_ktp) AS "uniqueConsumen" 
      ON users.regency_ktp = "uniqueConsumen".regency_ktp
      WHERE 0 = 0 ${keyWhere(key)}${whereMedia(
    media
  )} GROUP BY users.regency_ktp, "uniqueConsumen".counts) AS "countDistribution"`;
  return exeQuery(countQuery, []);
};

export const exportDistribution = (params: formatDashboard) => {
  let exportDistributionquery = `
  SELECT (CASE WHEN users.regency_ktp = "" OR users.regency_ktp IS NULL THEN "OTHERS" ELSE users.regency_ktp END) AS regency_ktp,
  COUNT(*) AS total_submit, 
  SUM(CASE WHEN A.is_valid=1 THEN 1 ELSE 0 END) AS total_submit_valid,
  SUM(CASE WHEN A.is_valid IS NULL THEN 1 ELSE 0 END) AS total_submit_pending,
  SUM(CASE WHEN A.is_valid=0 THEN 1 ELSE 0 END) AS total_submit_invalid,
  uniqueConsumen.counts as uniqueConsumen 
  FROM entries AS A
  LEFT JOIN users ON A.userId = users.id
  LEFT JOIN (SELECT users.regency_ktp, COUNT(*) AS counts 
  FROM users GROUP BY users.regency_ktp) AS uniqueConsumen ON users.regency_ktp = uniqueConsumen.regency_ktp
  WHERE 0 = 0${keyWhere(params.key)}${whereMedia(
    params.media
  )} GROUP BY users.regency_ktp${orderBy(params.direction, params.column)} ${
    params.limitQuery
  }`;
  return exeQuery(exportDistributionquery, []);
};

export const listDistribution = (
  key: string,
  media: string,
  column: string,
  direction: string,
  limit: string
) => {
  let listDistributionQuery = `
  SELECT (CASE WHEN users.regency_ktp = '' OR users.regency_ktp IS NULL THEN 'OTHERS' ELSE users.regency_ktp END) AS regency,
  COUNT(A.is_valid) AS total_submit, 
  SUM(CASE WHEN A.is_valid=1 OR (A.is_valid = 0 AND A."invalidReasonId" = 99) THEN 1 ELSE 0 END) AS total_submit_valid,
  SUM(CASE WHEN A.is_valid = 2 THEN 1 ELSE 0 END) AS total_submit_pending,
  SUM(CASE WHEN A.is_valid= 0 AND A."invalidReasonId" != 99 THEN 1 ELSE 0 END) AS total_submit_invalid,
  MAX("uniqueConsumen".counts) as "uniqueConsumen"
  FROM users
  LEFT JOIN entries AS A ON A."userId" = users.id
  LEFT JOIN media ON users."mediaId" = media.id
  LEFT JOIN (SELECT users.regency_ktp, COUNT(*) AS counts
  FROM users GROUP BY users.regency_ktp) AS "uniqueConsumen" ON users.regency_ktp = "uniqueConsumen".regency_ktp
  WHERE 0 = 0 ${keyWhere(key)}${whereMedia(
    media
  )} GROUP BY users.regency_ktp${orderBy(direction, column)} ${limit}`;
  return exeQuery(listDistributionQuery, []);
};

export const listDistributionProvince = (
  key: string,
  media: string,
  column: string,
  direction: string,
  limit: string
) => {
  let listDistributionQuery = `
  SELECT (CASE WHEN users.regency_ktp = '' OR users.regency_ktp IS NULL THEN 'OTHERS' ELSE users.regency_ktp END) AS regency_ktp,
  COUNT(A.is_valid) AS total_submit, 
  SUM(CASE WHEN A.is_valid=1 OR (A.is_valid = 0 AND A."invalidReasonId" = 99) THEN 1 ELSE 0 END) AS total_submit_valid,
  SUM(CASE WHEN A.is_valid = 2 THEN 1 ELSE 0 END) AS total_submit_pending,
  SUM(CASE WHEN A.is_valid= 0 AND A."invalidReasonId" != 99 THEN 1 ELSE 0 END) AS total_submit_invalid,
  MAX("uniqueConsumen".counts) as "uniqueConsumen"
  FROM users
  LEFT JOIN entries AS A ON A."userId" = users.id
  LEFT JOIN media ON users."mediaId" = media.id
  LEFT JOIN (SELECT users.regency_ktp, COUNT(*) AS counts
  FROM users GROUP BY users.regency_ktp) AS "uniqueConsumen" ON users.regency_ktp = "uniqueConsumen".regency_ktp
  WHERE 0 = 0 ${keyWhere(key)}${whereMedia(
    media
  )} GROUP BY users.regency_ktp${orderByProvince(direction, column)} ${limit}`;
  return exeQuery(listDistributionQuery, []);
};

export const countDistributionKtp = (params: formatDashboard) => {
  let countQuery = `
    SELECT 
    COUNT(*) as counts,
      SUM(countDistribution.valid) AS totalValid,
      SUM(countDistribution.pending) AS totalPending,
      SUM(countDistribution.invalid) AS totalInvalid,
    SUM(countDistribution.total_submit) AS totalSubmit,
      SUM(countDistribution.totalUnik) AS totalUniqueConsumen
FROM (SELECT 
          COUNT(*) AS counts,
          SUM(CASE WHEN A.is_valid = 1 THEN 1 ELSE 0 END) AS valid,
          SUM(CASE WHEN A.is_valid IS NULL THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN A.is_valid = 0 THEN 1 ELSE 0 END) AS invalid,  
          COUNT(*) AS total_submit,
          CASE WHEN uniqueConsumen.counts > 0 THEN uniqueConsumen.counts ELSE 0 END AS totalUnik
  FROM entries AS A
  LEFT JOIN users ON A.userId = users.id
  LEFT JOIN (SELECT users.regency_ktp, COUNT(*) AS counts 
  FROM users WHERE id IN (SELECT userId FROM entries) 
    GROUP BY users.regency_ktp
    ) AS uniqueConsumen ON users.regency_ktp = uniqueConsumen.regency_ktp
LEFT JOIN code_regency ON users.regency_ktp = code_regency.code
WHERE 0 = 0${cutOfWhere(params.subtract, "")}${keyWhere(
    params.key
  )}${whereMedia(params.media)} 
GROUP BY (CASE WHEN code_regency.name IS NOT NULL THEN code_regency.name ELSE "Non KTP" END)) AS countDistribution`;
  return exeQuery(countQuery, []);
};

export const listDistributionKtp = (params: formatDashboard) => {
  let listDistributionQuery = `
    SELECT 
        (CASE WHEN code_regency.name IS NOT NULL THEN code_regency.name ELSE "Non KTP" END) AS regency,
        COUNT(*) AS total_submit, 
        SUM(CASE WHEN A.is_valid=1 THEN 1 ELSE 0 END) AS total_submit_valid,
        SUM(CASE WHEN A.is_valid IS NULL THEN 1 ELSE 0 END) AS total_submit_pending,
        SUM(CASE WHEN A.is_valid=0 THEN 1 ELSE 0 END) AS total_submit_invalid, 
        uniqueConsumen.counts as uniqueConsumen 
    FROM entries AS A
    LEFT JOIN users ON A.userId = users.id
    LEFT JOIN (SELECT users.regency_ktp, COUNT(*) AS counts 
               FROM users 
               GROUP BY regency_ktp
              ) AS uniqueConsumen ON users.regency_ktp = uniqueConsumen.regency_ktp
    LEFT JOIN code_regency ON users.regency_ktp = code_regency.code
    WHERE 0 = 0${keyWhere(params.key)}${whereMedia(params.media)} 
    GROUP BY (CASE WHEN code_regency.name IS NOT NULL THEN code_regency.name ELSE "Non KTP" END)${orderBy(
      params.direction,
      params.column
    )} ${params.limitQuery}`;
  return exeQuery(listDistributionQuery, []);
};

export const countStores = (params: IParams) => {
  let syntaxes = `SELECT COUNT(1) AS counts,
SUM(valid) AS totalValid, SUM(pending) AS totalPending, SUM(invalid) AS totalInvalid, SUM(total) AS total
 FROM (
        SELECT
        store_master.id,
        SUM(CASE WHEN A.is_valid = 1 THEN 1 ELSE 0 END) AS valid,
        SUM(CASE WHEN A.is_valid = 2 then 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN A.is_valid = 0 THEN 1 ELSE 0 END) AS invalid,
        SUM(CASE WHEN A.is_valid THEN 1 ELSE 0 END) AS total
        FROM store_master
        LEFT JOIN entries AS A ON store_master.id = A.store_id
        WHERE 1 = 1
        ${storeKeyWhere(params.key)} ${dateWhere(
    params.startDate,
    params.endDate
  )}
    GROUP BY store_master.id) as stores`;
  return exeQuery(syntaxes, []);
};

export const listStores = (params: IParams) => {
  let syntaxes = `SELECT
    store_master.id,
    store_master.store_name,
    store_master.city,
    store_master.province, 
    SUM(CASE WHEN A.is_valid = 1 THEN 1 ELSE 0 END) AS valid,
    SUM(CASE WHEN A.is_valid = 2 then 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN A.is_valid = 0 THEN 1 ELSE 0 END) AS invalid,
    SUM(CASE WHEN A.is_valid THEN 1 ELSE 0 END) AS total
    FROM store_master
    LEFT JOIN entries AS A ON store_master.id = A.store_id
    WHERE 1 = 1
        ${storeKeyWhere(params.key)} ${dateWhere(
    params.startDate,
    params.endDate
  )} 
    GROUP BY store_master.id ${storeOrderBy(params.direction, params.column)} ${
    params.limit
  }`;
  return exeQuery(syntaxes, []);
};

export const countSales = (params: IParams) => {
  if (params.mode === "store") {
    let syntaxes = `SELECT COUNT(1) AS counts, SUM(valid) AS totalValid, SUM(pending) AS totalPending, SUM(invalid) AS totalInvalid, SUM(total) AS total
FROM (
SELECT
    store_master.id,
    store_master.store_name,
    store_master.city,
    store_master.province, 
    SUM(CASE WHEN A.is_valid = 1 THEN A.total_amount ELSE 0 END) AS valid,
    SUM(CASE WHEN A.is_valid = 2 THEN A.total_amount ELSE 0 END) AS pending,
    SUM(CASE WHEN A.is_valid = 0 THEN A.total_amount ELSE 0 END) AS invalid,
    SUM(CASE WHEN A.is_valid THEN A.total_amount ELSE 0 END) AS total
    FROM store_master
    LEFT JOIN entries AS A ON store_master.id = A.store_id
    WHERE 1 = 1
       ${storeKeyWhere(params.key)} ${dateWhere(
      params.startDate,
      params.endDate
    )}
    group by store_master.id) as stores`;
    return exeQuery(syntaxes, []);
  } else {
    let syntaxes = `SELECT COUNT(1) AS counts, SUM(valid) AS totalValid, SUM(pending) AS totalPending, SUM(invalid) AS totalInvalid, SUM(total) AS total, SUM(validQty) AS totalValidQty, SUM(invalidQty) AS totalInvalidQty
FROM (
    SELECT 
    store_rsa.name,
    store_master.id,
    store_master.store_name,
    store_master.city,
    store_master.province, 
    SUM(CASE WHEN A.is_valid = 1 THEN A.total_amount ELSE 0 END) AS valid,
    SUM(CASE WHEN A.is_valid = 2 THEN A.total_amount ELSE 0 END) AS pending,
    SUM(CASE WHEN A.is_valid = 0 THEN A.total_amount ELSE 0 END) AS invalid,
    SUM(CASE WHEN A.is_valid THEN A.total_amount ELSE 0 END) AS total,
    SUM(CASE WHEN A.is_valid = 1 THEN entries_variant.quantity ELSE 0 END) AS validQty,
        SUM(CASE WHEN A.is_valid = 0 THEN entries_variant.quantity ELSE 0 END) AS invalidQty
    FROM store_master
    JOIN entries AS A ON store_master.id = A.store_id
    JOIN store_rsa ON A.rsa_id = store_rsa.id
    JOIN entries_variant ON A.id = entries_variant.entries_id
    WHERE 1 = 1
       ${storeKeyWhere(params.key)} ${dateWhere(
      params.startDate,
      params.endDate
    )}
    group by store_rsa.id) as stores`;
    return exeQuery(syntaxes, []);
  }
};

export const listSales = (params: IParams) => {
  if (params.mode === "store") {
    let syntaxes = `SELECT
    store_master.id,
    store_master.store_name,
    store_master.city,
    store_master.province, 
    SUM(CASE WHEN A.is_valid = 1 THEN A.total_amount ELSE 0 END) AS valid,
    SUM(CASE WHEN A.is_valid = 2 THEN A.total_amount ELSE 0 END) AS pending,
    SUM(CASE WHEN A.is_valid = 0 THEN A.total_amount ELSE 0 END) AS invalid,
    SUM(CASE WHEN A.is_valid THEN A.total_amount ELSE 0 END) AS total
    FROM store_master
    LEFT JOIN entries AS A ON store_master.id = A.store_id
    WHERE 1 = 1
       ${storeKeyWhere(params.key)} ${dateWhere(
      params.startDate,
      params.endDate
    )} 
       GROUP BY store_master.id ${storeOrderBy(
         params.direction,
         params.column
       )} ${params.limit}`;
    return exeQuery(syntaxes, []);
  } else {
    let syntaxes = `SELECT 
        store_rsa.name,
        store_master.id,
        store_master.store_name,
        store_master.city,
        store_master.province, 
        SUM(CASE WHEN A.is_valid = 1 THEN A.total_amount ELSE 0 END) AS valid,
        SUM(CASE WHEN A.is_valid = 2 THEN A.total_amount ELSE 0 END) AS pending,
        SUM(CASE WHEN A.is_valid = 0 THEN A.total_amount ELSE 0 END) AS invalid,
        SUM(CASE WHEN A.is_valid THEN A.total_amount ELSE 0 END) AS total,
        SUM(CASE WHEN A.is_valid = 1 THEN entries_variant.quantity ELSE 0 END) AS validQty,
            SUM(CASE WHEN A.is_valid = 0 THEN entries_variant.quantity ELSE 0 END) AS invalidQty
        FROM store_master
        JOIN entries AS A ON store_master.id = A.store_id
        JOIN store_rsa ON A.rsa_id = store_rsa.id
        JOIN entries_variant ON A.id = entries_variant.entries_id
        WHERE 1 = 1
               ${storeKeyWhere(params.key)} ${dateWhere(
      params.startDate,
      params.endDate
    )}
            group by store_rsa.id ${storeOrderBy(
              params.direction,
              params.column
            )} ${params.limit}`;
    return exeQuery(syntaxes, []);
  }
};

export const getPrizeSubName = () => {
  return exeQuery(
    `
    SELECT name_sub FROM prize`,
    []
  );
};

export const prizeMapper = () => {
  return exeQuery(
    `
    SELECT name, name_sub AS codes FROM prize`,
    []
  );
};

export const summaryPrize = (threshold: string) => {
  // versi 1
  return exeQuery(
    `
    SELECT
         prize.name,
         prize.name_sub AS code,
         (CASE 
    		WHEN allocation.status = 1 
    		THEN DATE(allocation.used_date) 
    		ELSE DATE(allocation.allocation_date) 
    		END) date,
         count(1) quantity,
         SUM(case when allocation.status = 1 then 1 ELSE 0 END) used
    FROM
         prize,
         allocation
    WHERE
         prize.id = allocation."prizeId"
    GROUP BY
         prize.id,
         (CASE 
    		WHEN allocation.status = 1 
    		THEN DATE(allocation.used_date) 
    		ELSE DATE(allocation.allocation_date) 
    		END)
    ORDER BY date`,
    []
  );

  // versi 2
  // return exeQuery(`
  // SELECT
  //      prize.name,
  //      prize.name_sub AS code,
  //      (CASE
  // 		WHEN allocation.status = 1
  // 		THEN DATE(allocation.used_date)
  // 		ELSE (CASE
  // 		    	WHEN DATE(allocation.allocation_date) <= current_date
  // 			    THEN current_date
  // 			    ELSE DATE(allocation.allocation_date)
  // 			 END)
  // 		END) date,
  //      count(1) quantity,
  //      SUM(case when allocation.status = 1 then 1 ELSE 0 END) used
  // FROM
  //      prize,
  //      allocation
  // WHERE
  //      prize.id = allocation."prizeId"
  // GROUP BY
  //      prize.id,
  //      (CASE
  // 		WHEN allocation.status = 1
  // 		THEN DATE(allocation.used_date)
  // 		ELSE (CASE
  // 		    	WHEN DATE(allocation.allocation_date) <= current_date
  // 			    THEN current_date
  // 			    ELSE DATE(allocation.allocation_date)
  // 			 END)
  // 		END)
  // ORDER BY date`, [])

  // ipul's courtesy
  //     return exeQuery(`SELECT
  // 	(CASE WHEN DATE(allocation_date) <= CURRENT_DATE AND allocation.status != 1 THEN
  // 	CURRENT_DATE
  // 	WHEN DATE(allocation_date)<= CURRENT_DATE AND allocation.status = 1 THEN
  // 	DATE(allocation.used_date) ELSE DATE(allocation_date) END) "date",
  // 	prize.name AS "name",
  // 	prize.name_sub AS "code",
  // 	(CASE WHEN MAX(DATE(allocation_date)) <= CURRENT_DATE THEN
  // 	SUM(CASE WHEN allocation.status = 1 THEN 1 ELSE 0 END) ELSE SUM(CASE WHEN allocation.status != 1 THEN 1 ELSE 0 END) END) AS quantity,
  // 	SUM(
  // 		CASE WHEN allocation.status = 1 THEN
  // 			1
  // 		ELSE
  // 			0
  // 		END) AS used
  // FROM
  // 	allocation
  // 	JOIN prize ON allocation."prizeId" = prize.id
  // 	LEFT JOIN regions ON allocation."regionId" = regions.id
  // GROUP BY
  // 	prize.id,
  // 	"date" ORDER BY "date"`, [])
};

export const summaryPrizeV2 = () => {
  return exeQuery(
    `SELECT id as key, name AS label, name AS value, quantity AS amount, 'prize' AS name FROM prize`,
    []
  );
};

export const summaryPrizePulsa = () => {
  return exeQuery(
    `SELECT 
    DATE(entries.rcvd_time) "date", 
    SUM(CASE WHEN winner.status = 2 THEN 1 ELSE 0 END) "success", 
    SUM(CASE WHEN winner.status = 3 THEN 1 ELSE 0 END) "failed" 
    FROM winner 
    JOIN entries ON winner."entriesId" = entries.id 
    WHERE winner."prizeId" = 1 AND (winner.status = 2 OR winner.status = 3) 
    GROUP BY "date" ORDER BY "date" ASC`,
    []
  );
};
export const generalParameter = () => {
  return exeQuery(
    `SELECT description, value AS param FROM general_parameter`,
    []
  );
};

export const generalParameterByVal = (val: string) => {
  return exeQuery(
    `SELECT description, value AS param FROM general_parameter WHERE name = $1`,
    [val]
  );
};

const keyWherePrz = (params: IPrzParams) => {
  const { key } = params;
  if (!key) {
    return "";
  } else {
    return ` AND (A.name LIKE '%${key}%' OR A.hp LIKE '%${key}%' OR A.city LIKE '%${key}%' OR A.sender LIKE '%${key}%' OR A.id_number LIKE '%${key}%' OR A.coupon LIKE '%${key}%')`;
  }
};

const orderByPrz = (params: IPrzParams) => {
  const { direction, column } = params;
  const directionType =
    direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
  if (!column || !directionType) {
    return " ORDER BY A.rcvd_time DESC";
  } else {
    return ` ORDER BY ${column} ${directionType}`;
  }
};

export const sumWinPulsa = (markup: number, type: number) => {
  return exeQuery(
    `
    SELECT 
    prize.name AS "prizeName",
    COALESCE(SUM(CASE WHEN prize.id IS NOT NULL THEN CAST(prize.amount AS INTEGER)+${
      markup ?? 0
    } ELSE 0 END),0) AS "claimedAmount",
    COALESCE(SUM(CASE WHEN prize.id IS NOT NULL THEN 1 ELSE 0 END),0) AS "prizeRedeemed"
    FROM winner
    JOIN entries AS A ON winner."entriesId" = A.id
    JOIN prize ON winner."prizeId" = prize.id
    JOIN transaction ON winner.id = transaction."winnerId"
    JOIN voucher ON voucher.id = winner."voucherId"
    WHERE 1 = 1
    AND voucher.type = ${type === 2 ? "2 OR voucher.type = 3" : type}
    AND transaction.status = 2
GROUP BY prize.id`,
    []
  );
};

export const countAllListPrize = (params: IPrzParams) => {
  const syntax = `SELECT COUNT(*) as counts
    FROM winner
    JOIN entries AS A ON winner."entriesId" = A.id
    JOIN prize ON winner."prizeId" = prize.id
    JOIN transaction ON winner.id = transaction."winnerId"
    WHERE 1 = 1
    AND (prize."topupType" = 1 OR prize."topupType" = 2)
    AND transaction.status = 2
    ${dateWhere(params.startDate, params.endDate)}
    ${keyWherePrz(params)}`;
  return exeQuery(syntax, []);
};

export const listPrizesPulsa = (params: IPrzParams) => {
  const scriptQuery = `SELECT
    winner.id,
    TO_CHAR(DATE(A.rcvd_time),'dd Mon yyyy') AS rcvd_time,
    A.name fullname,
    A.sender,
    A.city,
    prize.name prize,
    transaction.status,
    transaction.status AS "statusPrizeDeposit"
    FROM winner
    JOIN entries AS A ON winner."entriesId" = A.id
    JOIN prize ON winner."prizeId" = prize.id
    JOIN transaction ON winner.id = transaction."winnerId"
    WHERE 1 = 1
    AND (prize."topupType" = 1 OR prize."topupType" = 2)
    AND transaction.status = 2
    ${dateWhere(params.startDate, params.endDate)}
    ${keyWherePrz(params)}
    ${orderByPrz(params)}
    ${params.limit}`;
  return exeQuery(scriptQuery, []);
};

export const specialGroupBy = (condition: string) => {
  if (condition == "daily") {
    return `GROUP BY DATE(rcvd_time) ORDER BY date(rcvd_time) ASC`;
  } else if (condition == "weekly") {
    return `GROUP BY date_trunc('week', rcvd_time::timestamp) ORDER BY date_trunc('week', rcvd_time::timestamp) ASC`;
  } else if (condition == "monthly") {
    return `GROUP BY date_trunc('month', rcvd_time::timestamp) ORDER BY date_trunc('month', rcvd_time::timestamp) ASC`;
  } else {
    return "";
  }
};

export const specialGroupByProfile = (condition: string) => {
  if (condition == "daily") {
    return `GROUP BY DATE(created_at) ORDER BY DATE(created_at)`;
  } else if (condition == "weekly") {
    return `GROUP BY date_trunc('week', created_at::timestamp) ORDER BY date_trunc('week', created_at::timestamp) ASC`;
  } else if (condition == "monthly") {
    return `GROUP BY date_trunc('month', created_at::timestamp) ORDER BY date_trunc('month', created_at::timestamp) ASC`;
  } else {
    return "";
  }
};

export const specialLabelingSrc = (condition: string) => {
  if (condition == "daily") {
    return `TO_CHAR(DATE(label),'YYYY-MM-DD') AS label`;
  } else if (condition == "weekly") {
    return `TO_CHAR(DATE(label),'YYYY-MM-DD') AS label`;
  } else if (condition == "monthly") {
    return `label AS label `;
  } else {
    return "";
  }
};

export const specialLabelingProfileSrc = (condition: string) => {
  if (condition == "daily") {
    return `TO_CHAR(DATE(label),'YYYY-MM-DD') AS label`;
  } else if (condition == "weekly") {
    return `TO_CHAR(DATE(label),'YYYY-MM-DD') AS label`;
  } else if (condition == "monthly") {
    return `label AS label `;
  } else {
    return "";
  }
};

export const specialLabeling = (condition: string) => {
  if (condition == "daily") {
    return `TO_CHAR(DATE(rcvd_time),'YYYY-MM-DD') AS "DATE"`;
  } else if (condition == "weekly") {
    return `TO_CHAR(date_trunc('week', rcvd_time::timestamp)::DATE, 'YYYY-MM-DD') AS "DATE"`;
  } else if (condition == "monthly") {
    return `TO_CHAR(date_trunc('month', rcvd_time::timestamp),'YYYY-MM') AS "DATE"`;
  } else {
    return "";
  }
};

export const specialLabelingProfile = (condition: string) => {
  if (condition == "daily") {
    return `TO_CHAR(DATE(created_at),'YYYY-MM-DD') AS label`;
  } else if (condition == "weekly") {
    return `TO_CHAR(date_trunc('week', created_at::timestamp)::DATE, 'YYYY-MM-DD') AS "DATE"`;
  } else if (condition == "monthly") {
    return `TO_CHAR(date_trunc('month', created_at::timestamp),'YYYY-MM') AS "DATE"`;
  } else {
    return "";
  }
};

export const unionSummary = (
  table: string,
  isTrue: boolean,
  condition: string
) => {
  if (isTrue) {
    if (table == "entries") {
      return `UNION (SELECT
                                SUM(CASE WHEN is_valid = 1 AND "mediaId" = 3 THEN 1 ELSE 0 END) AS "validWa1",
                                SUM(CASE WHEN (is_valid = 0 AND "invalidReasonId" = 99) AND "mediaId" = 3 THEN 1 ELSE 0 END) AS "unluckyWa1",
                                SUM(CASE WHEN is_valid = 2 AND "mediaId" = 3 THEN 1 ELSE 0 END) AS "pendingWa1",
                                SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND "mediaId" = 3 THEN 1 ELSE 0 END) AS "invalidWa1",
                                SUM(CASE WHEN is_valid = 1 AND "mediaId" = 5 THEN 1 ELSE 0 END) AS "validApp",
                                SUM(CASE WHEN (is_valid = 0 AND "invalidReasonId" = 99) AND "mediaId" = 5 THEN 1 ELSE 0 END) AS "unluckyApp",
                                SUM(CASE WHEN is_valid = 2 AND "mediaId" = 5 THEN 1 ELSE 0 END) AS "pendingApp",
                                SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND "mediaId" = 5 THEN 1 ELSE 0 END) AS "invalidApp",
                                SUM(CASE WHEN is_valid = 1 AND "mediaId" = 99 THEN 1 ELSE 0 END ) AS "validMicrosite",
                                SUM(CASE WHEN (is_valid = 0 AND "invalidReasonId" = 99) AND "mediaId" = 99 THEN 1 ELSE 0 END) AS "unluckyMicrosite",
                                SUM(CASE WHEN is_valid = 2 AND "mediaId" = 99 THEN 1 ELSE 0 END ) AS "pendingMicrosite",
                                SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND "mediaId" = 99 THEN 1 ELSE 0 END ) AS "invalidMicrosite",
                                SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END ) AS valid,
                                SUM(CASE WHEN (is_valid = 0 AND "invalidReasonId" = 99) THEN 1 ELSE 0 END ) AS unlucky,
                                SUM(CASE WHEN is_valid = 2 THEN 1 ELSE 0 END ) AS pending,
                                SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 THEN 1 ELSE 0 END ) AS invalid,
                                SUM(CASE WHEN entries.id IS NOT NULL THEN 1 ELSE 0 END ) AS "all",
                                ${specialLabeling(condition)}
                               FROM entries WHERE DATE(rcvd_time)=CURRENT_DATE
                               ${specialGroupBy(condition)}
                              ) ORDER BY label ASC`;
    } else if ((table = "profile")) {
      return `UNION (SELECT
            SUM(CASE WHEN users."mediaId" = 3 THEN 1 ELSE 0 END) AS "WA", 
            SUM(CASE WHEN users."mediaId" = 5 THEN 1 ELSE 0 END) AS "APPS", 
            COUNT(1) AS counts,
            ${specialLabelingProfile(condition)}
            FROM users 
            WHERE DATE(created_at) = CURRENT_DATE ${specialGroupByProfile(
              condition
            )}) ORDER BY label ASC`;
    } else {
      return "";
    }
  } else {
    return "";
  }
};

export const unionTotal = (table: string, isTrue: boolean) => {
  if (isTrue) {
    if (table == "entries") {
      return `UNION (SELECT "entries", "entries", "mediaId",count(1) FROM entries WHERE DATE(rcvd_time)=CURRENT_DATE GROUP BY "mediaId")`;
    } else if ((table = "profile")) {
      return `UNION (SELECT "users","users","",COUNT(1) FROM users WHERE DATE(created_at) = CURRENT_DATE)`;
    } else {
      return "";
    }
  } else {
    return "";
  }
};

export const specialSummaryEntries = (param: specialType, isTrue: boolean) => {
  if (param.condition == "hourly") {
    // if (isTrue) {
    return exeQuery(
      `SELECT
            SUM(CASE WHEN is_valid = 1 AND "mediaId" = 3 THEN 1 ELSE 0 END) AS valid_wa_1,
            SUM(CASE WHEN (is_valid = 0 AND "invalidReasonId" = 99) AND "mediaId" = 3 THEN 1 ELSE 0 END) AS unlucky_wa_1,
            SUM(CASE WHEN is_valid = 2 AND "mediaId" = 3 THEN 1 ELSE 0 END) AS pending_wa_1,
            SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND "mediaId" = 3 THEN 1 ELSE 0 END) AS invalid_wa_1,
            SUM(CASE WHEN is_valid = 1 AND "mediaId" = 5 THEN 1 ELSE 0 END) AS valid_app,
            SUM(CASE WHEN (is_valid = 0 AND "invalidReasonId" = 99) AND "mediaId" = 5 THEN 1 ELSE 0 END) AS unlucky_app,
            SUM(CASE WHEN is_valid = 2 AND "mediaId" = 5 THEN 1 ELSE 0 END) AS pending_app,
            SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND "mediaId" = 5 THEN 1 ELSE 0 END) AS invalid_app,
            SUM(CASE WHEN is_valid = 1 AND "mediaId" = 99 THEN 1 ELSE 0 END ) AS valid_microsite,
            SUM(CASE WHEN (is_valid = 0 AND "invalidReasonId" = 99) AND "mediaId" = 99 THEN 1 ELSE 0 END) AS unlucky_microsite,
            SUM(CASE WHEN is_valid = 2 AND "mediaId" = 99 THEN 1 ELSE 0 END) AS pending_microsite,
            SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 AND "mediaId" = 99 THEN 1 ELSE 0 END ) AS invalid_microsite,
            SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END ) AS valid,
            SUM(CASE WHEN (is_valid = 0 AND "invalidReasonId" = 99) THEN 1 ELSE 0 END ) AS unlucky,
            SUM(CASE WHEN is_valid = 2 THEN 1 ELSE 0 END ) AS pending,
            SUM(CASE WHEN is_valid = 0 AND "invalidReasonId" != 99 THEN 1 ELSE 0 END ) AS invalid,
            SUM(CASE WHEN entries.id IS NOT NULL THEN 1 ELSE 0 END ) AS total,
            TO_CHAR(date_trunc('hour', entries.rcvd_time::TIMESTAMP), 'HH24') AS label
           FROM entries WHERE DATE(rcvd_time)= '${param.endDate}'
           GROUP BY DATE_TRUNC('hour', entries.rcvd_time::timestamp)`,
      []
    );
    // } else {
    //         return exeQuery(`SELECT
    //                     (valid_wa) valid_wa_1,
    //                     (unluck_wa) unlucky_wa_1,
    //                     (pending_wa) pending_wa_1,
    //                     (invalid_wa) invalid_wa_1,
    //                     (valid_app) valid_app,
    //                     (unluck_app) unlucky_app,
    //                     (pending_app) pending_app,
    //                     (invalid_app) invalid_app,
    //                     (valid_mcr) valid_microsite,
    //                     (unluck_mcr) unlucky_microsite,
    //                     (pending_mcr) pending_microsite,
    //                     (invalid_mcr) invalid_microsite,
    //                     (invalid) invalid,
    //                     (pending) pending,
    //                     (unluck) unlucky,
    //                     valid,
    //                     total,
    //                     ${specialLabeling(param.condition)}
    //                   FROM summary_entries_${param.condition}
    //                   WHERE DATE(label) BETWEEN '${param.startDate}' AND '${param.endDate}'`, [])
    // }
  } else {
    return exeQuery(
      `SELECT
                        valid_wa AS valid_wa_1,
                        unluck_wa AS unlucky_wa_1,
                        pending_wa AS pending_wa_1,
                        invalid_wa AS invalid_wa_1,
                        valid_app,
                        unluck_app AS unlucky_app,
                        pending_app,
                        invalid_app,
                        valid_mcr AS valid_microsite,
                        unluck_mcr AS unlucky_microsite,
                        pending_mcr AS pending_microsite,
                        invalid_mcr AS invalid_microsite,
                        valid,
                        unluck AS unlucky,
                        pending,
                        invalid,
                        (valid + unluck + pending + invalid) AS total,
                        ${specialLabelingSrc(
                          param.condition
                        )}                    
                    FROM summary_entries_${param.condition} 
                    WHERE label BETWEEN '${param.startDate}' AND '${
        param.endDate
      }' 
                    ${unionSummary("entries", isTrue, param.condition)}`,
      []
    );
  }
};

export const specialSummaryTotal = (type: string, isTrue: boolean) => {
  return exeQuery(
    `SELECT name,type,media,counting FROM summary_total WHERE type = $1 ${unionTotal(
      type,
      isTrue
    )}`,
    [type]
  );
};

export const specialSummaryProfile = (
  param: specialType,
  isTrue: boolean,
  media: string[]
) => {
  // let start = dayjs(param.startDate, 'YYYY-WW')
  // let end = dayjs(param.endDate, 'YYYY-WW')

  // let starter = start.startOf('isoWeek').format('YYYY-MM-DD')
  // let ender = end.endOf('isoWeek').format('YYYY-MM-DD')
  if (param.condition == "hourly") {
    // if (isTrue) {
    return exeQuery(
      `SELECT
            TO_CHAR(date_trunc('hour', users.created_at::TIMESTAMP), 'HH24') AS label,
      ${media},
      count(1) AS "all"
        FROM (SELECT users.created_at, users."mediaId" FROM users LEFT JOIN entries AS A ON users.id = A."userId" LEFT JOIN media ON A."mediaId" = media.id WHERE 0 = 0
        AND DATE(users.created_at) >= '${param.startDate}' AND DATE(users.created_at) <= '${param.endDate}'
  GROUP BY users.id) users
  GROUP BY DATE_TRUNC('hour', users.created_at::timestamp)`,
      []
    );
    // } else {
    //         return exeQuery(`SELECT
    //                     (valid_wa) valid_wa_1,
    //                     (unluck_wa) unlucky_wa_1,
    //                     (pending_wa) pending_wa_1,
    //                     (invalid_wa) invalid_wa_1,
    //                     (valid_app) valid_app,
    //                     (unluck_app) unlucky_app,
    //                     (pending_app) pending_app,
    //                     (invalid_app) invalid_app,
    //                     (valid_mcr) valid_microsite,
    //                     (unluck_mcr) unlucky_microsite,
    //                     (pending_mcr) pending_microsite,
    //                     (invalid_mcr) invalid_microsite,
    //                     (invalid) invalid,
    //                     (pending) pending,
    //                     (unluck) unlucky,
    //                     valid,
    //                     total,
    //                     TO_CHAR(DATE(label),'YYYY-MM-DD') AS label
    //                   FROM summary_entries_${param.condition}
    //                   WHERE DATE(label) BETWEEN '${param.startDate}' AND '${param.endDate}'`, [])
    // }
  } else {
    return exeQuery(
      `SELECT
            valid_wa AS "WA", valid_app AS "APPS", valid AS all,  
            ${specialLabelingProfileSrc(param.condition)}                  
            FROM summary_profile_${param.condition}
            WHERE label BETWEEN '${param.startDate}' AND '${param.endDate}'
        ${unionSummary("profile", isTrue, param.condition)}`,
      []
    );
  }
};

export const getSurveyQuestions = () => {
  return exeQuery(
    `SELECT id AS key, id AS value, 'surveyId' AS name, "no" || ' ' || description AS label FROM survey_question ORDER BY VALUE ASC`,
    []
  );
};

export const getSurveySubmitted = () => {
  return exeQuery(`SELECT COUNT(1) AS counts FROM survey_answer`, []);
};

export const getSurveyPerQ = (id: string) => {
  return exeQuery(
    `SELECT MAX(A.description) AS categories, SUM(CASE WHEN B."surveyQuestionDetId" IS NULL THEN 0 ELSE 1 END) AS series FROM survey_question_det A
    LEFT JOIN survey_answer_det B ON B."surveyQuestionDetId" = A.id WHERE A."surveyQuestionId" = $1 GROUP BY A.id, B."surveyQuestionDetId" ORDER BY A.sort ASC`,
    [id]
  );
};

export const exportSurveyData = () => {
  return exeQuery(
    `SELECT * FROM crosstab('SELECT A.username, D."surveyQuestionId" AS "question", D.description AS "answerDesc" FROM user_mobile A 
    JOIN survey_answer B ON A.id = B."userMobileId" 
    JOIN survey_answer_det C ON B.id = C."surveyAnswerId" 
    JOIN survey_question_det D ON C."surveyQuestionDetId" = D.id
    GROUP BY A.id, D.id') AS ct(username varchar(100), question1 TEXT, question2 TEXT, question3 TEXT, question4 TEXT, question5 TEXT, question6 TEXT, question7 TEXT, question8 TEXT, question9 TEXT,  question10 TEXT,  question11 TEXT)`,
    []
  );
};
