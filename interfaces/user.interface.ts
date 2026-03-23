export interface IState {
    fallback: {
        '/api/users/list': Data
    },
    data: Data,
    dataDetail: {}
    columns: [],
    isApproved: number
    currentPeriode: string
    access: Access
    isLoading: boolean,
    openModal: boolean,
    modalFilter: boolean,
    typeModal: string,
    dataModal: {}
    filter: Filter,
    master: {
        table: string[]
        role: string[],
        isAdmin: boolean,
        periodes: string[]
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
    top5: any
} 

interface Filter {
    key: string;
    period: string
    startDate: string
    endDate: string
    directions: string;
    columns: string
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
    hp?: string | undefined
    userId?: number | undefined
}