import { exeQuery } from "@/lib/db";
// import dayjs from 'dayjs'

interface IParams {
  row: string | number;
  page: string | number;
  key: string;
  direction: string;
  column: string;
  limit: number | string;
}

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

export const countLists = (params: IParams) => {
  let countQuery = `SELECT COUNT(*) AS counts FROM black_list ${keyWhere(
    params.key
  )}`;
  return exeQuery(countQuery, []);
};

export const listBlacklists = (params: IParams) => {
  let listQuery = `SELECT id, name, sender, id_number FROM black_list${keyWhere(
    params.key
  )}${orderBy(params.direction, params.column)} ${params.limit}`;
  return exeQuery(listQuery, []);
};

export const detailList = (id: string) => {
  let queryDetail = `SELECT * FROM black_list WHERE id = $1`;
  return exeQuery(queryDetail, [id]);
};

export const searchList = (sender: string, id: any, type: string) => {
  let edit = `SELECT COUNT(*) AS counts FROM black_list WHERE sender=$1 AND id!=$2`;
  let insert = `SELECT * FROM black_list WHERE sender= $1`;
  if (type == "edit") {
    return exeQuery(edit, [sender, id]);
  } else {
    return exeQuery(insert, [sender]);
  }
};

export const insertList = (
  name: string,
  sender: string,
  idNumber: string,
  userId: number
) => {
  let queryInsert = `INSERT INTO black_list(name,sender, id_number, "createdById") VALUES ($1,$2,$3,$4)`;
  return exeQuery(queryInsert, [name, sender, idNumber, userId]);
};

export const editList = (
  name: string,
  sender: string,
  idNumber: string,
  id: string,
  userId: number
) => {
  let editUserQuery = `UPDATE black_list SET name = $1, sender = $2, id_number = $3, "updatedById" = $4 WHERE id = $5`;
  return exeQuery(editUserQuery, [name, sender, idNumber, userId, id]);
};

export const deleteList = (id: string) => {
  let queryDelete = `DELETE FROM black_list WHERE id = $1`;
  return exeQuery(queryDelete, [id]);
};

export const updateUserId = (id: string, userId: string) => {
  return exeQuery(`UPDATE black_list SET "userId" = $1 WHERE id = $2`, [
    userId,
    id,
  ]);
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
