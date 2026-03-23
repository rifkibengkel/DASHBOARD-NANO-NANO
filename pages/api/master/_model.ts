import { exeQuery } from "../../../lib/db";

export const master = () => {
  const syntax = `SELECT row_number() over (ORDER BY A.id) AS "key", description AS value, description AS label, 'role' AS name
            FROM access A WHERE A.status = '1'`;
  return exeQuery(syntax, []);
};

export const prizes = () => {
  const syntax = `
    SELECT row_number() over (ORDER BY prize.id) AS "key", prize.name AS label, CONCAT(prize.id) as value, 'prizeName' AS name
    FROM prize GROUP BY prize.id`;
  return exeQuery(syntax, []);
};

export const prizeSizeMaster = () => {
  const syntax = `SELECT @rownum:=@rownum+1 AS 'key', size AS value, size AS label, 'itemSize' AS name
    FROM physic_size, (SELECT @rownum:=0) r GROUP BY size`;
  return exeQuery(syntax, []);
};

export const prizesEwallet = () => {
  const syntax = `
    SELECT row_number() over (ORDER BY prize.id) AS "key", prize.name AS label, CONCAT(prize.id) as value, 'prizeName' AS name
    FROM prize WHERE name_sub = 'evoucher' GROUP BY prize.id`;
  return exeQuery(syntax, []);
};

export const regions = () => {
  const syntax = `SELECT @rownum:=@rownum+1 AS 'key', CONCAT(regions.name) AS label, 
    id as value, 'regionName' AS name
FROM regions, (SELECT @rownum:=0) r`;
  return exeQuery(syntax, []);
};

export const store = () => {
  const syntax = `SELECT id AS "key", CONCAT(store."name") AS label, 
    id as value, 'storeName' AS name
FROM store
WHERE is_deleted = 0`;
  return exeQuery(syntax, []);
};

export const storeCity = () => {
  const syntax = `SELECT @rownum:=@rownum+1 AS 'key', id AS value, city AS label, 'storeCity' AS name, province 
    FROM store_city, (SELECT @rownum:=0) r`;
  return exeQuery(syntax, []);
};

export const districtCityMst = () => {
  const syntax = `SELECT row_number() over (ORDER BY city.id) AS "key", district.id AS value, CONCAT(district.name, ', ', city.name) AS label, 'district_id' AS name
    FROM district JOIN city ON district."cityId" = city.id`;
  return exeQuery(syntax, []);
};

export const rsa = () => {
  const syntax = `SELECT @rownum:=@rownum+1 AS 'key', id AS value, area AS label, 'rsa' AS name 
        FROM alfa_area, (SELECT @rownum:=0) r
        WHERE is_deleted = 0`;
  return exeQuery(syntax, []);
};

export const rsaByStore = (storeId: string) => {
  const syntax = `SELECT @rownum:=@rownum+1 AS 'key', id AS value, name AS label, 'rsa' AS name FROM store_rsa, (SELECT @rownum:=0) r
    WHERE store_id = $1`;
  return exeQuery(syntax, [storeId]);
};

export const invalidReason = () => {
  const syntax = `SELECT row_number() over (ORDER BY A.id) AS "key", id AS value, name AS label, 'invalidReason' AS name
    FROM invalid_reason A WHERE status = 1`;
  return exeQuery(syntax, []);
};

export const invalidReason2 = () => {
  const syntax = `SELECT row_number() over (ORDER BY A.id) AS "key", id AS value, name AS label, 'invalidReason' AS name
    FROM invalid_reason A WHERE status = 4`;
  return exeQuery(syntax, []);
};

export const alfaArea = () => {
  const syntax = `SELECT @rownum:=@rownum+1 AS 'key', id AS value, area AS label, 'alfaArea' AS name 
        FROM alfa_area, (SELECT @rownum:=0) r WHERE is_deleted = 0`;
  return exeQuery(syntax, []);
};

export const productCat = () => {
  let syntax = `SELECT 
    @rownum:=@rownum+1 AS 'key', id AS value, name AS label, 'productCategory' AS name 
    FROM variant_category, (SELECT @rownum:=0) r`;
  return exeQuery(syntax, []);
};

export const allProducts = (id: string) => {
  let syntax = `SELECT @rownum:=@rownum+1 AS 'key', id AS value, variant_name AS label, 'product' AS name 
        FROM variants, (SELECT @rownum:=0) r WHERE category = $1`;
  return exeQuery(syntax, [id]);
};

export const allProductsNR = () => {
  let syntax = `SELECT id AS "key", id AS value, name AS label, "product" AS name 
    FROM product`;
  return exeQuery(syntax, []);
};

export const invReasonKTP = () => {
  const syntax = `SELECT row_number() over (ORDER BY A.id) AS "key", id AS value, name AS label, 'reason' AS name
    FROM invalid_reason A WHERE A.status = 3`;
  return exeQuery(syntax, []);
};

export const chgPrzIfAv = (id: number) => {
  const syntax = `SELECT id AS value, NAME AS label, 'przType' AS name, id AS "key" FROM voucher WHERE amount = (SELECT amount FROM voucher WHERE id = $1)`;
  return exeQuery(syntax, [id]);
};

export const evoucherPick = () => {
  return exeQuery(
    `SELECT id AS value, name AS label, 'prizeId' AS name, id AS "key" FROM prize WHERE name_sub = 'evoucher'`,
    []
  );
};

export const programId = () => {
  const syntax = `SELECT value FROM general_parameter WHERE name = 'programId'`;
  return exeQuery(syntax, []);
};

export const masterPromos = () => {
  const syntax = `SELECT id AS value, name AS label, "promoId" AS name FROM promo A`;
  return exeQuery(syntax, []);
};

export const masterStore = () => {
  const syntax = `SELECT id AS value, name AS label, 'storeId' AS name FROM store`;
  return exeQuery(syntax, []);
};

export const getPromoName = (id: number) => {
  const syntax = id
    ? `SELECT name FROM promo WHERE id = $1`
    : `SELECT name FROM promo WHERE id = 1`;
  return exeQuery(syntax, [id]);
};

export const masterAgent = () => {
  const syntax = `SELECT id AS value, name AS label, 'agentId' AS name FROM agent ORDER BY id DESC`
  return exeQuery(syntax, [])
}
