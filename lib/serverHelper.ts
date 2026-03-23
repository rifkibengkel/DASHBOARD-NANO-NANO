// import * as crypto from "crypto";
// import { getLoginSession } from '@/lib/auth';;
import { addTrx } from "@/pages/api/validatore/_modello";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { compare, hash } from "bcryptjs";
import dayjs from "dayjs";
import nodemailer from "nodemailer";
import { exeQuery } from "./db";
const saltOrRounds = 10;

const SERVICE_IMAGE_URL = process.env.SERVICE_IMAGE_URL || "";

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_BUCKET_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const intOrZ = (value: string): number => {
  return value ? parseInt(value) : 0;
};

export const chartType: any = {
  CHART: 1,
  DATA: 2,
  ALL: 3,
};

export const chartCondition: any = {
  DAILY: 1,
  WEEKLY: 2,
  MONTHLY: 3,
  HOURLY: 4,
};

export async function verifyPwrd(
  password: string | undefined,
  hshPassword: string
) {
  const isValid = await compare(password ? password : "", hshPassword);
  return isValid;
}

export const sortMenu = async (menu: any) => {
  let a = [];
  let tempHeader = null;
  let tempHeaderIndex = 0;
  let tempLevel = 0;
  let tempData = [];
  let pushCount: any = null;

  for (let index = 0; index < menu.length; index++) {
    const menu_header = menu[index].menu_header;
    const level = parseInt(menu[index].level);
    const sub = menu[index].sub;

    if (tempHeader != menu_header && tempHeader != sub) {
      tempHeader = menu_header;
      tempLevel = level;
      tempData = [];
      tempHeaderIndex = pushCount == null ? 0 : pushCount + 1;

      if (sub == 0) {
        a.push(menu[index]);
        pushCount = pushCount == null ? 0 : pushCount + 1;
      }
    }

    if (tempHeader == sub) {
      tempData.push(menu[index]);
    }

    if (
      (tempHeader != menu_header && tempHeader != null) ||
      index == menu.length - 1
    ) {
      Object.assign(a[pushCount], { [`subMenu${tempLevel + 1}`]: tempData });
    }
  }

  return a;
};

export const numberFormat = (value: number, mode: number) => {
  return mode === 2
    ? value - 1
    : (value + 1).toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      });
};

export const weekRange = (date: string) => {
  let currentDate = dayjs(date);
  let weekStart = currentDate.startOf("isoWeek").format("DD MMM YYYY");
  let weekEnd = currentDate.endOf("isoWeek").format("DD MMM YYYY");
  return weekStart + " - " + weekEnd;
};

export const pageCheck = async (username: string, path: string) => {
  // const sessionDec = JSON.parse(await cryptoDecrypt(session.user));
  // const path = page.substring(1)

  const syntax = `SELECT A.id menu_header, A.description menu, A.path, A.level, A.header sub, B.m_insert, B.m_update, B.m_delete, B.m_view, C.id AS role
    FROM menu A,
        access_det B,
        access C,
        user_mobile D
    WHERE A.id = B."menuId"
        AND B."accessId" = C.id
        AND C.id = D."accessId"
        AND D.username = $1 AND A.path = $2 AND B.m_view = 1`;

  const result: any = await exeQuery(syntax, [username, path]);

  if (result.length < 1) {
    return [];
  }

  return result;
};

export const pagination = async (
  page: number,
  row: number,
  totalRow: number
) => {
  //MySQL
  // const dataPerPage = row;
  // const totalPage = Math.ceil(totalRow / dataPerPage);
  // const currentPage = page == 0 ? 1 : page;
  // const firstData = dataPerPage * currentPage - dataPerPage;

  // return {
  //     query: `LIMIT ${firstData},${dataPerPage}`,
  //     dataPerPage: dataPerPage,
  //     totalPage: totalPage,
  //     currentPage: currentPage,
  //     totalData: totalRow,
  // };

  // Postgre
  const dataPerPage = row;
  const totalPage = Math.ceil(totalRow / dataPerPage);
  const currentPage = page == 0 ? 1 : page;
  const firstData = dataPerPage * currentPage - dataPerPage;

  return {
    query: `LIMIT ${dataPerPage} OFFSET ${firstData}`,
    dataPerPage: dataPerPage,
    totalPage: totalPage,
    currentPage: currentPage,
    totalData: totalRow,
  };
};

export const paginationMongo = async (
  page: number,
  row: number,
  totalRow: number
) => {
  const dataPerPage = row;
  const totalPage = Math.ceil(totalRow / dataPerPage);
  const currentPage = page == 0 ? 1 : page;
  const firstData = dataPerPage * currentPage - dataPerPage;

  return {
    limit: dataPerPage,
    skip: firstData,
    dataPerPage: dataPerPage,
    totalPage: totalPage,
    currentPage: currentPage,
    totalData: totalRow,
  };
};

export const formatNumber = (number: number) => {
  if (number === undefined || number === null) {
    return null;
  } else {
    //   return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    let nf = new Intl.NumberFormat("en-US");
    return nf.format(number);
  }
};

export const hashPassword = async (string: string | undefined) => {
  const hashPassword = await hash(string ? string : "", saltOrRounds);
  return hashPassword;
};

export const changePhone = async (hp: string, pulsa?: boolean) => {
  const phone = hp.replace(/\D/g, "");
  if (pulsa && phone.substring(0, 2) == "62") {
    return `0${phone.substring(2)}`;
  }

  if (phone.length < 6 || phone.length >= 15) {
    return "";
  } else {
    if (phone.substring(0, 2) == "62") {
      return phone;
    } else if (phone.substring(0, 2) == "08") {
      return `62${phone.substring(1)}`;
    } else {
      return "";
    }
  }
};

export const getGeneralParameterById = (id: number) => {
  let syntax = `SELECT description, param FROM general_parameter WHERE status = 1 AND id = ?`;
  return exeQuery(syntax, [id]);
};

export const parsingIdentity = async (
  identity: string
): Promise<{
  identity: string;
  idType: number;
  province: string;
  regency: string;
  district: string;
  gender: string;
  birthdate: string;
  age: string;
}> => {
  const clearIdentity = identity.replace(/\D/g, "");
  if (clearIdentity.length != 16) {
    return {
      identity: clearIdentity,
      idType: 0,
      province: "0",
      regency: "0",
      district: "0",
      gender: "",
      birthdate: "0000-00-00",
      age: "0",
    };
  } else {
    const codeAre = clearIdentity.substring(0, 6);
    const codeProvince = clearIdentity.substring(0, 2);
    const codeRegncy = clearIdentity.substring(0, 4);
    const codeDistrict = clearIdentity.substring(0, 6);
    const bornDate =
      parseInt(clearIdentity.substring(6, 8)) > 40
        ? parseInt(clearIdentity.substring(6, 8)) - 40
        : clearIdentity.substring(6, 8);
    const gender =
      clearIdentity == ""
        ? ""
        : parseInt(clearIdentity.substring(6, 8)) > 40
        ? "F"
        : parseInt(clearIdentity.substring(6, 8)) < 40
        ? "M"
        : "";
    const yearNow = String(new Date().getFullYear()).substring(2, 4);
    const bornYear =
      parseInt(clearIdentity.substring(10, 12)) > parseInt(yearNow) ? 19 : 20;
    let birthDate =
      clearIdentity.length < 16 ||
      parseInt(clearIdentity.substring(8, 10)) > 12 ||
      (bornDate as number) > 31
        ? "0000-00-00"
        : bornYear +
          clearIdentity.substring(10, 12) +
          "-" +
          clearIdentity.substring(8, 10) +
          "-" +
          bornDate;
    birthDate = dayjs(birthDate).isValid() ? birthDate : "0000-00-00";
    // const ages = dayjs(birthDate, "YYYY").fromNow().replace(" years ago" || " months ago" || " days ago", "");
    const ages = dayjs(birthDate).isValid()
      ? dayjs().diff(birthDate, "years", false).toString()
      : "Invalid date";
    const age =
      ages === "Invalid date"
        ? "0"
        : ages.length > 2
        ? "0"
        : birthDate == null
        ? "0"
        : ages;
    const area: any = await exeQuery(
      `SELECT province.name province,city.name regency,district.name district FROM province,city,district WHERE province.id = city."provinceId" AND city.id = district."cityId" AND district.code= $1`,
      [codeAre]
    );
    if (area.length < 1 || birthDate == "0000-00-00") {
      return {
        identity: clearIdentity,
        idType: 0,
        province: "0",
        regency: "0",
        district: "0",
        gender: gender,
        birthdate: birthDate,
        age: age,
      };
    } else {
      return {
        identity: clearIdentity,
        idType: 1,
        province: codeProvince,
        regency: codeRegncy,
        district: codeDistrict,
        gender: gender,
        birthdate: birthDate,
        age: age,
      };
    }
  }
};

export const csvMaker = (data: any) => {
  const items = data;
  const replacer = (key: string, value: any) => (value === null ? "" : value); // specify how you want to handle null values here
  const header = Object.keys(items[0]);
  const csv = [
    header.join(";"), // header row first
    ...items.map((row: any) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(";")
    ),
  ].join("\r\n");

  return csv;
};

export const titleCase = (str: any) => {
  if (/[A-Z]/.test(str)) {
    let strg = str.replace(/([A-Z])/g, " $1");
    let splitStr = strg.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
  } else {
    let strg = str.replace(/_/g, " ");
    let splitStr = strg.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
  }
};

export const randomString = async (length: number, chars: any) => {
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

export const loadExcel = (file: string) => {
  // return new Promise((resolve, reject) => {
  //     var wb = XLSX.readFile(file);
  //     const data: any = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  //     let jsonData: any = []
  //     for (let index = 0; index < data.length; index++) {
  //         let obj: any = {}
  //         for (let index2 = 0; index2 < data[index].length; index2++) {
  //             obj[data[0][index2].replace(/\s/g, '')] = data[index][index2]
  //         }
  //         if (index > 0) {
  //             jsonData.push(obj)
  //         }
  //     }
  //     resolve(jsonData)
  // })
};

export const validateUploadS3 = async (key: string, image: string) => {
  // Handle base64 string - remove data URL prefix if present
  let getBase64Str = image.includes(",")
    ? image.substring(image.indexOf(",") + 1)
    : image;
  const getBuffer = Buffer.from(getBase64Str, "base64");

  const setUpload = new Upload({
    client: s3Client,
    params: {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: getBuffer,
      ContentType: "image/jpeg",
      // Remove ACL to keep files private, we'll serve them via API
    },
  });

  return await setUpload.done();
};

export const validateGetS3 = async (key: string) => {
  const getData = await s3Client.send(
    new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    })
  );

  const getImage = (await getData?.Body?.transformToString("base64")) as string;

  const getBuffer = Buffer.from(getImage, "base64");

  return getBuffer;
};

const htmlStr1 = (
  name: string,
  sender: string,
  imgSets: any[],
  rcvd_time: string
) => {
  return `<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Notification</title>
<style>
    body {
        font-family: Arial, sans-serif;
    }
    .container {
        padding: 20px;
    }
    .header {
        font-size: 24px;
        margin-bottom: 10px;
        font-weight: bold;
    }
    .content {
        font-size: 16px;
        margin-bottom: 20px;
    }
    .image-container {
        text-align: center;
        margin-bottom: 20px;
    }
    .image-container img {
        max-width: 100%;
        height: auto;
    }
    .footer {
        font-size: 14px;
    }
</style>
</head>
<body>
<div class="container">
    <div class="header">Hai Fellas!</div>
    <div class="content">
        ${name} - ${sender}
    </div>
    <div class="image-container">
        ${imgSets.map((x: any) => `<img src="cid:${x}" alt="Image">`).join("")}
        
    </div>
    <div class="content">
        Terima kasih, struk yang kamu kirimkan pada tanggal ${dayjs(
          rcvd_time
        ).format(
          "DD/MM/YYYY"
        )} VALID. Selamat kamu mendapatkan nomor kupon undian dan berkesempatan untuk memenangkan Grand Prize dalam program “Shop & Win Serbu Hadiah Seru Petualang Nano Nano”
    </div>
    <div class="footer">
        Ayo, terus beli produk dari Petualang Nano Nanoe dan menangkan hadiahnya!
    </div>
</div>
</body>
</html>`;
};

const htmlStr2 = (name: string, sender: string) => {
  return `<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Notification</title>
<style>
    body {
        font-family: Arial, sans-serif;
    }
    .container {
        padding: 20px;
    }
    .header {
        font-size: 24px;
        margin-bottom: 10px;
        font-weight: bold;
    }
    .content {
        font-size: 16px;
        margin-bottom: 20px;
    }
    .image-container {
        text-align: center;
        margin-bottom: 20px;
    }
    .image-container img {
        max-width: 100%;
        height: auto;
    }
    .footer {
        font-size: 14px;
    }
</style>
</head>
<body>
<div class="container">
    <div class="header">Hai Fellas!</div>
    <div class="content">
        ${name} - ${sender}
    </div>
    <div class="content">
        Selamat! Kamu terpilih sebagai 100 orang pertama yang mengikuti undian Petualang Nano Nanoe dan berhasil memenangkan E-Wallet sebesar Rp. 100.000,-.
        <br/><br/>
        Segera ambil hadiah kamu dengan cara mengisi format data pribadi berikut:
        <br/>
        1. Nama lengkap
        <br/>
        2. Pilihan hadiah (OVO atau GoPay)
        <br/>
        3. Nomor telpon terhubung dengan akun (OVO atau GoPay)
        <br/><br/>
        Mohon sertakan juga Foto KTP dan Foto Kartu Keluarga kamu (Penyelenggara akan membayarkan pajak hadiah, untuk itu pemenang WAJIB mengirimkan data valid sesuai KTP nama lengkap dan Nomor Induk Kependudukan (NIK). Jika pemenang tidak bisa memberikan data valid (nama sesuai KTP dan no KTP/NIK) atau data belum tercatat sesuai data di DITJEN DUKCAPIL KEMENDAGRI maka pihak penyelenggara tidak dapat melaporkan pembayaran pajak hadiah ke DITJEN Pajak). Kirim ke nomor WhatsApp Official Redbox <b>0812 3000 0877</b> dalam waktu 7x24 jam.
        <br/><br/>
        Pastikan nomor akun (OVO atau GoPay) kamu aktif ya Fellas!
        <br/><br/>
        Jika dalam jangka waktu yang telah di tentukan kamu tidak mengirimkan Format diatas maka hadiah kamu akan dinyatakan hangus.
    </div>
    <div class="footer">
        Ayo, kirimkan Format Data Pribadi, Foto KTP dan Foto Kartu Keluarga kamu sekarang!
    </div>
</div>
</body>
</html>`;
};

const htmlStr3 = (name: string, sender: string) => {
  return `<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Notification</title>
<style>
    body {
        font-family: Arial, sans-serif;
    }
    .container {
        padding: 20px;
    }
    .header {
        font-size: 24px;
        margin-bottom: 10px;
        font-weight: bold;
    }
    .content {
        font-size: 16px;
        margin-bottom: 20px;
    }
    .image-container {
        text-align: center;
        margin-bottom: 20px;
    }
    .image-container img {
        max-width: 100%;
        height: auto;
    }
    .footer {
        font-size: 14px;
    }
</style>
</head>
<body>
<div class="container">
    <div class="header">Hai Fellas!</div>
    <div class="content">
        ${name} - ${sender}
    </div>
    <div class="content">
        Batas waktu mengirimkan Format Data Pribadi, Foto KTP dan Foto Kartu Keluarga kamu telah berakhir. Sesuai dengan ketentuan yang telah disebutkan sebelumnya, Kamu diberikan waktu 7x24 jam untuk kirim kelengkapan data ke nomor WhatsApp Official Redbox <b>0812 3000 0877</b>.
        <br/><br/>
        Karena kami belum menerima Data Pribadi, Foto KTP dan Foto Kartu Keluarga kamu dalam waktu yang telah ditentukan, dengan berat hati kami menyatakan bahwa hadiah kamu telah dinyatakan hangus.
        <br/><br/>
        Terima kasih atas partisipasi kamu dalam undian Petualang Nano Nanoe.
        <br/><br/>
        Jika kamu memiliki pertanyaan lebih lanjut atau memerlukan informasi tambahan, jangan ragu untuk menghubungi kami melalui Call Center 021-39738362 atau live chat https://bit.ly/chat-Petualang Nano Nanoe (Senin - Jum'at 08:00 - 17:00 WIB).
    </div>
    <div class="footer">
        Ayo, terus beli produk dari Petualang Nano Nanoe dan menangkan hadiahnya!
    </div>
</div>
</body>
</html>`;
};

const htmlStr4 = (name: string, sender: string, prizeType: string) => {
  return `<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Notification</title>
<style>
    body {
        font-family: Arial, sans-serif;
    }
    .container {
        padding: 20px;
    }
    .header {
        font-size: 24px;
        margin-bottom: 10px;
        font-weight: bold;
    }
    .content {
        font-size: 16px;
        margin-bottom: 20px;
    }
    .image-container {
        text-align: center;
        margin-bottom: 20px;
    }
    .image-container img {
        max-width: 100%;
        height: auto;
    }
    .footer {
        font-size: 14px;
    }
</style>
</head>
<body>
<div class="container">
    <div class="header">Hai Fellas!</div>
    <div class="content">
        ${name} - ${sender}
    </div>
    <div class="content">
        Selamat! Hadiah E-Wallet ${prizeType} sebesar Rp.100.000,- telah berhasil kami kirimkan ke akun kamu. Mohon segera cek akun kamu untuk memastikan bahwa hadiah telah diterima.
        <br/><br/>
       Jika kamu mengalami kendala atau memiliki pertanyaan, jangan ragu untuk menghubungi kami melalui Call Center 021-39738362 atau live chat https://bit.ly/chat-Petualang Nano Nanoe (Senin - Jum'at 08:00 - 17:00 WIB).
    </div>
    <div class="footer">
        Ayo, terus beli produk dari Petualang Nano Nanoe dan menangkan hadiah menarik lainnya!
    </div>
</div>
</body>
</html>`;
};

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendCouponToMail = async (
  name: string,
  sender: string,
  imgSets: any[],
  rcvd_time: string,
  emailTgt: string,
  mailAttachments: any[],
  winnerId?: string
) => {
  let htmlStructure = htmlStr1(name, sender, imgSets, rcvd_time);
  const sendMel = await transporter
    .sendMail({
      from: process.env.MAIL_FROM, // sender address
      to: emailTgt, // list of receivers
      // to: 'marselljonathan@gmail.com',
      subject: "[Microsite Petualang Nano Nanoe] - Informasi Nomor Undian", // Subject line
      // text: "Hello world", // plain text body
      html: htmlStructure,
      attachments: mailAttachments,
    })
    .then(async () => await addTrx(winnerId ?? "", emailTgt, "Send Coupon"));
};

export const send100ToMail = async (
  name: string,
  sender: string,
  emailTgt: string,
  winnerId: string
) => {
  let htmlStructure = htmlStr2(name, sender);
  const sendMel = await transporter
    .sendMail({
      from: process.env.MAIL_FROM, // sender address
      to: emailTgt, // list of receivers
      // to: 'marselljonathan@gmail.com',
      subject:
        "[Microsite Petualang Nano Nanoe] - Segera Kirim Data Pribadi! Klaim Hadiah Kamu Sekarang!", // Subject line
      // text: "Hello world", // plain text body
      html: htmlStructure,
    })
    .then(async () => await addTrx(winnerId, emailTgt, "First 100"));
};

export const send100ToMailFailed = async (
  name: string,
  sender: string,
  emailTgt: string,
  winnerId?: string
) => {
  let htmlStructure = htmlStr3(name, sender);
  const sendMel = await transporter
    .sendMail({
      from: process.env.MAIL_FROM, // sender address
      to: emailTgt, // list of receivers
      // to: 'marselljonathan@gmail.com',
      subject:
        "[Microsite Petualang Nano Nanoe] - Hadiah Kamu Telah Dinyatakan Hangus!", // Subject line
      // text: "Hello world", // plain text body
      html: htmlStructure,
    })
    .then(
      async () => await addTrx(winnerId || "", emailTgt, "First 100 Failed")
    );
};

export const send100ToMailSuccess = async (
  name: string,
  sender: string,
  emailTgt: string,
  prizeType: string,
  winnerId?: string
) => {
  let htmlStructure = htmlStr4(name, sender, prizeType);
  const sendMel = await transporter
    .sendMail({
      from: process.env.MAIL_FROM, // sender address
      to: emailTgt, // list of receivers
      // to: 'marselljonathan@gmail.com',
      subject: "[Microsite Petualang Nano Nanoe] - Hadiah Kamu Telah Dikirim!", // Subject line
      // text: "Hello world", // plain text body
      html: htmlStructure,
    })
    .then(
      async () => await addTrx(winnerId ?? "", emailTgt, "First 100 Completed")
    );
};
