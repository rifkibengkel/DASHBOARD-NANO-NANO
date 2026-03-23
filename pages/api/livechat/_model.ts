import {exeQuery} from "../../../lib/db";
import {formModal} from "../../../interfaces/user.interface";
import { IPagination } from "@/interfaces/livechat.interface";
// import { multiPromo } from "../dashboard/_model";

interface IParams {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    startDate: string
    endDate: string
    type?: string
    storeId?: string | number
    agentId?: string | number
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

const orderBy = (params: IParams) => {
    const {direction, column} = params
    const directionType =
        direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
    if (!column || !directionType) {
        return " ORDER BY A.id DESC";
    } else {
        return ` ORDER BY "${column}" ${directionType}`;
    }
};

const orderBy2 = (params: IParams2) => {
    const {direction, column} = params
    const directionType =
        direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
    if (!column || !directionType) {
        return " ORDER BY A.id DESC";
    } else {
        return ` ORDER BY "${column}" ${directionType}`;
    }
};

const keyWhere = (params: IParams) => {
    const {key} = params
    if (!key) {
        return "";
    } else {
        return ` AND (UPPER(A.name) LIKE '%${key}%' OR UPPER(A.email) LIKE '%${key}%')`;
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

const idWhere = (params: IParams) => {
    const {agentId} = params
    if (!agentId) {
        return "";
    } else {
        return ` AND A.id = ${agentId}`;
    }
};

const dateWhere = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
        return "";
    } else {
        return ` AND DATE(B.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    }
};

const dateXWhere = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
        return "";
    } else {
        return ` WHERE DATE(X.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    }
};

const joinWhere = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
        return "";
    } else {
        return `LEFT JOIN chat B ON B."agentId" = A.id`;
    }
};

export const list2 = (params: IParams) => {
    const syntax = `SELECT A.id,
        A.name, 
        A.email, 
        CASE WHEN D.total_chat IS NOT NULL THEN D.total_chat ELSE 0 END AS total_chat,
        CASE WHEN E.total_rating IS NOT NULL THEN E.total_rating ELSE 0 END AS total_rating,
        AVG(total_rating/total_chat) AS average_rate
        FROM agent A 
        LEFT JOIN chat B ON B."agentId" = A.id
        LEFT JOIN topic C ON C.id = B."topicId"
        LEFT JOIN (
            SELECT X."agentId", SUM(CASE WHEN X."agentId" IS NOT NULL THEN 1 ELSE 0 END) AS total_chat 
            FROM chat AS X 
            ${dateXWhere(params.startDate, params.endDate)}
            GROUP BY "agentId"
        ) AS D ON A.id = D."agentId"
        LEFT JOIN (
            SELECT X."agentId", SUM(X.rating) AS total_rating 
            FROM chat AS X 
            ${dateXWhere(params.startDate, params.endDate)}
            GROUP BY "agentId"
        ) AS E ON A.id = E."agentId"
        WHERE 1 = 1
        ${dateWhere(params.startDate, params.endDate)}
        ${idWhere(params)}
        ${keyWhere(params)}
        GROUP BY A.id, D."agentId", D.total_chat, E."agentId", E.total_rating
        ${orderBy(params)}
        ${params.limit}
    `;

    return exeQuery(syntax, [])
}

export const xport2Special = (params: IParams, threshold: number) => {
    const syntax = `SELECT A.id,
        A.name, 
        A.email, 
        CASE WHEN D.total_chat IS NOT NULL THEN D.total_chat ELSE 0 END AS total_chat,
        CASE WHEN E.total_rating IS NOT NULL THEN E.total_rating ELSE 0 END AS total_rating,
        ROUND(AVG(total_rating/total_chat)) AS average_rate
        FROM agent A 
        LEFT JOIN chat B ON B."agentId" = A.id
        LEFT JOIN topic C ON C.id = B."topicId"
        LEFT JOIN (
            SELECT X."agentId", SUM(CASE WHEN X."agentId" IS NOT NULL THEN 1 ELSE 0 END) AS total_chat 
            FROM chat AS X 
            ${dateXWhere(params.startDate, params.endDate)}
            GROUP BY "agentId"
        ) AS D ON A.id = D."agentId"
        LEFT JOIN (
            SELECT X."agentId", SUM(X.rating) AS total_rating 
            FROM chat AS X 
            ${dateXWhere(params.startDate, params.endDate)}
            GROUP BY "agentId"
        ) AS E ON A.id = E."agentId"
        WHERE 1 = 1
        ${dateWhere(params.startDate, params.endDate)}
        ${idWhere(params)}
        ${keyWhere(params)}
        GROUP BY A.id, D."agentId", D.total_chat, E."agentId", E.total_rating
        ${orderBy(params)} LIMIT 10000 OFFSET ${threshold}
    `;
    return exeQuery(syntax, [])
}

export const countAll2 = (params: IParams) => {
    const syntax = `SELECT COUNT(1) AS total_all
        FROM agent A 
        ${joinWhere(params.startDate, params.endDate)}
        WHERE 1 = 1
        ${dateWhere(params.startDate, params.endDate)}
        ${idWhere(params)}
        ${keyWhere(params)}
    `;
    return exeQuery(syntax, [])
}

export const getAgent = (id: string) => {
    const syntax = `SELECT id, name, email FROM agent WHERE status = 1 AND id = $1`
    return exeQuery(syntax, [id])
}

export const detail = (params: IPagination, topicsId: string) => {
    const syntax = `SELECT row_number() OVER(ORDER BY B.created_at DESC) AS no, A.id,
        A.name,
        B.rating, 
        B.created_at AS rcvd_time
        FROM agent A 
        LEFT JOIN chat B ON B."agentId" = A.id
        LEFT JOIN topic C ON C.id = B."topicId"
        WHERE A.id = $1 AND C.id = $2
        ${dateWhere(params.startDate, params.endDate)}
        ORDER BY B.created_at DESC
    `;

    return exeQuery(syntax, [params.agentId, topicsId])
}

export const detail2 = (id: string) => {
    const syntax = `SELECT A.id,
        A.name, 
        A.email, 
        CASE WHEN D.total_chat IS NOT NULL THEN D.total_chat ELSE 0 END AS total_chat,
        CASE WHEN E.total_rating IS NOT NULL THEN E.total_rating ELSE 0 END AS total_rating,
        AVG(total_rating/total_chat) AS average_rate
        FROM agent A 
        LEFT JOIN chat B ON B."agentId" = A.id
        LEFT JOIN topic C ON C.id = B."topicId"
        LEFT JOIN (SELECT X."agentId", SUM(CASE WHEN X."agentId" IS NOT NULL THEN 1 ELSE 0 END) AS total_chat FROM chat AS X GROUP BY "agentId") AS D ON A.id = D."agentId"
        LEFT JOIN (SELECT X."agentId", SUM(X.rating) AS total_rating FROM chat AS X GROUP BY "agentId") AS E ON A.id = E."agentId"
        WHERE 1 = 1
    `;
    
    return exeQuery(syntax, [id])
}

export const topicsDetail = (params: IPagination) => {
    const syntax = `SELECT C.id, C.title
        FROM agent A 
        LEFT JOIN chat B ON B."agentId" = A.id
        LEFT JOIN topic C ON C.id = B."topicId"
        WHERE A.id = $1
        ${dateWhere(params.startDate, params.endDate)}
        GROUP BY C.id
    `;
    return exeQuery(syntax, [params.agentId])
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

export const getMonths = () => {
    return exeQuery(`SELECT 
    TO_CHAR(date_trunc('month', rcvd_time::timestamp),'YYYY-MM') AS "date" 
    FROM entries 
    GROUP BY date_trunc('month', rcvd_time::TIMESTAMP) 
    ORDER BY date_trunc('month', rcvd_time::timestamp) ASC`, [])
}

export const demographic = (startDate: string, endDate: string) => {
    let demographicQuery = `SELECT C.id, C.title AS "categories", COUNT(1) AS "series"
        FROM chat B
        LEFT JOIN topic C ON B."topicId" = C.id
        WHERE 1=1 
        ${dateWhere(startDate, endDate)}
        GROUP BY C.id
        ORDER BY C.id ASC
    `;
    return exeQuery(demographicQuery, [])
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