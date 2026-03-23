import {exeQuery} from "@/lib/db"

interface IntfC {
    id: string;
    title: string;
    content: string;
    picture: string;
}

// import dayjs from 'dayjs'

// const orderBy = (direction: string, column: string) => {
//     const directionType =
//         direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
//     if (column == "" || directionType == "") {
//         return " ORDER BY id DESC";
//     } else {
//         return ` ORDER BY ${column}  ${directionType}`;
//     }
// };

// const keyWhere = (key: string) => {
//     if (key == "") {
//         return "";
//     } else {
//         return ` WHERE description LIKE "%${key}%" OR param LIKE "%${key}%"`;
//     }
// };

export const countLists = () => {
    let countQuery = `SELECT COUNT(*) AS counts FROM news`;
    return exeQuery(countQuery, []);
};

export const list = () => {
    let listQuery = `SELECT id, title, content, picture FROM news`;
    return exeQuery(listQuery, []);
};
export const insert = (param: IntfC) => {
    return exeQuery("INSERT INTO news (title, content, picture) VALUES($1,$2,$3)", [param.title, param.content, param.picture])
}

export const detail = (id: string) => {
    let queryDetail = `SELECT * FROM news WHERE id = $1`;
    return exeQuery(queryDetail, [id]);
};

export const edit = (param: IntfC) => {
    let edit = `UPDATE news SET title = $1, content = $2, picture = $3 where id = $4`
    return exeQuery(edit, [param.title, param.content, param.picture, param.id])
}

export const dlt = (id: string) => {
    let rm = `DELETE FROM news where id = $1`
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