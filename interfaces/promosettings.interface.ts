export interface IState {
    fallback: {
        '/api/promosettings/list': Data
    },
    pickedId: any,
    selectedFile: any,
    fileName: string,
    coupon: string,
    sender: string,
    data: Data,
    dataDetail: any,
    editData: {},
    columns: [],
    access: Access
    isLoading: boolean,
    openModal: boolean,
    typeModal: string,
    dataModal: {}
    ktp: string;
    ktpValid: boolean;
    regionCode: string;
    province: string
    regency: string
    district: string
    age: string
    gender: string
    lahir: string
    inputDisabled: boolean
    submitDisabled: boolean
    filter: Filter,
    master: {
        table: string[]
        role: string[]
    }
}

interface Access {
    // menu_header: number
    // menu: string
    // path: string
    // level: number
    // sub: number
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

interface Filter {
    key: string;
    directions: string;
    columns: string;
    isApproved: string;
}

export interface modalState {
    data: {
        username: string,
        password: string
        name: string
    }[],
    isLoading: boolean
    oldId: string | undefined
    role: string[],
    form: formModal,
    master: any
}

export interface formModal {
    username: string | undefined
    name: string | undefined
    role: string | undefined
    password: string | undefined
    id: string | undefined
}