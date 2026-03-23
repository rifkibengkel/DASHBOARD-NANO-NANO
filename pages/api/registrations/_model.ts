import {exeQuery} from "@/lib/db"
import { multiPromo } from "../dashboard/_model"
// import dayjs from 'dayjs'

interface RgParams {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    media: string
    startDate: string
    endDate: string
}

export const getFromUsers = (sender: string) => {
    return exeQuery(`SELECT hp FROM users WHERE hp = $1`, [sender])
}

const orderBy = (params: RgParams) => {
    const directionType =
        params.direction == "ascend" ? "ASC" : params.direction == "descend" ? "DESC" : "";
    if (params.column == "" || directionType == "") {
        return " ORDER BY entries.rcvd_time DESC";
    } else {
        return ` ORDER BY "${params.column}"  ${directionType}`;
    }
};

const keyWhere = (params: RgParams) => {
    if (params.key == "") {
        return "";
    } else {
        return ` AND (UPPER(profiles.name) LIKE '%${params.key}%' OR profiles.hp LIKE '%${params.key}%' OR UPPER(profiles.id_number) LIKE '%${params.key}%' OR entries.sender LIKE '%${params.key}%')`;
    }
};


const dateWhere = (startDate: string, endDate: string) => {
    if (startDate == "" || endDate == "") {
        return "";
    } else {
        return ` AND DATE(profiles.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    }
};

const mediaWhere = (media: string) => {
    if (media == "" || media === undefined) {
        return ""
    } else {
        return ` AND (profiles.media = ${media})`
    }
}

const orderBy2 = (params: RgParams) => {
    const directionType =
        params.direction == "ascend" ? "ASC" : params.direction == "descend" ? "DESC" : "";
    if (params.column == "" || directionType == "") {
        return " ORDER BY A.created_at DESC";
    } else {
        return ` ORDER BY "${params.column}"  ${directionType}`;
    }
};

const keyWhere2 = (params: RgParams) => {
    if (params.key == "") {
        return "";
    } else {
        return ` AND (UPPER(A.fullname) LIKE '%${params.key}%' OR A.hp LIKE '%${params.key}%' OR UPPER(A.identity) LIKE '%${params.key}%' OR UPPER(A.regency) LIKE '%${params.key}%' OR UPPER(A.province_ktp) LIKE '%${params.key}%')`;
    }
};


const dateWhere2 = (startDate: string, endDate: string) => {
    if (startDate == "" || endDate == "") {
        return "";
    } else {
        return ` AND DATE(A.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    }
};

const mediaWhere2 = (media: string) => {
    if (media == "") {
        return ""
    } else {
        return ` AND (media.code = ${media})`
    }
}

export const countRegistration = (params: RgParams) => {
    let countQuery = `SELECT count(*) as counts,
    sum(consumer."totalValid") as "totalValid",
    sum(consumer."totalInvalid") as "totalInvalid",
    sum(consumer."totalPending") as "totalPending",
    sum("totalValid"+"totalInvalid"+"totalPending") as total
    from(SELECT SUM(CASE WHEN entries.is_valid = 1 THEN 1 ELSE 0 END) AS "totalValid",
        SUM(CASE WHEN entries.is_valid = 0 THEN 1 ELSE 0 END) AS "totalInvalid",
        SUM(CASE WHEN entries.is_valid IS NULL THEN 1 ELSE 0 END) AS "totalPending"
        FROM profiles
        LEFT JOIN entries ON entries.profile_id = profiles.id
        LEFT JOIN code_province ON code_province.code = profiles.province_ktp
        LEFT JOIN code_regency ON code_regency.code = profiles.regency_ktp
        WHERE 1 = 1 ${keyWhere(params)}${dateWhere(params.startDate, params.endDate)}${mediaWhere(params.media)} group by profiles.id) as consumer`;
    return exeQuery(countQuery, []);
};

export const listRegistration = (params: RgParams) => {
    let listRegistrationQuery = `SELECT 
    DATE_FORMAT(profiles.created_at,"%Y-%m-%d %H:%i:%S") created_at, 
    entries.id AS id, 
    profiles.name, 
    (CASE WHEN profiles.gender = "M" THEN "LAKI - LAKI" WHEN profiles.gender = "F" THEN "PEREMPUAN" ELSE "-" END) gender, 
    profiles.age, 
    profiles.birthdate, 
    profiles.hp AS sender, 
    profiles.hp, 
    profiles.id_number, 
    code_regency.name as city,
    code_province.name as province,
    profiles.regency As cityFormat
FROM profiles
LEFT JOIN entries ON entries.profile_id = profiles.id
LEFT JOIN code_province ON code_province.code = profiles.province_ktp
LEFT JOIN code_regency ON code_regency.code = profiles.regency_ktp
WHERE 1=1${keyWhere(params)}${mediaWhere(params.media)}${dateWhere(params.startDate, params.endDate)} GROUP BY profiles.id${orderBy(params)} ${params.limit}`;

    return exeQuery(listRegistrationQuery, []);
};

export const xport = (params: RgParams) => {
    const syntax = `SELECT 
    DATE_FORMAT(profiles.created_at,"%Y-%m-%d %H:%i:%S") created_at, 
    entries.id AS id, 
    profiles.name, 
    (CASE WHEN profiles.gender = "M" THEN "LAKI - LAKI" WHEN profiles.gender = "F" THEN "PEREMPUAN" ELSE "-" END) gender, 
    profiles.age, 
    profiles.birthdate, 
    entries.sender, 
    profiles.hp, 
    profiles.id_number, 
    code_regency.name as city,
    code_province.name as province,
    profiles.regency As cityFormat
    FROM profiles
    LEFT JOIN entries ON entries.profile_id = profiles.id
    LEFT JOIN code_province ON code_province.code = profiles.province_ktp
    LEFT JOIN code_regency ON code_regency.code = profiles.regency_ktp
    WHERE 1 = 1 ${keyWhere(params)}${mediaWhere(params.media)} GROUP BY profiles.id${orderBy(params)}`;
    return exeQuery(syntax, [])
}

export const countRegistration2 = (params: RgParams) => {
    // let countQuery = `SELECT count(*) as counts,
    // sum(consumer."totalValid") as "totalValid",
    // sum(consumer."totalInvalid") as "totalInvalid",
    // sum(consumer."totalPending") as "totalPending",
    // sum("totalValid"+"totalInvalid"+"totalPending") as total
    // from(SELECT SUM(CASE WHEN A.is_valid = 1 THEN 1 ELSE 0 END) AS "totalValid",
    //     SUM(CASE WHEN A.is_valid = 0 THEN 1 ELSE 0 END) AS "totalInvalid",
    //     SUM(CASE WHEN A.is_valid IS NULL THEN 1 ELSE 0 END) AS "totalPending"
    //     FROM entries AS A
    //     JOIN media ON A."mediaId" = media.id
    //     JOIN users ON A."userId" = users.id
    //     WHERE 0 = 0 ${keyWhere2(params)}${dateWhere2(params.startDate, params.endDate)}${mediaWhere2(params.media)} group by users.id) as consumer`;


    let countQuery = `SELECT count(*) as counts,
    sum(consumer."totalValid") as "totalValid",
    sum(consumer."totalInvalid") as "totalInvalid",
    sum(consumer."totalPending") as "totalPending",
    sum("totalValid"+"totalInvalid"+"totalPending") as total
    from(SELECT SUM(CASE WHEN entries.is_valid = 1 OR (entries.is_valid = 0 AND entries."invalidReasonId" = 4) THEN 1 ELSE 0 END) AS "totalValid",
        SUM(CASE WHEN entries.is_valid = 0 AND entries."invalidReasonId" != 4 THEN 1 ELSE 0 END) AS "totalInvalid",
        SUM(CASE WHEN entries.is_valid = 2 THEN 1 ELSE 0 END) AS "totalPending"
        FROM users AS A
        LEFT JOIN entries ON entries."userId" = A.id
        LEFT JOIN media ON entries."mediaId" = media.id
        WHERE 0 = 0 ${keyWhere2(params)}${dateWhere2(params.startDate, params.endDate)}${mediaWhere2(params.media)} group by A.id) as consumer`;
    return exeQuery(countQuery, []);
};

export const listRegistration2 = (params: RgParams) => {
//     let listRegistrationQuery = `SELECT 
//     users.created_at, 
//     users.fullname,
//     (CASE WHEN users.gender = 'M' THEN 'LAKI - LAKI' WHEN users.gender = 'F' THEN 'PEREMPUAN' ELSE '-' END) gender,
//     users.identity, 
//     users.age, 
//     users.birthdate, 
//     users.hp, 
//     users.regency AS city,
//     users.province,
//     media.name media
// FROM entries AS A
// JOIN media ON A."mediaId" = media.id
// JOIN users ON A."userId" = users.id
// WHERE 0 = 0 ${keyWhere2(params)}${mediaWhere2(params.media)}${dateWhere2(params.startDate, params.endDate)} GROUP BY users.id, media.name${orderBy2(params)} ${params.limit}`;


    let listRegistrationQuery = `SELECT 
    A.created_at, 
    A.fullname,
    A.email,
    (CASE WHEN A.gender = 'M' THEN 'LAKI - LAKI' WHEN A.gender = 'F' THEN 'PEREMPUAN' ELSE '-' END) gender,
    A.identity, 
    A.age, 
    A.birthdate, 
    A.hp, 
    A.regency_ktp AS city,
    media.name media,
    user_mobile.id
FROM users AS A
LEFT JOIN entries ON entries."userId" = A.id
LEFT JOIN media ON A."mediaId" = media.id
LEFT JOIN user_mobile ON user_mobile."userId" = A.id
WHERE 0 = 0 ${keyWhere2(params)}${mediaWhere2(params.media)}${dateWhere2(params.startDate, params.endDate)} GROUP BY A.id, media.name, user_mobile.id, user_mobile.status${orderBy2(params)} ${params.limit}`;

    return exeQuery(listRegistrationQuery, []);
};

export const exportRgstr2 = (params: RgParams) => {
    const query = `SELECT 
    A.id AS "userId",
    A.created_at, 
    A.fullname,
    A.email,
    (CASE WHEN A.gender = 'M' THEN 'LAKI - LAKI' WHEN A.gender = 'F' THEN 'PEREMPUAN' ELSE '-' END) gender,
    A.identity, 
    A.age, 
    A.birthdate, 
    A.hp, 
    A.regency_ktp AS city,
    media.name media
FROM users AS A
LEFT JOIN entries ON entries."userId" = A.id
LEFT JOIN media ON A."mediaId" = media.id
WHERE 0 = 0 ${keyWhere2(params)} GROUP BY A.id, media.name${orderBy2(params)}`

return exeQuery(query, [])
}

export const exportRegistration = (params: RgParams) => {
    let exportRegquery = `SELECT profiles.created_at, entries.id AS entriesId, 
	profiles.name, profiles.sender, profiles.hp, city as city, profiles.id_number,
    SUM(CASE WHEN entries.is_valid = 1 THEN 1 ELSE 0 END) AS total_submit_valid,
      SUM(CASE WHEN entries.is_valid = 0 THEN 1 ELSE 0 END) AS total_submit_invalid,
      SUM(CASE WHEN entries.is_valid IS NULL THEN 1 ELSE 0 END) AS total_submit_pending,
      COUNT(*) AS total_submit
    FROM entries
    LEFT JOIN profiles ON entries.profile_id = profiles.id
    WHERE 0 = 0 ${keyWhere(params)}${mediaWhere(params.media)}${dateWhere(params.startDate, params.endDate)} GROUP BY profiles.id${orderBy(params)} ${params.limit}`;

    return exeQuery(exportRegquery, []);
};

export const findProfile = (hp: string) => {
    const syntax = `SELECT id FROM profiles A WHERE A.username = $1`
    return exeQuery(syntax, [hp])
}

export const updateProfile = (hp: string, oldId: string) => {
    const syntax = `UPDATE profiles SET hp = $1, username = $2 WHERE username = $2`
    return exeQuery(syntax, [hp, hp, oldId])
}

export const checkStatus = (id: string) => {
    let editUserQuery = `SELECT status FROM user_mobile WHERE id = $1`;
    return exeQuery(editUserQuery, [id]);
};

export const editStatus = (status: boolean, id: string) => {
    let editUserQuery = `UPDATE user_mobile SET status = $1 WHERE id = $2`;
    return exeQuery(editUserQuery, [status ? 0 : 1, Number(id)]);
};

export const startTransaction = () => {
    return exeQuery("START TRANSACTION", [])
}

export const commitTransaction = () => {
    return exeQuery("COMMIT", [])
}

export const rollback = () => {
    return exeQuery("ROLLBACK", [])
}