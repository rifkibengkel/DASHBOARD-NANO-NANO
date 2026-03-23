export interface IState {
  fallback: {
    "/api/entries/list": Data;
  };
  data: Data;
  // promoId: number
  dataDetail: {};
  columns: [];
  access: Access;
  isLoading: boolean;
  openModal: boolean;
  modalFilter: boolean;
  typeModal: string;
  dataModal: {};
  filter: Filter;
  master: {
    table: string[];
    role: string[];
    productCategory: string[];
    product: string[];
    isAdmin: boolean;
  };
}

export interface IStateLeaderboard {
  data: DataLeaderboard;
  dataDetail: {};
  columns: [];
  access: Access;
  isLoading: boolean;
  openModal: boolean;
  modalFilter: boolean;
  modalReject: boolean;
  typeModal: string;
  dataModal: {};
  filter: Filter;
  master: {
    periode: string[];
  };
}

interface Access {
  m_insert: number;
  m_update: number;
  m_delete: number;
  m_view: number;
}

interface Data {
  dataPerPage: string | number;
  currentPage: string | number;
  totalData: string | number;
  totalPage: string | number;
  list: any;
  key: string | null;
}

interface DataLeaderboard {
  listPeriode: any;
  result: any;
  periode: any;
}

interface Filter {
  key: string;
  directions: string;
  columns: string;
  startDate: string;
  endDate: string;
  media: string;
  isValid: string;
  isValidAdmin: string;
  isApprovedAdmin: string;
  periode: string;
  storeId: string;
}

export interface modalState {
  data: {
    username: string;
    password: string;
    name: string;
    role: number | string;
    id: number | string;
  }[];
  isLoading: boolean;
  oldId: string | undefined;
  role: string[];
  pickedCat: string | undefined;
  pickedProd: string | undefined;
  quantity: string | undefined;
  pricePerItem: string | undefined;
  total: string | undefined;
  id: string | undefined;
  master: {
    productsCat: ICategoryProduct[];
    productsByCat: ICategoryProduct[];
  };
}

// export interface filteringState {
//     form: {
//         username: string,
//         password: string
//         name: string
//         role: number | string
//         id: number | string
//     }[],
//     data: []
//     master: {}
//     isLoading: boolean
//     oldId: string | undefined
//     role: string[],
//     id: string | undefined
// }

export interface IPagination {
  row: string | number;
  page: string | number;
  key: string;
  direction: string;
  column: string;
  limit: number | string;
  media: string;
  startDate: string;
  endDate: string;
  isValid: string | number;
  isValidAdmin: string | number;
  isApprovedAdmin: string | number;
  type?: string;
  status?: string;
  prize?: string;
  prizeId?: string;
  isHaveAtt?: string | number;
  typeUser?: string;
  storeId?: string;
}

export interface IPaginationMongo {
  row: string | number;
  page: string | number;
  key: string;
  direction: string;
  column: string;
  limit: number | string;
  isApproved: string | number;
}

export interface form {
  entryId: string | undefined;
  fullname: string | undefined;
  name: string | undefined;
  email: string | undefined;
  media: string | undefined;
  idNumber: string | undefined;
  handphone: string | undefined;
  sender: string | undefined;
  regency: string | undefined;
  rcvd_time: string | undefined;
  purchaseDateInput: string | undefined;
  storeInput: string | undefined;
  message: string | undefined;
  purchaseDate: string | undefined;
  purchaseTime: string | undefined;
  storeId: number | string | undefined;
  storeName: string | undefined;
  storeNameAdmin: string | undefined;
  storeType: string | undefined;
  storeCity: string | undefined;
  storeArea: string | undefined;
  storeProvince: string | undefined;
  alfaArea: string | undefined;
  rsa: string | undefined;
  storeReceipt: string | undefined;
  url: string | undefined;
  storeGenuineStruct: string | undefined;
  isValid: boolean | undefined;
  isInvalid: boolean | undefined;
  prizeName: string | number;
  prizeAmount: string | number;
  variant: IVariant;
  ktpName?: string | undefined;
  ktpNumber?: string | undefined;
  coupon?: string | undefined;
  prizeType?: number | string | undefined;
  user_type: string;
  promoId: number | string;
  prizeId: number | string;
  account_number: string | number | undefined;
  voucherNumber: string | number | undefined;
  ktpAddress?: string | undefined;
  itemSize: string | undefined;
  code_size: string | undefined;
  totalPoint?: string | number
}

export interface form2 {
  promoId: string | number | undefined;
  entryId: string | undefined;
  grosirName?: string | undefined;
  grosirHp?: string | undefined;
  grosirAddress?: string | undefined;
  dName: string | undefined;
  dHp: string | undefined;
  dAddress: string | undefined;
  isValid: boolean | undefined;
  isInvalid: boolean | undefined;
  prizeType?: number | string | undefined;
  url: string | undefined;
  prizeId: number | string;
  message: string | undefined;
}

export interface IFormError {
  error: boolean;
  errorField: string;
  errorMessage: string;
}

export interface IMaster {
  images?: [];
  store: IMasterStore[];
  storeCity: IMasterStoreCity[];
  rsa: IRSA[];
  alfaArea: IAlfaArea[];
  productsByCat: string[];
  invalidReason: IInvReason[];
  prizeChange?: IInvReason[];
  districts: string[];
  prizeSAP: string[];
  sizes: string[];
}

export interface ICategoryProduct {
  key: string;
  label: string;
  value: string;
  name: string;
}

interface IVariant {
  value: string;
  name: string;
  qty: string | number;
  amount: string | number;
}

interface IRSA {
  key: string;
  label: string;
  value: string;
  name: string;
}

export interface IAlfaArea {
  key: string;
  label: string;
  value: string;
  name: string;
}

export interface IInvReason {
  key: string;
  label: string;
  value: string;
  name: string;
}

export interface IMasterStore {
  key: string;
  label: string;
  value: string;
  name: string;
  receiptPhoto: string;
  city: string;
  area: string;
}

export interface IMasterStoreCity {
  key: string;
  label: string;
  value: string;
  name: string;
  province: string;
}

export interface IDataEntry {
  backFilter: IPagination;
  approveMode?: boolean;
  approve2Mode?: boolean;
  access: Access;
  form: form;
  formError: IFormError;
  isLoading: boolean;
  modalAdd: boolean;
  modalType: string;
  modalReject: boolean;
  modalShipment: boolean;
  modalAddItem: boolean;
  modalCompare: boolean;
  modalAttachments?: boolean;
  master: IMaster;
  dataTable: EntryTable[];
  totalAmount: number;
  editList: {};
  entryCondition: invCond;
  invalid_reason: string;
  isChecked: boolean;
  jotf: string;
  jotfToken: string;
  approval: string | number;
  profileId: number | string;
}

export interface IDataEntry2 {
  backFilter: IPagination;
  approveMode?: boolean;
  approve2Mode?: boolean;
  access: Access;
  form: form2;
  formError: IFormError;
  isLoading: boolean;
  modalAdd: boolean;
  modalType: string;
  modalReject: boolean;
  modalShipment: boolean;
  modalAddItem: boolean;
  modalCompare: boolean;
  modalAttachments?: boolean;
  master: IMaster;
  dataTable: EntryTable[];
  totalAmount: number;
  editList: {};
  entryCondition: invCond;
  invalid_reason: string;
  isChecked: boolean;
  jotf: string;
  jotfToken: string;
  profileId: number | string;
}

interface invCond {
  invalidId: number | undefined;
  duplicateImg: [];
  invalidReason: string | undefined;
  isDuplicate: number;
  isValid: string | number;
  replyId: number;
}

interface EntryTable {
  catId: number;
  prodId: number;
  index: number;
  quantity: number;
  name: string;
  price: number;
  totalPrice: number;
}

export interface formModal {
  pickedCat: string | undefined;
  pickedProd: string | undefined;
  quantity: string | undefined;
  pricePerItem: string | undefined;
  total: string | undefined;
  id: string | undefined;
}

export interface SaveDataEntry {
  entryId: any;
  trx: any;
  purchaseDate: any;
  totalAmount: any;
  isValid: any;
  // replyId: number;
  invalidId: number;
  // storeNameAdmin: any;
  storeId: any;
  // storeCity: any;
  // storeProvince: any;
  // alfaArea: any;
  // rsa: any;
  name: string;
  handphone: string;
  regency: string;
  userId: string;
}

export interface leaderboard {
  periode: string;
  session: {
    username: string;
    fullname: string;
    role: string;
  };
}

export interface IApproval {
  leaderboard: Ileaderboard;
  session: {
    username: string;
    fullname: string;
    role: string;
  };
}

export interface Ileaderboard {
  profile_id?: string;
  purchaseTotal: number;
  transactionTotal: number;
  status: number;
  desc_reject: string;
  periode: number;
  startDate?: string;
  hp?: number;
  prizeUid?: string;
  prize?: number;
  leaderboardId?: string;
  store_id: string;
}
