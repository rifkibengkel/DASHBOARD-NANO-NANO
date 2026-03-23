import { exeQuery } from "@/lib/db";
import { formModal } from "@/interfaces/user.interface";
import { multiPromo } from "../dashboard/_model";

interface IParams {
  row: string | number;
  page: string | number;
  key: string;
  limit: number | string;
  period: string;
}

const keyWhere = (params: IParams) => {
  const { key } = params;
  if (!key) {
    return "";
  } else {
    return ` AND (UPPER(C.fullname) LIKE '%${key}%' OR C.identity LIKE '%${key}%')`;
  }
};

export const listPeriode = () => {
  const syntax = `SELECT id as key, 'periode' AS name, X.periode AS value FROM user_rank_periode X ORDER BY X.periode`;

  return exeQuery(syntax, []);
};

export const list = (params: IParams) => {
  const syntax = `SELECT A.periode, C.fullname || ' - ' || C.identity AS fullname, 
  B.rank, B.point, A."status" FROM user_rank_periode A 
  JOIN user_rank B ON A.id = B."userRankPeriodeId" 
  JOIN users C ON C.id = B."userId" 
  WHERE TO_CHAR(A.periode, 'YYYY-MM') = '${params.period}' ${keyWhere(params)} ORDER BY "rank" ASC 
  LIMIT 7 OFFSET 0`;

  return exeQuery(syntax, []);
};

export const countAll = (params: IParams) => {
  const syntax = `SELECT COUNT(1) AS total_all FROM user_rank_periode A JOIN user_rank B ON A.id = B."userRankPeriodeId" JOIN users C ON C.id = B."userId" 
    WHERE TO_CHAR(A.periode, 'YYYY-MM') = '${params.period}' ${keyWhere(params)}`;
    return exeQuery(syntax, []);
};

export const checkPeriod = (period: string) => {
  return exeQuery(
    `SELECT status FROM user_rank_periode WHERE periode = '${period}'`,
    []
  );
};

export const approvePeriod = (period: string) => {
  return exeQuery(
    `UPDATE user_rank_periode SET status = 1 WHERE periode = '${period}'`,
    []
  );
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
