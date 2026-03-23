import {exeQuery} from "@/lib/db"
// import dayjs from 'dayjs'

const orderBy = (direction: string, column: string) => {
    const directionType =
        direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
    if (column == "" || directionType == "") {
        return " ORDER BY media.id DESC";
    } else {
        return ` ORDER BY "${column}"  ${directionType}`;
    }
};

const keyWhere = (key: string) => {
    if (key == "") {
        return "";
    } else {
        return ` WHERE code LIKE '%${key}%' OR name LIKE '%${key}%'`;
    }
};

export const countMedia = () => {
    let countQuery = `SELECT COUNT(*) AS counts FROM media`;
    return exeQuery(countQuery, []);
};

export const listMedia = () => {
    let listQuery = `SELECT name, code, status AS is_active FROM media`;
    return exeQuery(listQuery, []);
};
export const insertMedia = (code: string, name: string, sort: string, userId: number) => {
    return exeQuery("INSERT INTO media(code, name, sort, is_active, createdById) VALUES(?,?,?,1,?)", [code, name, sort, userId])
}

export const detailMedia = (id: string) => {
    let queryDetail = `SELECT * FROM media WHERE media.id = ?`;
    return exeQuery(queryDetail, [id]);
};

export const editMedia = (code: string, name: string, sort: string, is_active: string, id: string, userId: number) => {
    let editMedia = `UPDATE media SET code = ?, name = ?, sort = ?, is_active = ?, updatedById = ? where id = ?`
    return exeQuery(editMedia, [code, name, sort, is_active, userId, id])
}

export const mediaList = () => {
    let queryDetail = `SELECT code, name FROM media WHERE is_active = 1`;
    return exeQuery(queryDetail, []);
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