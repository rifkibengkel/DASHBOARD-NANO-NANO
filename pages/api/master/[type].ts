import type { NextApiRequest, NextApiResponse } from 'next'
import { getLoginSession } from '@/lib/auth';
import { pagination, hashPassword } from "../../../lib/serverHelper";
import * as model from "./_model";
import protectAPI from "../../../lib/protectApi";
import Cors from "../../../lib/cors";

export async function getCatProducts() {
    const listCatProducts: any = model.productCat()
    return listCatProducts
}

export async function getProductsByCat(id: string) {
    const list: any = model.allProducts(id)
    return list
}

export const rsaByStore = (storeId: string) => {
    return model.rsaByStore(storeId);
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Cors(req, res)

        let cat: any = req.query.category ? req.query.category : ''
        let rsaId: any = req.query.id ? req.query.id : ''
        const session: any = await getLoginSession(req)
        if (!session) {
            return res.status(401).json({message: "Unauthorized!"})
        }

        if (req.method !== 'GET') {
            return res.status(403).json({message: "Forbidden!"})
        } else if(!req.query) {
            return res.status(403).json({message: "Unknown Type!"})
        }

        if(req.query.type === "rsa") {
            if(req.query.id) {
                const data = await rsaByStore(rsaId)
                return res.json(data)
            }
        }
         else if(req.query.type === "products") {
            if(!req.query.category) {
                const data = await getCatProducts()
                return res.json(data)
            } else {
                const data = await getProductsByCat(cat)
                return res.json(data)
            }
            
        }       
    } catch (err: any) {
        res.status(500).json({message: err.message})
    }
}

export default protectAPI(handler);

