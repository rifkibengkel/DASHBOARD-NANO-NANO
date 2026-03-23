import type { NextApiRequest, NextApiResponse } from 'next';
import { getLoginSession } from '@/lib/auth';
import { pagination } from '../../../lib/serverHelper';
import * as model from './_model';
import protectAPI from '../../../lib/protectApi';
import Cors from '../../../lib/cors';
import { IForm } from '../../../interfaces/role.interface';

interface IPagination {
    row: string | number;
    page: string | number;
    key: string;
    direction: string;
    column: string;
    limit: number | string;
}

export const edit = async (encryp: any, user: number) => {
    try {
        const param: IForm = JSON.parse(Buffer.from(encryp, 'base64').toString('ascii'));
        if (param.description != param.id) {
            //cek duplicate
            const checkDuplicate: any = await model.findOne(param);
            if (checkDuplicate.length > 0) {
                return {
                    error: {
                        type: 'warning',
                        message: 'warning',
                        description: 'Username Already Exist',
                    },
                };
            }
        }

        const { access } = param;
        await model.startTransaction();
        await model.updateOne(param);
        const data: any = await model.findOne(param);
        let accessId = data[0].id;
        let syntax = '';
        let nextAccessDetId = '';

        const dataFiltered = await access.filter((item: any) => item.type != undefined);

        for (let index = 0; index < dataFiltered.length; index++) {
            const element = dataFiltered[index];
            let accessDetId = element.access_det_id;
            if (!element.access_det_id) {
                if (!nextAccessDetId) {
                    const getDetId: any = await model.getNewAccessId();
                    accessDetId = getDetId[0].nextval + 1;
                    nextAccessDetId = accessDetId;
                }

                if (nextAccessDetId) {
                    accessDetId = nextAccessDetId + 1;
                    nextAccessDetId = accessDetId;
                }
            }

            syntax += `(${accessDetId},${element.m_insert || 0},${element.m_update || 0},${element.m_delete || 0},${
                element.m_view || 0
            },${accessId},${element.menu_header}, ${user})`;

            if (index !== dataFiltered.length - 1) {
                syntax += ', ';
            }

            if (index == dataFiltered.length - 1) {
                const upd = await model.updateAccess(syntax);
                await model.commitTransaction();
            }
        }
        return 'ok';
    } catch (error) {
        await model.rollback();
        return {
            error: {
                type: 'error',
                message: 'error',
                description: 'ERROR',
            },
        };
    }
};

export async function findOne(param: IForm) {
    return model.findOne(param);
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res);

        const session: any = await getLoginSession(req);
        if (!session) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }

        if (req.method !== 'POST') {
            return res.status(403).json({ message: 'Forbidden!' });
        }

        const data: any = await edit(req.body.data, session.id);

        if (data.error) {
            res.status(400).json({ status: 400, error: data.error.message });
        } else {
            return res.json({ status: 200, data });
        }
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export default protectAPI(handler);
