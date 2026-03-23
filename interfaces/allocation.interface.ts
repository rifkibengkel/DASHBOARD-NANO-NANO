export interface IState {
    fallback: {
        '/api/allocations/list': Data
    },
    data: Data,
    columns: [],
    access: Access
    isLoading: boolean,
    openModal: boolean,
    typeModal: string,
    dataModal: {}
    filter: Filter,
    master: {
        table: string[]
        role: string[]
        prizes: string[]
        regions: string[]
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
    id: string | undefined
}