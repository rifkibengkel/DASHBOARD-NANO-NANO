export interface IState {
    fallback: {
        '/api/livechat/list': Data
    },
    data: Data,
    // promoId: number 
    dataDetail: {},
    columns: [],
    access: Access
    isLoading: boolean,
    openModal: boolean,
    modalFilter: boolean,
    typeModal: string,
    dataModal: {}
    filter: Filter,
    master: {
        table: string[],
        role: string[],
        productCategory: string[],
        product: string[],
        isAdmin: boolean
    }
}

export interface IStateLeaderboard {
    data: DataLeaderboard;
    dataDetail: {};
    columns: [];
    access: Access
    isLoading: boolean;
    openModal: boolean;
    modalFilter: boolean;
    modalReject: boolean;
    typeModal: string;
    dataModal: {}
    filter: Filter;
    master: {
        periode: string[]
    }
}

interface Access {
    m_insert: number
    m_update: number
    m_delete: number
    m_view: number
}

interface Data {
    dataPerPage: string | number
    currentPage: string | number
    totalData: string | number
    totalPage: string | number
    list: any
    key: string | null
} 

interface DataLeaderboard {
    listPeriode: any
    result: any
    periode: any
} 

interface Filter {
    key: string;
    directions: string;
    columns: string
    startDate: string;
    endDate: string;
    media: string;
    isValid: string;
    isValidAdmin: string;
    isApprovedAdmin: string;
    periode: string;
    agentId: string;
}

export interface modalState {
    data: {
        username: string,
        password: string
        name: string
        role: number | string
        id: number | string
    }[],
    isLoading: boolean
    oldId: string | undefined
    role: string[],
    pickedCat: string | undefined
    pickedProd: string | undefined
    quantity: string | undefined
    pricePerItem: string | undefined
    total: string | undefined
    id: string | undefined
}

export interface IPagination {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    startDate: string
    endDate: string
    type?: string
    status?: string
    prize?: string
    prizeId?: string
    isHaveAtt?: string | number
    typeUser?: string
    storeId?: string
    agentId?: string | number
}

export interface form {
    entryId: string | undefined
    name: string | undefined
    email: string | undefined
    media: string | undefined
    idNumber: string | undefined
    handphone: string | undefined
    sender: string | undefined
    regency: string | undefined
    rcvd_time: string | undefined
    purchaseDateInput: string | undefined
    storeInput: string | undefined
    message: string | undefined
    purchaseDate: string | undefined
    purchaseTime: string | undefined
    storeId: number | string | undefined
    storeName: string | undefined
    storeNameAdmin: string | undefined
    storeType: string | undefined
    storeCity: string | undefined
    storeArea: string | undefined
    storeProvince: string | undefined
    alfaArea: string | undefined
    rsa: string | undefined
    storeReceipt: string | undefined
    url: string | undefined
    storeGenuineStruct: string | undefined
    isValid: boolean | undefined
    isInvalid: boolean | undefined
    prizeName: string | number
    prizeAmount: string | number
    ktpName?: string | undefined
    ktpNumber?: string | undefined
    coupon?: string | undefined
    prizeType?: number | string | undefined
    user_type: string
    promoId: number | string
    prizeId: number | string
    account_number: string | number | undefined
    voucherNumber: string | number | undefined
    uniqueCode: string | undefined
}

export interface IDataAgent {
    backFilter: IPagination
    approveMode?: boolean
    approve2Mode?: boolean
    access: Access
    form: form
    isLoading: boolean
    modalAdd: boolean
    modalType: string
    modalReject: boolean
    modalShipment: boolean
    modalAddItem: boolean
    modalCompare: boolean
    modalAttachments?: boolean
    totalAmount: number
    editList: {},
    invalid_reason: string
    isChecked: boolean,
    jotf: string
    jotfToken: string
    approval: string | number
    profileId: number | string
}

interface FilterAssist2 {
    startDate: string;
    endDate: string;
    page: string;
    column: string;
    direction: string;
    row: string;
    key: string;
    media: string;
}

export interface DemoState {
    fallback: {
        '/api/livechat': Data
    },
    dataAge: [],
    dataVariant: [],
    dataGender: [],
    dataDistribution: [],
    // dataDistributionKtp: [],
    columns: [],
    data: Data,
    data2: Data,
    type: string,
    media: string,
    status: string,
    access: Access,
    isLoading: boolean,
    modalFilter: boolean,
    typeModal: string,
    dataModal: {},
    filter: FilterAssist2;
    // type: string | number
    // media: string
    master: {
        role: string[]
    }
}