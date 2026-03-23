import {exeQuery} from "@/lib/db"

interface IntfC {
    id: string;
    picture: string;
    sort: string
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
    let countQuery = `SELECT COUNT(*) AS counts FROM banner`;
    return exeQuery(countQuery, []);
};

export const list = () => {
    let listQuery = `SELECT id, url_picture, sort FROM banner WHERE status = 1`;
    return exeQuery(listQuery, []);
};
export const insert = (param: IntfC) => {
    return exeQuery("INSERT INTO banner (url_picture, sort, status) VALUES($1,$2,1)", [param.picture, param.sort])
}

export const detail = (id: string) => {
    let queryDetail = `SELECT * FROM banner WHERE id = $1`;
    return exeQuery(queryDetail, [id]);
};

export const edit = (param: IntfC) => {
    let edit = `UPDATE banner SET url_picture = $1, sort = $2 where id = $3`
    return exeQuery(edit, [param.picture, param.sort, param.id])
}

export const dlt = (id: string) => {
    let rm = `UPDATE banner SET status = 0 WHERE id = $1`
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