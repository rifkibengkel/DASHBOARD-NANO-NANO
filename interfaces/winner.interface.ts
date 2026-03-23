export interface IState {
    fallback: {
        '/api/winners/list': Data
    },
    data: Data,
    dataDetail: any
    dataImages: any
    columns: [],
    access: Access
    isLoading: boolean,
    openModal: boolean,
    openImage: boolean,
    openRevert: boolean,
    modalReject: boolean,
    modalPusher: boolean,
    modalFilter: boolean,
    typeModal: string,
    selectedFile: any;
    fileName: string;
    adminId: string;
    pickedId: any;
    dataModal: {}
    filter: Filter,
    master: {
        table: string[],
        role: string[],
        prize: string[],
        districts: string[],
        status: string[],
        isAdmin: boolean
        isClient: boolean
        invalidReason: string[]
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
    startDate: string
    endDate: string
    isValid: string
    isApproved: string
    prize: string
    prizeId: string
    directions: string;
    columns: string
    isHaveAtt: string | number
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
    id?: string | undefined
}