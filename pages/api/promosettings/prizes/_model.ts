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
        return ` WHERE (name LIKE '%${key}%' OR sender LIKE '%${key}%' OR id_number LIKE '%${key}%')`;
    }
};

export const listPrizes = () => {
    let listQuery = `SELECT 
    prize_setting.id,
    "startTime" as start_time,"endTime" as end_time,
    prize_setting.status AS enabled,
    prize_setting.interval,
    prize_setting.limit,
    CONCAT(prize.name, prize.amount) AS name,
    prize_setting.purchase_min,
    prize_setting.purchase_max
from prize_setting
join prize on prize.id = prize_setting."prizeId"`;
    return exeQuery(listQuery, []);
};

export const detailList = (id: string) => {
    let queryDetail = `SELECT * FROM black_list WHERE id = ?`;
    return exeQuery(queryDetail, [id]);
};

export const searchList = (sender: string, id: string, type: string) => {
    let edit = `SELECT COUNT(*) AS counts FROM black_list WHERE sender=? AND id!=?`;
    let insert = `SELECT * FROM black_list WHERE sender= ?`;
    if (type == "edit") {
        return exeQuery(edit, [sender, id]);
    } else {
        return exeQuery(insert, [sender]);
    }
};

export const insertList = (name: string, sender: string, idNumber: string) => {
    let queryInsert = `INSERT INTO black_list(name,sender, id_number) VALUES (?,?,?)`;
    return exeQuery(queryInsert, [name, sender, idNumber]);
};

export const editList = (name: string, sender: string, idNumber: string, id: string) => {
    let editUserQuery = `UPDATE black_list SET name = ?, sender = ?, id_number = ? WHERE id = ?`;
    return exeQuery(editUserQuery, [name, sender, idNumber, id]);
};

export const deleteList = (id: string) => {
    let queryDelete = `DELETE FROM black_list WHERE id = ?`;
    return exeQuery(queryDelete, [id]);
};

export const updateUserId = (id: string, userId: string) => {
    return exeQuery("UPDATE black_list SET id_user = ? WHERE id = ?", [userId, id])
}

export const updatePrizeSetting = (startTime: string, endTime: string, enabled: string, limit: string, interval: string, id: string, purchase_min: string, purchase_max: string, userId: number) => {
    return exeQuery("UPDATE prize_setting SET startTime = ?,endTime = ?,status = ?, prize_setting.limit = ?,prize_setting.interval = ?, purchase_min = ?, purchase_max = ?, updatedById = ? WHERE id = ?", [startTime, endTime, enabled, limit, interval, purchase_min, purchase_max, userId, id])
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