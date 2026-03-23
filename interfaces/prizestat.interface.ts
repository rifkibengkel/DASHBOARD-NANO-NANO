export interface IState {
    fallback: {
        '/api/prizestat/list': Data
    },
    data: Data,
    columns: [],
    columnsDepost: [],
    access: Access
    isLoading: boolean,
    openModal: boolean,
    modalFilter: boolean,
    typeModal: string,
    dataModal: {}
    filter: Filter,
    master: {
        table: string[]
        tablePulsa: string[]
        role: string[]
        prizes: string[]
        regions: string[]
        media: string[]
    },
    totalAmount: string | number,
    totalClaim: string | number
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
    totalAmount: string | number
    totalClaim: string | number
    deposit: string | number
    deposit2: string | number
    balance: string | number
    pulsaList: any
    pulsaList2: any
    winnerList: any
} 

interface Filter {
    key: string;
    startDate: string
    endDate: string
    directions: string;
    columns: string
    isValid: string
    prize: string
    time: string
    //promoType: string
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