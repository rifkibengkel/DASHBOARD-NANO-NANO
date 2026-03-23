import {exeQuery} from "@/lib/db"
// import dayjs from 'dayjs'

const orderBy = (direction: string, column: string) => {
    const directionType =
        direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
    if (column == "" || directionType == "") {
        return " ORDER BY id DESC";
    } else {
        return ` ORDER BY "${column}"  ${directionType}`;
    }
};

const keyWhere = (key: string) => {
    if (key == "") {
        return "";
    } else {
        return ` WHERE description LIKE '%${key}%' OR value LIKE '%${key}%'`;
    }
};

export const countLists = () => {
    let countQuery = `SELECT COUNT(*) AS counts FROM general_parameter`;
    return exeQuery(countQuery, []);
};

export const listGP = () => {
    let listQuery = `SELECT id, name, description, value, status as "gpStatus", status FROM general_parameter`;
    return exeQuery(listQuery, []);
};
export const insertGP = (description: string, param: string, status: string, userId: number) => {
    return exeQuery(`INSERT INTO general_parameter (description, value, status, "createdById") VALUES($1,$2,$3,$4)`, [description, param, status, userId])
}

export const detailGP = (id: string) => {
    let queryDetailGP = `SELECT * FROM general_parameter WHERE id = ?`;
    return exeQuery(queryDetailGP, [id]);
};

export const editGP = (description: string, param: string, status: string, id: string, userId: number) => {
    let editGP = `UPDATE general_parameter SET description = $1, value = $2, status = $3, "updatedById" = $4 where id = $5`
    return exeQuery(editGP, [description, param, status, userId, id])
}

export const gpList = () => {
    let queryDetailGP = `SELECT description, value FROM general_parameter WHERE status = 1`;
    return exeQuery(queryDetailGP, []);
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