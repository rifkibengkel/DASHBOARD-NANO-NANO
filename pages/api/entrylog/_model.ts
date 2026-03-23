import {exeQuery} from "../../../lib/db";
import {formModal} from "../../../interfaces/user.interface";
import { multiPromo } from "../dashboard/_model";

interface IParams {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    media: string
    startDate: string
    endDate: string
    isValid: string | number
    isValidAdmin: string | number
    isApprovedAdmin: string | number
    type?: string
    storeId?: string | number
}

interface IParams2 {
    mode?: string;
    storeId: string | number
    startDate: string
    endDate: string
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
}
// origin
// const validWhere = (isValid: any) => {
//     console.log(isValid)
//     if (!isValid) {
//         return "";
//     } else if(isValid == '1') {
//         return ` AND (A.is_valid = 1 OR (A.is_valid = 0 AND A."invalidReasonId" = 99))`;
//     } else {
//         return ` AND (A.is_valid = ${isValid} )`;
//     }
// };

const validWhere = (isValid: any) => {
    if (!isValid) {
        return "";
    } else if(isValid == '1') {
        return ` AND (A.is_valid = 1 OR (A.is_valid = 0 AND A."invalidReasonId" = 99))`;
    } else {
        return ` AND (A.is_valid = ${isValid} AND A."invalidReasonId" != 99)`;
    }
};

const validAdminWhere = (isValid: any) => {
    if (!isValid) {
        return "";
    } else if (isValid == '3') {
        return ` AND (A.is_valid_admin = 0)`;
    } else {
        return ` AND (A.is_valid_admin = ${isValid})`;
 }
};

const verifWhere = (isApproved: any) => {
    if (!isApproved) {
        return "";
    } else {
        return ` AND (A.is_approved = ${isApproved})`;
    }
};

const apprvAdminWhere = (isApprovedAdmin: any) => {
    if (!isApprovedAdmin) {
        return "";
    } else if (isApprovedAdmin == '3') {
        return ` AND (A.is_approved_admin = 0`;
    } else {
        return ` AND (A.is_approved_admin = ${isApprovedAdmin})`;
 }
};

const storeWhere = (storeId: any) => {
    if (!storeId) {
        return "";
    } else {
        return ` AND (A."storeId" = ${storeId})`;
    }
};

const orderBy = (params: IParams) => {
    const {direction, column} = params
    const directionType =
        direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
    if (!column || !directionType) {
        return " ORDER BY A.rcvd_time DESC";
    } else {
        return ` ORDER BY "${column}" ${directionType}`;
    }
};

const orderBy2 = (params: IParams2) => {
    const {direction, column} = params
    const directionType =
        direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
    if (!column || !directionType) {
        return " ORDER BY A.rcvd_time DESC";
    } else {
        return ` ORDER BY "${column}" ${directionType}`;
    }
};

const keyWhere = (params: IParams) => {
    const {key} = params
    if (!key) {
        return "";
    } else {
        return ` AND (UPPER(A.name) LIKE '%${key}%' OR UPPER(A.sender) LIKE '%${key}%' OR UPPER(A.coupon) LIKE '%${key}%' OR UPPER(A.city) LIKE '%${key}%')`;
    }
};

const keyWhere2 = (params: IParams2) => {
    const {key} = params
    if (!key) {
        return "";
    } else {
        return ` AND (UPPER(A.name) LIKE '%${key}%' OR A.hp LIKE '%${key}%' OR UPPER(A.id_number) LIKE '%${key}%' OR UPPER(A.city) LIKE '%${key}%' OR A.sender LIKE '%${key}%')`;
    }
};

const dateWhere = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
        return "";
    } else {
        return ` AND DATE(A.rcvd_time) BETWEEN '${startDate}' AND '${endDate}'`;
    }
};

const mediaWhere = (media: string) => {
    if (!media) {
        return ""
    } else {
        return ` AND (A.media = ${media})`
    }
}

export const list2 = (params: IParams) => {
    const syntax = `SELECT A.id, 
    A.rcvd_time, 
    A.name, 
    A.sender, 
    CASE WHEN A.is_valid = 1 THEN 1 WHEN A.is_valid = 0 AND A."invalidReasonId" = 99 THEN 1 ELSE 0 END AS is_valid,
    CASE WHEN A.is_valid = 1 THEN '' WHEN A.is_valid = 0 AND A."invalidReasonId" = 99 THEN '' ELSE B.name END AS invalid_reason
    FROM entries AS A
    LEFT JOIN invalid_reason AS B ON A."invalidReasonId" = B.id
    WHERE 1 = 1 
    ${mediaWhere(params.media)}
    ${dateWhere(params.startDate, params.endDate)}
    ${validWhere(params.isValid)}${apprvAdminWhere(params.isApprovedAdmin)}
    ${keyWhere(params)}
    ${orderBy(params)}
    ${params.limit}`;

    return exeQuery(syntax, [])
}

export const xport2 = (params: IParams) => {
    const syntax = `SELECT C.name AS media, A.id, A."userId", A.message, TO_CHAR(A.rcvd_time,'YYYY/MM/DD HH:mm:ss') AS rcvd_time, A.name, A.sender, A.hp, A.id_number AS no_ktp, A.coupon AS unique_code,
    A.city AS regency,
    CASE WHEN A.is_valid = 1 THEN 1 WHEN A.is_valid = 0 AND A."invalidReasonId" = 99 THEN 1 ELSE 0 END AS "isValid",
    CASE WHEN A.is_valid = 1 THEN '-' WHEN A.is_valid = 0 AND A."invalidReasonId" = 99 THEN '-' ELSE D.name END AS invalid_reason
     FROM entries AS A
     JOIN media AS C ON A."mediaId" = C.id
     LEFT JOIN invalid_reason AS D ON A."invalidReasonId" = D.id
     LEFT JOIN winner E ON A.id = E."entriesId"
     LEFT JOIN prize F ON E."prizeId" = F.id
     LEFT JOIN store H ON H.id = A."storeId"
    WHERE 1 = 1
    ${mediaWhere(params.media)}
    ${dateWhere(params.startDate, params.endDate)}
    ${validWhere(params.isValid)}
    ${validAdminWhere(params.isValid)}
    ${apprvAdminWhere(params.isApprovedAdmin)}
    ${storeWhere(params.storeId)}
    ${keyWhere(params)}
    ${orderBy(params)}`;
    return exeQuery(syntax, [])
}

export const xportByProducts = (params: IParams) => {
    const syntax = `SELECT entries_id, variant_id, variant_name, variant_category.name, quantity, amount FROM entries_variant JOIN variants ON variants.id = entries_variant.variant_id
    JOIN variant_category ON variant_category.id = variants.category JOIN entries ON entries.id = entries_variant.entries_id
    WHERE 1 = 1
    ${dateWhere(params.startDate, params.endDate)}`;
    return exeQuery(syntax, [])
}

export const countAll2 = (params: IParams) => {
    const syntax = `SELECT COUNT(1) AS total_all FROM entries AS A
    WHERE 1 = 1 
    ${mediaWhere(params.media)}
    ${dateWhere(params.startDate, params.endDate)}
    ${validWhere(params.isValid)}
    ${validAdminWhere(params.isValidAdmin)}
    ${apprvAdminWhere(params.isApprovedAdmin)} 
    ${keyWhere(params)}`;
    return exeQuery(syntax, [])
}

export const save = (param: formModal) => {
    const syntax = `INSERT INTO users (username, password, fullname, accessId, is_enabled) VALUES (?,?,?,?,?)`;
    return exeQuery(syntax, [param.username || '', param.password || '', param.name || '', param.role || '', '1'])
}

export const update = (param: formModal) => {
    if (!param.password) {
        const syntax = `UPDATE users SET username = ?, fullname = ?, accessId = ? WHERE username = ?`;
        return exeQuery(syntax, [param.username || '', param.name || '', param.role || '', param.id || ''])
    }

    const syntax = `UPDATE users SET username = ?, password = ?, fullname = ?, accessId = ? WHERE username = ?`;
    return exeQuery(syntax, [param.username || '', param.password || '', param.name || '', param.role || '', param.id || ''])
}

export const deleteUser = (param: formModal) => {
    const syntax = `DELETE FROM users WHERE username = $1`;
    return exeQuery(syntax, [param.username || ''])
}

export const detail = (id: string) => {
    // c.id as store_city, c.city as storeCityName, c.province as store_province, 
    // LEFT JOIN store_city c ON A.store_city = c.id
    const syntax = `
    SELECT A.name, A.sender, A.hp, A.city AS regency, B.identity AS "idNumber", A.message, A.rcvd_time, A.is_valid AS is_valid, A.invalid_reason_admin AS "invalidId", A."storeId" AS "storeType", A.purchase_no_admin AS "purchaseNoAdmin", A.purchase_date_admin AS purchase_date, A.purchase_no_admin AS "storeReceipt", A."invalidReasonId" AS "invalidId"
        FROM entries A 
        LEFT JOIN users B ON A."userId" = B.id
        LEFT JOIN store C ON C.id = A."storeId"
        WHERE A.id = $1
    `;
    return exeQuery(syntax, [id])
}

export const getImgs = (id: string) => {
    // c.id as store_city, c.city as storeCityName, c.province as store_province, 
    // LEFT JOIN store_city c ON A.store_city = c.id
    const syntax = `SELECT
	CONCAT(X.value, '/api/images3', C.url) AS src
FROM entries A 
LEFT JOIN users B ON A."userId" = B.id
LEFT JOIN attachment C ON A.id = C."entriesId"
LEFT JOIN general_parameter X ON X.name = 'imgUrl'
WHERE A.id = $1`;
    return exeQuery(syntax, [id])
}

export const detail2 = (id: string) => {
    // c.id as store_city, c.city as storeCityName, c.province as store_province, 
    // LEFT JOIN store_city c ON A.store_city = c.id
    const syntax = `SELECT A.name, C.name as media, A.id_number AS idNumber, A.hp, A.sender, B.regency, A.rcvd_time, A.message, A.is_valid, F.name AS invalid_reason, A.purchase_date, H.name AS prize_name  
    FROM entries A 
    LEFT JOIN users B ON A.userId = B.id
    LEFT JOIN store C ON A.storeId = C.id
    LEFT JOIN store_area D ON C.areaId = D.id
    LEFT JOIN attachment E ON A.id = E.entriesId
    LEFT JOIN invalid_reason F ON A.invalidReasonId = F.id
    LEFT JOIN winner G ON A.id = G.entriesId
    LEFT JOIN prize H ON G.prizeId = H.id
    WHERE A.id = ?`;
    return exeQuery(syntax, [id])
}

export const variantsDetail = (id: string) => {
    return exeQuery(`SELECT B.name as name, A.id as "entriesId", A."productId" AS "prodId", A.quantity, A.amount as price, A.total_amount as "totalPrice" FROM entries_variant A JOIN product B ON A."productId" = B.id WHERE A."entriesId" = $1`, [id])
}

export const findRole = (param: formModal) => {
    const syntax = `SELECT id FROM access A WHERE A.description = $1`;
    return exeQuery(syntax, [param.role || ''])
}

export const findOne = (param: formModal) => {
    const syntax = `SELECT id FROM users A WHERE A.username = $1`;
    return exeQuery(syntax, [param.username || ''])
}

export const listByStore = (params: IParams2) => {
    const syntax = `SELECT (CASE A.media WHEN "300" THEN "WA" ELSE "" END) AS media,A.id, A.rcvd_time, A.name, A.sender, A.hp, 
    A.city AS regency, A.is_valid, A.is_approved, id_number
    FROM entries AS A
    WHERE A.is_deleted = 0
    AND A.store_id = $1
    ${keyWhere2(params)}
    ${dateWhere(params.startDate, params.endDate)}
    ${orderBy2(params)}
    ${params.limit}`;
    return exeQuery(syntax, [params.storeId])
}

export const xportByStore = (params: IParams2) => {
    const syntax = `SELECT (CASE A.media WHEN "300" THEN "WA" ELSE "" END) AS media,A.id, A.rcvd_time, A.name, A.sender, A.hp, 
    A.city AS regency, 
    (CASE when A.is_approved = 1 then 'Approved' ELSE 'Unapproved' END) AS approval,
    (CASE when A.is_valid = 1 then 'Valid' WHEN A.is_valid = 2 THEN 'Pending' ELSE 'Invalid' END) AS entryValid,
    id_number
    FROM entries AS A
    WHERE A.is_deleted = 0
    AND A.store_id = $1
    ${keyWhere2(params)}
    ${dateWhere(params.startDate, params.endDate)}
    GROUP BY A.id
    ${orderBy2(params)}`;
    return exeQuery(syntax, [params.storeId])
}

export const countAllByStore = (params: IParams2) => {
    const syntax = `SELECT COUNT(1) as total_all
    FROM entries AS A
    JOIN store_master AS D ON (A.store_id = D.id)
    WHERE 0 = 0
    AND A.store_id = $1
    ${keyWhere2(params)}
    ${dateWhere(params.startDate, params.endDate)}`;
    return exeQuery(syntax, [params.storeId])
}

export const listBySales = (params: IParams2) => {
    if (params.mode === "store") {
        const syntax = `SELECT (CASE A.media WHEN "300" THEN "WA" ELSE "" END) AS media,A.id, A.rcvd_time, A.name, A.sender, A.hp, 
        A.city AS regency, A.is_valid, A.is_approved, A.id_number, A.total_amount
        FROM entries AS A
        WHERE A.is_deleted = 0
        AND A.store_id = $1
        ${keyWhere2(params)}
        ${dateWhere(params.startDate, params.endDate)}
        ${orderBy2(params)}
        ${params.limit}`;
        return exeQuery(syntax, [params.storeId])
    } else {
        const syntax = `SELECT (CASE A.media WHEN "300" THEN "WA" ELSE "" END) AS media,A.id, A.rcvd_time, A.name, A.sender, A.hp, 
        A.city AS regency, A.is_valid, A.is_approved, A.id_number, A.total_amount
        FROM entries AS A
        JOIN store_rsa AS E ON (A.rsa_id = E.id)
        WHERE A.is_deleted = 0
        AND A.store_id = $1
        ${keyWhere2(params)}
        ${dateWhere(params.startDate, params.endDate)}
        ${orderBy2(params)}
        ${params.limit}`;
        return exeQuery(syntax, [params.storeId])
    }
}

export const xportBySales = (params: IParams2) => {
    if (params.mode === "store") {
        const syntax = `SELECT (CASE A.media WHEN "300" THEN "WA" ELSE "" END) AS media,A.id, A.rcvd_time, A.name, A.sender, A.hp, 
        A.city AS regency, E.store_name AS storeName,
        (CASE when A.is_approved = 1 then 'Approved' ELSE 'Unapproved' END) AS approval,
        (CASE when A.is_valid = 1 then 'Valid' WHEN A.is_valid = 2 THEN 'Pending' ELSE 'Invalid' END) AS entryValid,
        A.total_amount,
        A.id_number
        FROM entries AS A
        JOIN store_master AS E ON (A.store_id_input = E.id)
        WHERE A.is_deleted = 0
        ${keyWhere2(params)}
        ${dateWhere(params.startDate, params.endDate)}
        GROUP BY A.id
        ${orderBy2(params)}`;
        return exeQuery(syntax, [params.storeId])
    } else {
        const syntax = `SELECT (CASE A.media WHEN "300" THEN "WA" ELSE "" END) AS media,A.id, A.rcvd_time, A.name, A.sender, A.hp, 
        A.city AS regency, E.name AS rsaName,
        (CASE when A.is_approved = 1 then 'Approved' ELSE 'Unapproved' END) AS approval,
        (CASE when A.is_valid = 1 then 'Valid' WHEN A.is_valid = 2 THEN 'Pending' ELSE 'Invalid' END) AS entryValid,
        A.total_amount,
        A.id_number
        FROM entries AS A
        JOIN store_rsa AS E ON (A.rsa_id = E.id)
        WHERE A.is_deleted = 0
        ${keyWhere2(params)}
        ${dateWhere(params.startDate, params.endDate)}
        GROUP BY A.id
        ${orderBy2(params)}`;
        return exeQuery(syntax, [params.storeId])
    }

}

export const countAllBySales = (params: IParams2) => {
    if (params.mode === "store") {
        const syntax = `SELECT COUNT(1) as total_all
        FROM entries AS A
        JOIN store_master AS D ON (A.store_id = D.id)
        WHERE 0 = 0
        AND A.store_id = $1
        ${keyWhere2(params)}
        ${dateWhere(params.startDate, params.endDate)}`;
        return exeQuery(syntax, [params.storeId])
    } else {
        const syntax = `SELECT COUNT(1) as total_all
        FROM entries AS A
        JOIN store_master AS D ON (A.store_id = D.id)
        JOIN store_rsa AS E ON (A.rsa_id = E.id)
        WHERE 0 = 0
        AND A.store_id = $1
        ${keyWhere2(params)}
        ${dateWhere(params.startDate, params.endDate)}`;
        return exeQuery(syntax, [params.storeId])
    }

}

export const startTransaction = () => {
    return exeQuery("START TRANSACTION", [])
}

export const commitTransaction = () => {
    return exeQuery("COMMIT", [])
}

export const rollback = () => {
    return exeQuery("ROLLBACK", [])
}