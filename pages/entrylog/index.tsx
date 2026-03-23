import React, { useEffect, useReducer, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ReactElement } from 'react'
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router';
import { PageHeader } from '@ant-design/pro-layout'
import Skeleton from "antd/lib/skeleton";
import DashboardLayout from "../../components/layouts/Dashboard";
import { getData } from "../api/entrylog/list";
import { masterRole } from "../api/master/index";
import { useApp } from "../../context/AppContext";
import { IState } from "../../interfaces/entries.interface";
import Notifications from "../../components/Notifications";

import { masterStore } from "@api/master/_model";
import { withAuth } from "@/components/authHOC";

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), { loading: () => <Skeleton active />, ssr: false });

const Entries = (props: any, { fallback }: any) => {
    const [states, setStates] = useReducer((state: IState, newState: Partial<IState>) => ({ ...state, ...newState }), props)
    const router = useRouter();
    const { statesContex, setSubmitNotif } = useApp();

    const url = `/api/entrylog/list?type=1&key=${states.filter.key}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&column=${states.filter.columns}&direction=${states.filter.directions}&isValid=${states.filter.isValid}&isValidAdmin=${states.filter.isValidAdmin}&isApprovedAdmin=${states.filter.isApprovedAdmin}&storeId=${states.filter.storeId}`
    const { data, error, isValidating: isLoadingData } = useSWR(url, {revalidateOnMount: false})

    // const expEntries = async () => {
    //     let param = states.filter
    //     await exportEntries(param)
    // }

    // const expEntriesPrd = async () => {
    //     let param = states.filter
    //     await exportEntriesPrd(param)
    // }

    const handleFilter = useCallback((data: any) => {
        setStates({
            // master: {
            //     ...states.master,
            //     store: data.
            // },
            data: {
                ...states.data,
                dataPerPage: 10,
                currentPage: 1,
            },
            filter: {
                ...states.filter,
                startDate: data.startDate,
                endDate: data.endDate,
                isValid: data.isValid,
                isValidAdmin: data.isValidAdmin,
                isApprovedAdmin: data.isApprovedAdmin,
                storeId: data.storeId,
            },
            modalFilter: false
        })
      }, [states.filter, states.data])

    const handleSearch = useCallback((data: any) => {
        setStates({
        filter: data,
        data: {
            ...states.data,
            dataPerPage: 10,
            currentPage: 1,
        },
        })
      }, [states.filter, states.data]); 

    const handleOpenModal = useCallback(async (param: any) => {
        if(param.name === "openModal" && param.id) {
            const response = await getEntryDetail(param.id)
            setStates({
                dataDetail: response.entries[0],
                [param.name]: param.value,
            });
        } else {
            setStates({
                [param.name]: param.value,
            });
        }
    }, [])

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setStates({
            data: {
                ...states.data,
                dataPerPage: pagination.pageSize,
                currentPage: pagination.current,
            },
            filter: {
                ...states.filter,
                columns: sorter.field,
                directions: sorter.order
            }
        })
    };

    useEffect(() => {
        const { type, message, description } = statesContex.submitNotif
        Notifications(type, message, description)
        setSubmitNotif({type: "", message: "", description: ""})
        setStates({
            ...states,
            filter: states.filter
        })
    }, [])

    useEffect(() => {
        if (data) {
            setStates({
                isLoading: false,
                data: {
                    ...states.data,
                    dataPerPage: data.dataPerPage,
                    currentPage: data.currentPage,
                    totalData: data.totalData,
                    totalPage: data.totalPage,
                    list: data.data,
                    key: states.data.key ? states.data.key : ""
                }
            })
        }
    }, [data])

    const dataSource = states?.data.list

    dataSource.forEach((i: any, index: number) => {
        i.key = index;
        i.no =
            states.data.currentPage === 1
                ? Number(index + 1)
                : states.data.currentPage === 2
                    ? Number(states.data.dataPerPage) + (index + 1)
                    : (Number(states.data.currentPage) - 1) * Number(states.data.dataPerPage) + (index + 1);
    });

    let tbc = {
        array: states.master.table,
        addOn: {},
        loading: isLoadingData,
        dataSource,
        summary: {
            for: '',
            data: {
                totalValid: 0,
                totalPending: 0,
                totalInvalid: 0,
                total: 0
            }
        },
        pagination: states.data,
        activeFilter: states.filter,
        filtering: handleTableChange,
        searching: handleSearch,
        title: "Log",
        dateRange: states.filter,
    }

    if (error) {
        return <p>Failed to load</p>
    }

    return (
        <>
            <SWRConfig value={{ fallback }}>
                <PageHeader
                    title="WABA Log"
                    // extra={[
                    //     // states.access.m_insert == 1 ?
                    //     <Row key="1">

                    //         {/* <> */}
                    //         {states.master.isAdmin ? (
                    //         <>
                    //         <Col  style={{marginRight: '1em'}}>
                    //         <Button 
                    //             onClick={expEntries}
                    //             className={'button'}
                    //             shape="round"
                    //         >
                    //             Export
                    //         </Button>
                    //         </Col>
                    //         {/* <Col  style={{marginRight: '1em'}}>
                    //         <Button 
                    //             onClick={expEntriesPrd}
                    //             className={'button'}
                    //             shape="round"
                    //         >
                    //             Export By Products
                    //         </Button>
                    //         </Col> */}
                    //         </>
                    //         ) : null}
                    //         {/* </> */}
 
                    //     <Col>
                    //     <Button
                    //     onClick={() =>
                    //         handleOpenModal({
                    //             name: "modalFilter",
                    //             value: true,
                    //             // typeModal: "Add",
                    //         })
                    //     }
                    //     className={'button'}
                    //     shape="round"
                    // >
                    //     Filter
                    // </Button>
                    // </Col>
                    // </Row>
                    //     //  : null
                    // ]}
                />
                <TableRenderer {...tbc} />
            </SWRConfig>
        </>
    )
}

const exportEntries = async (data: any) => {
    let res = await window.open(`/api/entrylog/export?key=${data.key}&page=${data.currentPage}&row=${data.dataPerPage}&startDate=${data.startDate}&endDate=${data.endDate}&column=${data.columns}&direction=${data.directions}&isValid=${data.isValid}&isApproved=${data.isApproved}&storeId=${data.storeId}`);
}

  const exportEntriesPrd = async (data: any) => {
    let res = await window.open(`/api/entrylog/exportByProducts?key=${data.key}&isValid=${data.isValid}&startDate=${data.startDate}&endDate=${data.endDate}&column=${data.columns}&direction=${data.directions}`)
  }

const getEntryDetail = async (data: any) => {
      let res = await fetch(`/api/entries/${data}`)
      if (res.status !== 404) {
        let dataList = await res.json()
        return dataList
      } else {
        return alert("Error 404")
      }
    }

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
    interface IPagination {
        row: string | number
        page: string | number
        key: string
        direction: string
        column: string
        limit: number | string
        media: string
        startDate: string
        endDate: string
        isValid: string | number
        isValidAdmin: string | number
        isApprovedAdmin: string | number
        type: string
    }

    const params: IPagination = {
        row: 10,
        page: 0,
        key: "",
        direction: "",
        column: "",
        limit: "",
        media: '',
        startDate: '',
        endDate: '',
        isValid: '',
        isValidAdmin: '',
        isApprovedAdmin: '',
        type: "1"
    }

    const getList = await getData(params);
    const roleMaster = await masterRole();
    const storeMaster = await masterStore();

    const data = {
        dataPerPage: getList.dataPerPage,
        currentPage: getList.currentPage,
        totalData: getList.totalData,
        totalPage: getList.totalPage,
        list: getList.data,
        key: ""
    }

    return {
        props: {
            fallback: {
                '/api/entrylog/list': JSON.parse(JSON.stringify(data))
            },
            data: JSON.parse(JSON.stringify(data)),
            master: {
                table: JSON.parse(JSON.stringify(getList.tabling)),
                role: JSON.parse(JSON.stringify(roleMaster)),
                store: JSON.parse(JSON.stringify(storeMaster)),
            },
            columns: [],
            isLoading: false,
            openModal: false,
            typeModal: "",
            dataModal: {},
            filter: {
                key: "",
                directions: "",
                columns: "",
                startDate: "",
                endDate: "",
                isValid: '',
                isApproved: '',
                storeId: '',
            }
        }
    }
})

export default Entries;

Entries.getLayout = function getLayout(page: ReactElement) {
    return (
        <DashboardLayout>{page}</DashboardLayout>
    )
}