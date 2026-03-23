export interface IState {
    fallback: {
        '/api/blacklist/list': Data
    },
    editData: string
    idList: string | number
    fullname: string
    sender: string
    data: Data,
    columns: [],
    access: Access
    isLoading: boolean,
    openModal: boolean,
    modalType: string,
    dataModal: {}
    filter: Filter,
    master: {
        table: string[]
        role: string[]
    }
    modalAny: boolean
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
    columnSearch: string
}

export interface formModal {
    username: string | undefined
    name: string | undefined
    role: string | undefined
    password: string | undefined
    id: string | undefined
}