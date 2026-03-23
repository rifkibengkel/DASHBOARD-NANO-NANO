import { exeQuery } from '../../../lib/db';
import { IForm } from '../../../interfaces/role.interface';

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
    const directionType = direction == 'ascend' ? 'ASC' : direction == 'descend' ? 'DESC' : '';
    if (column == '' || directionType == '') {
        return ' ORDER BY A.id DESC';
    } else {
        return ` ORDER BY "${column}" ${directionType}`;
    }
};

const keyWhere = (params: IParams) => {
    const { key } = params;
    if (key == '') {
        return '';
    } else {
        return ` AND (UPPER(A.username) LIKE '%${key}%' OR UPPER(A.name) LIKE '%${key}%' OR UPPER(B.description) LIKE '%${key}%')`;
    }
};

const dateWhere = (startDate: string, endDate: string) => {
    if (startDate == '' || endDate == '') {
        return '';
    } else {
        return ` AND DATE(A.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    }
};

export const list = (params: IParams) => {
    const syntax = `SELECT description, status FROM access A WHERE 1 = 1 ${keyWhere(params)}
    ${orderBy(params)}
    ${params.limit}`;
    return exeQuery(syntax, []);
};

export const countAll = (params: IParams) => {
    const syntax = `SELECT COUNT(1) AS total_all FROM access A
        WHERE 1 = 1${keyWhere(params)}`;
    return exeQuery(syntax, []);
};

export const findOne = (param: IForm) => {
    const syntax = `SELECT id, description, status FROM access A WHERE A.description = $1`;
    return exeQuery(syntax, [param.description]);
};

export const save = (param: IForm) => {
    const syntax = `INSERT INTO access (description, status) VALUES ($1, $2) RETURNING *`;
    return exeQuery(syntax, [param.description, param.status as string]);
};

export const saveAccess = (stx: string) => {
    const syntax = `INSERT INTO access_det (m_insert, m_update, m_delete, m_view, "accessId", "menuId", "createdById") 
    VALUES ${stx}`;

    return exeQuery(syntax, []);
};

export const deleteRole = async (id: string) => {
    const syntax = `DELETE FROM access WHERE id = $1`;
    const syntaxDet = `DELETE FROM access_det WHERE "accessId" = $1`;

    await exeQuery(syntaxDet, [id]);
    return exeQuery(syntax, [id]);
};

export const updateOne = (param: any) => {
    const syntax = `UPDATE access SET description = $1, status = $2, "updatedById" = $3 WHERE description = $4`;
    return exeQuery(syntax, [param.description, param.status, param.userId, param.id]);
};

export const updateAccess = (stx: string) => {
    const syntax = `INSERT INTO access_det (id, m_insert, m_update, m_delete, m_view, "accessId", "menuId", "createdById") 
    VALUES ${stx} ON CONFLICT (id) DO UPDATE SET m_insert = EXCLUDED.m_insert, m_update = EXCLUDED.m_update, 
    m_delete = EXCLUDED.m_delete, m_view = EXCLUDED.m_view, "accessId" = EXCLUDED."accessId",
    "menuId" = EXCLUDED."menuId", "createdById" = EXCLUDED."createdById"`;

    return exeQuery(syntax, []);
};

export const getNewAccessId = () => {
    const syntax = `SELECT MAX(id) AS nextval FROM access_det`;
    return exeQuery(syntax, []);
};

export const startTransaction = () => {
    return exeQuery('START TRANSACTION', []);
};

export const commitTransaction = () => {
    return exeQuery('COMMIT', []);
};

export const rollback = () => {
    return exeQuery('ROLLBACK', []);
};
