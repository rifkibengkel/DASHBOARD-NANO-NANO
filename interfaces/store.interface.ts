export interface IState {
    fallback: {
        '/api/store/list': Data
    },
    data: Data,
    pickedId: string,
    pickedStoreCode: string,
    dataDetail: {}
    columns: [],
    access: Access
    isLoading: boolean,
    openModal: boolean,
    modalFilter: boolean,
    modalDetail: boolean,
    typeModal: string,
    dataModal: {}
    filter: Filter,
    master: {
        role: string[]
    }
    storeDet: {}
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
    directions: string;
    columns: string
    mode: string
}

export interface modalState {
    data: {
        email: string,
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
    email: string | undefined
    name: string | undefined
    role: string | undefined
    password: string | undefined
    id: string | undefined
}