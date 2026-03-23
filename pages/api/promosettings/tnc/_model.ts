import {exeQuery} from "@/lib/db"
// import dayjs from 'dayjs'

const orderBy = (direction: string, column: string) => {
    const directionType =
        direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
    if (column == "" || directionType == "") {
        return " ORDER BY id DESC";
    } else {
        return ` ORDER BY ${column}  ${directionType}`;
    }
};

const keyWhere = (key: string) => {
    if (key == "") {
        return "";
    } else {
        return ` WHERE description LIKE '%${key}%' OR param LIKE '%${key}%'`;
    }
};

export const countLists = () => {
    let countQuery = `SELECT COUNT(*) AS counts FROM tnc`;
    return exeQuery(countQuery, []);
};

export const listTNC = () => {
    let listQuery = `SELECT title, content, type FROM tnc`;
    return exeQuery(listQuery, []);
};
export const insertTNC = (title: string, content: string, type: string) => {
    return exeQuery("INSERT INTO tnc (title, content, type) VALUES($1,$2,$3)", [title, content, type])
}

export const detailTNC = (id: string) => {
    let queryDetailTNC = `SELECT * FROM tnc WHERE id = $1`;
    return exeQuery(queryDetailTNC, [id]);
};

export const editTNC = (title: string, content: string, type: string, id: string) => {
    let editTNC = `UPDATE tnc SET title = $1, content = $2, type = $3 where id = $4`
    return exeQuery(editTNC, [title, content, type, id])
}

export const dlt = (id: string) => {
    let rm = `DELETE FROM tnc where id = $1`
    return exeQuery(rm, [id])
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