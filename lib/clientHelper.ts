// import * as crypto from "crypto";
// import { getLoginSession } from '@/lib/auth';;
import { compare } from 'bcryptjs'

export const intOrZ = (value: string): number => {
    return value ? parseInt(value) : 0;
}

export async function verifyPwrd(password: string | undefined, hshPassword: string) {
    const isValid = await compare(password ? password : "", hshPassword)
    return isValid;
}

export const formatNumber = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const formatNumber2 = (number: number) => {
    if (number === undefined || number === null) {
        return null;
    } else {
        //   return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        let nf = new Intl.NumberFormat('en-US');
        return nf.format(number)
    }
};

export const randomString = (length: number, chars: any) => {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

export const changePhone = async (hp: string, pulsa?: boolean) => {
    const phone = hp.replace(/\D/g, '')
    if (pulsa && phone.substring(0, 2) == "62") {
        return (`0${phone.substring(2)}`)
    }

    if (phone.length < 6 || phone.length >= 15) {
        return ("")
    } else {
        if (phone.substring(0, 2) == "62") {
            return (phone)
        } else if (phone.substring(0, 2) == "08") {
            return (`62${phone.substring(1)}`)
        } else {
            return ("")
        }
    }
}

const range = (start: any, end: any) => {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
};

export const disabledDateTime = () => {
    return {
        disabledHours: () => range(0, 24).splice(4, 20),
        disabledMinutes: () => range(30, 60),
        disabledSeconds: () => [55, 56],
    };
};

export const titleCase = (str: any) => {
    if (/[A-Z]/.test(str)) {
        let strg = str.replace(/([A-Z])/g, " $1")
        let splitStr = strg.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join(' ');
    } else {
        let strg = str.replace(/_/g, ' ')
        let splitStr = strg.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join(' ');
    }
}