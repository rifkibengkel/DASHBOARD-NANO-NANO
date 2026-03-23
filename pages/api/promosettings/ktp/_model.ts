import dayjs from "dayjs";
import {exeQuery} from "@/lib/db"
// import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export const parsingIdentity = (nomorNIK: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            nomorNIK = nomorNIK ? nomorNIK : '';
            if (nomorNIK.length == 16) {
                let thisYear = new Date().getFullYear().toString().substr(-2);
                let thisCode = nomorNIK.substr(-4);
                let thisRegion = {
                    provinceCode: nomorNIK.substr(0, 2),
                    regencyCode: nomorNIK.substr(0, 4),
                    districtCode: nomorNIK.substr(0, 6),
                    province: "",
                    regency: "",
                    district: ""
                }
                await exeQuery("SELECT name FROM district WHERE code = $1", [thisRegion.districtCode]).then((res: any) => { thisRegion.district = res.length < 1 ? "" : res[0].name })
                await exeQuery("SELECT name FROM city WHERE code = $1", [thisRegion.regencyCode]).then((res: any) => { thisRegion.regency = res.length < 1 ? "" : res[0].name })
                await exeQuery("SELECT name FROM province WHERE code = $1", [thisRegion.provinceCode]).then((res: any) => { thisRegion.province = res.length < 1 ? "" : res[0].name })
                let thisDate = {
                    hari: (parseInt(nomorNIK.substr(6, 2)) > 40) ? parseInt(nomorNIK.substr(6, 2)) - 40 : nomorNIK.substr(6, 2),
                    bulan: nomorNIK.substr(8, 2),
                    tahun: (parseInt(nomorNIK.substr(10, 2)) > 1 && nomorNIK.substr(10, 2) < thisYear) ? "20" + nomorNIK.substr(10, 2) : "19" + nomorNIK.substr(10, 2),
                    lahir: "",
                    age: "",
                    gender: (parseInt(nomorNIK.substr(6, 2)) > 40) ? "F" : parseInt(nomorNIK.substr(6, 2)) < 40 ? "M" : ""
                }
                thisDate.lahir = `${thisDate.tahun}-${thisDate.bulan}-${thisDate.hari}`
                thisDate.age = dayjs(thisDate.lahir).fromNow(true)
                const isValid = dayjs(thisDate.lahir, "YYYY-MM-DD")?.isValid() && thisRegion.province !== "" && thisRegion.regency !== "" && thisRegion.district !== "" ? true : false
                return resolve({
                    isValid,
                    nik: nomorNIK,
                    region: thisRegion,
                    date: thisDate,
                    uniq: thisCode,
                    _link: {
                        _wilayah: 'http://www.kemendagri.go.id/pages/data-wilayah'
                    }
                })
            } else {
                throw new Error(`Nomor NIK harus 16 digit`);
            }
        } catch (err) {
            console.log("err", err)
            // resolve.status(500).json({message: err.message})
        }
    })
}

export const checkDistrict = (code: string) => {
    return exeQuery("SELECT * FROM district WHERE code = $1", [code])
}

export const checkRegecy = (code: string) => {
    return exeQuery("SELECT * FROM city WHERE code = $1", [code])
}

export const checkProvince = (code: string) => {
    return exeQuery("SELECT * FROM province WHERE code = $1", [code])
}

export const insertProvince = (code: string, name: string) => {
    return exeQuery("INSERT INTO province(code,name) VALUES($1,$2)", [code, name])
}

export const insertRegency = (code: string, name: string, provinceId: number) => {
    return exeQuery(`INSERT INTO city(code,name,"provinceId") VALUES($1,$2,$3)`, [code, name, provinceId])
}

export const insertDistrict = (code: string, name: string, cityCode: number) => {
    return exeQuery(`INSERT INTO district(code,name,"cityId") VALUES($1,$2,$3)`, [code, name, cityCode])
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