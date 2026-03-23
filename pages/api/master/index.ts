import * as model from "./_model";
import * as modelDshb from "../dashboard/_model";

export const masterRole = () => {
  return model.master();
};

export const masterStore = () => {
  return model.store();
};

export const masterPrizes = () => {
  return model.prizesEwallet();
};

export const masterRegions = () => {
  return model.regions();
};

export const masterInvReasonEntry = () => {
  return model.invalidReason();
};

export const masterInvReasonEntry2 = () => {
  return model.invalidReason2();
};

export const masterStoreCity = () => {
  return model.storeCity();
};

export const masterDistrictCity = () => {
  return model.districtCityMst();
};

export const rsaByStore = (storeId: string) => {
  return model.rsaByStore(storeId);
};

export const masterAlfaArea = () => {
  return model.alfaArea();
};

export async function getProductsCat() {
  return model.productCat();
}

export async function getProductsByCat(id: string) {
  return model.allProducts(id);
}

export async function getAllProducts() {
  return model.allProductsNR();
}

export async function getInvalidReasonSummary() {
  return modelDshb.getInvalidReason();
}

export async function rejReasonKTP() {
  return model.invReasonKTP();
}

export const masterPrizeSize = () => {
  return model.prizeSizeMaster();
};

export async function changePrizeIfAvail(id: number) {
  return model.chgPrzIfAv(id);
}

export async function eVoucherPick() {
  return model.evoucherPick();
}

export const getProgramId = () => {
  return model.programId();
};

export const getMasterPromo = () => {
  return model.masterPromos();
};

export const getMasterStore = () => {
  return model.masterStore();
};

export function titleCase(str: any) {
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
}
