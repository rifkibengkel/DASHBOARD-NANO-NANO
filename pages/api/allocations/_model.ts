import { exeQuery } from "@/lib/db";
// import dayjs from 'dayjs'

interface IParams {
  column: string;
  direction: string;
  limit: number | string;
  condition: string;
  threshold: string;
}

const orderBy = (direction: string, column: string) => {
  const directionType =
    direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
  if (column == "" || directionType == "") {
    // return " ORDER BY CASE WHEN DATEDIFF(`allocation_date`, CURDATE()) < 0 THEN 1 ELSE 0 END, DATEDIFF(`allocation_date`, CURDATE())";
    return ` ORDER BY "allocationDate"`;
  } else {
    return ` ORDER BY "${column}"  ${directionType}`;
  }
};

// const typeWhere = (type: string) => {
//     console.log(type)
//     if (type == '0') {
//         return ""
//     } else {
//         return ` WHERE allocations.prize_id = ${type}`
//     }
// };

//Original;
// const groupByCondition = (type: string) => {
//     switch (type) {
//         case '1':
//             // daily
//             return "allocations.date"
//             break;
//         case '2':
//             // weekly
//             return "WEEK(allocations.date)"
//             break;
//         case '3':
//             // monthly
//             return "MONTH(allocations.date)"
//             break;
//         default:
//             return ""
//             break;
//     }
// }

const groupByCondition = (type: string) => {
  switch (type) {
    case "1":
      // daily
      return "allocation.allocation_date";
      break;
    case "2":
      // weekly
      return "WEEK(allocation.allocation_date)";
      break;
    default:
      return "";
      break;
  }
};

const whereCondition = (type: number, params: string, year: string) => {
  switch (type) {
    case 1:
      // daily
      return ` AND allocation.allocation_date = "${params}"`;
      break;
    case 2:
      // weekly
      return ` AND WEEK(allocation.allocation_date) = ${params} AND YEAR(allocation.allocation_date) = ${year}`;
      break;
    case 3:
      // monthly
      return ` AND MONTH(allocation.allocation_date) = ${params} AND YEAR(allocation.allocation_date) = ${year}`;
      break;
    default:
      return "";
      break;
  }
};

const promoWhere = (promo: any) => {
  if (!promo) {
    return "";
  } else {
    return ` AND (prizes.typePromo = ${promo})`;
  }
};

//Original;
// export const countAllocations = (params: IParams) => {
//     // return exeQuery(`SELECT COUNT(*) OVER () AS counts FROM allocations ${typeWhere(params.type)} GROUP BY ${groupByCondition(params.condition)},region_id`, [])
//     return exeQuery(`SELECT COUNT(*) AS counts FROM allocations GROUP BY ${groupByCondition(params.condition)},region_id`, [])
// }

// export const listAllocations = (params: IParams) => {
//     const scriptQuery = `SELECT region.name AS regionName,MONTH(allocations.date) "monthInt",YEAR(allocations.date) 'year',
//         WEEK(allocations.date) "weekInt",
//         CONCAT(DATE_FORMAT(DATEADD(allocations.date, INTERVAL(1- DAYOFWEEK(allocations.date)) DAY),'%e %b %Y'), ' - ', DATE_FORMAT(DATEADD(allocations.date, INTERVAL(7- DAYOFWEEK(allocations.date)) DAY),'%e %b %Y')) AS weekly,
//         DATE_FORMAT(allocations.date,"%M") AS 'month',region_id AS region,DATE_FORMAT(allocations.date,"%Y-%m-%d") AS DATE,
//         SUM(CASE WHEN is_used = 0 THEN 1 ELSE 0 END) AS unused,SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) AS used,COUNT(*) AS total,
//         ROUND((SUM(case when is_used=1 then 1 ELSE 0 END)/SUM(case when is_used=1 OR is_used=0 then 1 ELSE 0 END))*100) AS claimPercentage
//         FROM allocations LEFT JOIN region ON allocations.region_id = region.id
//         GROUP BY ${groupByCondition(params.condition)} ${orderBy(params.direction, params.column)} ${params.limit}`
//     return exeQuery(scriptQuery, [])
// }

// Another Version;
export const countAllocations = (params: IParams) => {
  // return exeQuery(`SELECT COUNT(*) OVER () AS counts FROM allocations ${typeWhere(params.type)} GROUP BY ${groupByCondition(params.condition)},region_id`, [])
  return exeQuery(
    `SELECT COUNT(*) OVER () as counts
    FROM allocation
	 LEFT JOIN prize ON allocation."prizeId" = prize.id 
     LEFT JOIN regions ON allocation."regionId" = regions.id
        WHERE 0 = 0 
    GROUP BY regions.name, allocation.allocation_date, prize.id`,
    []
  );
};

// export const listAllocations = (params: IParams) => {
//     const scriptQuery = `SELECT region.name AS regionName,MONTH(allocations.date) "monthInt",YEAR(allocations.date) 'year',
//         WEEK(allocations.date) "weekInt",
//         CONCAT(DATE_FORMAT(DATEADD(allocations.date, INTERVAL(1- DAYOFWEEK(allocations.date)) DAY),'%e %b %Y'), ' - ', DATE_FORMAT(DATEADD(allocations.date, INTERVAL(7- DAYOFWEEK(allocations.date)) DAY),'%e %b %Y')) AS weekly,
//         DATE_FORMAT(allocations.date,"%M") AS 'month',region_id AS region,DATE_FORMAT(allocations.date,"%Y-%m-%d") AS DATE,
//         SUM(CASE WHEN is_used = 0 THEN 1 ELSE 0 END) AS unused,SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) AS used,COUNT(*) AS total,
//         ROUND((SUM(case when is_used=1 then 1 ELSE 0 END)/SUM(case when is_used=1 OR is_used=0 then 1 ELSE 0 END))*100) AS claimPercentage
//         FROM allocations LEFT JOIN region ON allocations.region_id = region.id
//         GROUP BY ${groupByCondition(params.condition)} ${orderBy(params.direction, params.column)} ${params.limit}`
//     return exeQuery(scriptQuery, [])
// }

export const listAllocations = (params: IParams) => {
  // const scriptQuery = `SELECT allocation.allocation_date, prize.name AS "prizeName", regions.name as city,
  // SUM(CASE WHEN allocation.status = 0 THEN 1 ELSE 0 END) AS unused,SUM(CASE WHEN allocation.status = 1 THEN 1 ELSE 0 END) AS used,COUNT(*) AS total,
  // ROUND((SUM(case when allocation.status = 1 then 1 ELSE 0 END)/SUM(case when allocation.status = 1 OR allocation.status = 0 then 1 ELSE 0 END))*100) AS "claimPercentage"
  // FROM allocation
  //  LEFT JOIN prize ON allocation."prizeId" = prize.id
  //  LEFT JOIN regions ON allocation."regionId" = regions.id
  //     WHERE 0 = 0
  // GROUP BY regions.name, allocation.allocation_date, prize.id${orderBy(params.direction, params.column)} ${params.limit}`

  // ipul's courtesy
  const secQuery = `SELECT
	(CASE WHEN DATE(allocation_date) <= CURRENT_DATE AND allocation.status != 1 THEN 
	CURRENT_DATE 
	WHEN DATE(allocation_date)<= CURRENT_DATE AND allocation.status = 1 THEN 
	DATE(allocation.used_date) ELSE DATE(allocation_date) END) "allocationDate", 
	prize.name AS "prizeName",
	regions.name AS city,
	SUM(
		CASE WHEN allocation.status != 1 THEN
			1
		ELSE
			0
		END) unused,
	SUM(
		CASE WHEN allocation.status = 1 THEN
			1
		ELSE
			0
		END) used,
	SUM(CASE WHEN allocation.status IS NOT NULL THEN 1 ELSE 0 END) AS total,
	ROUND(SUM(
		CASE WHEN allocation.status = 1 THEN
			1
		ELSE
			0
		END)/SUM(CASE WHEN allocation.status IS NOT NULL THEN 1 ELSE 0 END))*100 AS "claimPercentage"
FROM
	allocation
	JOIN prize ON allocation. "prizeId" = prize.id
	LEFT JOIN regions ON allocation. "regionId" = regions.id
GROUP BY
	prize.id,
	"allocationDate",
	regions.id  ${orderBy(params.direction, params.column)} ${params.limit}`;
  return exeQuery(secQuery, []);
};

export const detaileAllocation = (
  params: string,
  idRegion: string,
  type: number,
  year: string
) => {
  const detail = `SELECT prizes.id, name, type, code, SUM(CASE WHEN allocations.is_used = 1 THEN 1 ELSE 0 END) AS used,
    SUM(CASE WHEN allocations.is_used = 0 THEN 1 ELSE 0 END) AS unused,
    COUNT(*) AS total,ROUND((SUM(case when is_used=1 then 1 ELSE 0 END)/SUM(case when is_used=1 OR is_used=0 then 1 ELSE 0 END))*100) AS claimPercentage 
    FROM allocations JOIN prizes ON (allocations.prize_id = prizes.id) WHERE region_id = ?
    ${whereCondition(type, params, year)} GROUP BY prizes.id`;
  return exeQuery(detail, [idRegion]);
};

export const addNewAllocation = (
  date: string,
  regionId: string,
  prizeId: string,
  promoType: string
) => {
  const add = `INSERT INTO allocations (date, region_id, prize_id, "typePromo", is_used) VALUES (?, ?, ?, ?, 0)`;
  return exeQuery(add, [date, regionId, prizeId, promoType]);
};

export const addNewAllocation2 = (
  date: string,
  prizeId: string,
  userId: number
) => {
  const add = `INSERT INTO allocation (allocation_date, "prizeId", status, "createdById") VALUES ($1, $2, 1, $3)`;
  return exeQuery(add, [date, prizeId, userId]);
};

export const checkCoupon = (coupon: string) => {
  return exeQuery(
    `SELECT id, coupon,(CASE "entriesId" WHEN NOT null THEN 'Sudah Digunakan' ELSE 'Belum Digunakan' END) status FROM coupon WHERE coupon = $1`,
    [coupon]
  );
};

export const addCouponByStore = (coupon: string, storeId: string) => {
  const add = `INSERT INTO coupon (STATUS, coupon, "storeId") VALUES(0,$1,$2)`;
  return exeQuery(add, [coupon, storeId]);
};

export const updateAllocation2 = (
  prizeId: string,
  quantity: string,
  userId: number
) => {
  const update = `UPDATE allocations SET "prizeId" = $1
     AND status = 0 AND updatedById = $2 LIMIT $3`;
  return exeQuery(update, [prizeId, userId, quantity]);
};

export const updateAllocation = (prizeId: string, quantity: string) => {
  const update = `UPDATE allocation SET prize_id = $1
     AND is_used = 0 LIMIT $2`;
  return exeQuery(update, [prizeId, quantity]);
};

export const regionByDate = (date: string, is_used: string) => {
  const region = `SELECT region_id,region.name AS "regionName" FROM allocations JOIN region ON allocations.region_id = region.id
    WHERE date $1 AND is_used = $2 GROUP BY region_id`;
  return exeQuery(region, [date, is_used]);
};

export const prizeByDateRegion = (date: string) => {
  const prize = `SELECT prizes.name AS "prizeName", prizes.id FROM allocations JOIN prizes ON allocations.prize_id = prizes.id 
    WHERE date ${date} GROUP BY prizes.id`;
  return exeQuery(prize, []);
};

export const countAllocation = (date: string, prizeId: string) => {
  const count = `SELECT COUNT(*) AS counts FROM allocations WHERE date ${date} AND prize_id = ? AND is_used = 0`;
  return exeQuery(count, [prizeId]);
};

export const insertAllocation = (
  date: string,
  regionId: string,
  prizeId: string
) => {
  const insert = `INSERT INTO allocations(region_id,prize_id,date) VALUES($1,$2,$3)`;
  return exeQuery(insert, [regionId, prizeId, date]);
};

export const getPrizeByName = (name: string) => {
  const getPrize = `SELECT * FROM prizes WHERE UPPER(name) LIKE $1`;
  return exeQuery(getPrize, ["%" + name + "%"]);
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
