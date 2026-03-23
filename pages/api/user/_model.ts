import { exeQuery } from "../../../lib/db";
import { formModal } from "../../../interfaces/user.interface";

interface IParams {
  row: string | number;
  page: string | number;
  key: string;
  direction: string;
  column: string;
  limit: number | string;
}

const orderBy = (params: IParams) => {
  const { direction, column } = params;
  const directionType =
    direction == "ascend" ? "ASC" : direction == "descend" ? "DESC" : "";
  if (column == "" || directionType == "") {
    return " ORDER BY A.id DESC";
  } else {
    return ` ORDER BY "${column}" ${directionType}`;
  }
};

const keyWhere = (params: IParams) => {
  const { key } = params;
  if (key == "") {
    return "";
  } else {
    return ` AND (UPPER(A.email) LIKE '%${key}%' OR UPPER(A.name) LIKE '%${key}%' OR UPPER(B.description) LIKE '%${key}%')`;
  }
};

const dateWhere = (startDate: string, endDate: string) => {
  if (startDate == "" || endDate == "") {
    return "";
  } else {
    return ` AND DATE(A.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
  }
};

export const list = (params: IParams) => {
  const syntax = `SELECT username, fullname AS name, B.description AS role, A.created_at
    FROM user_mobile A, access B 
    WHERE A."accessId" = B.id AND A."userId" IS NULL
    ${keyWhere(params)}
    ${orderBy(params)}
    ${params.limit}`;
  return exeQuery(syntax, []);
};

export const countAll = (params: IParams) => {
  const syntax = `SELECT COUNT(1) AS total_all FROM user_mobile A, access B 
        WHERE A."accessId" = B.id  AND A."userId" IS NULL ${keyWhere(params)}`;
  return exeQuery(syntax, []);
};

export const save = (param: formModal) => {
  const syntax = `INSERT INTO user_mobile (username, password, fullname, "accessId", "createdById") VALUES ($1,$2,$3,$4, $5)`;
  return exeQuery(syntax, [
    param.username || "",
    param.password || "",
    param.name || "",
    param.role || "",
    param.userId,
  ]);
};

export const update = (param: formModal) => {
  if (!param.password) {
    const syntax = `UPDATE user_mobile SET username = $1, fullname = $2, "accessId" = $3, "updatedById" = $4 WHERE username = $5`;
    return exeQuery(syntax, [
      param.username || "",
      param.name || "",
      param.role || "",
      param.userId,
      param.id || "",
    ]);
  }

  const syntax = `UPDATE user_mobile SET username = $1, password = $2, fullname = $3, "accessId" = $4 WHERE username = $5`;
  return exeQuery(syntax, [
    param.username || "",
    param.password || "",
    param.name || "",
    param.role || "",
    param.id || "",
  ]);
};

export const deleteUser = (param: formModal) => {
  const syntax = `DELETE FROM user_mobile WHERE username = $1`;
  return exeQuery(syntax, [param.username || ""]);
};

export const findRole = (param: formModal) => {
  const syntax = `SELECT id FROM access A WHERE A.description = $1`;
  return exeQuery(syntax, [param.role || ""]);
};

export const findOne = (param: formModal) => {
  const syntax = `SELECT id FROM user_mobile A WHERE A.username = $1`;
  return exeQuery(syntax, [param.username || ""]);
};

export const findDuplicate = (param: formModal) => {
  const syntax = `SELECT id FROM user_mobile A WHERE A.username = $1 AND A.username != $2`;
  return exeQuery(syntax, [param.username || "", param.id || ""]);
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
