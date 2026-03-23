import React, { useEffect, useReducer, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ReactElement } from 'react'
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from 'next'
import { PageHeader } from '@ant-design/pro-layout'
import Button from "antd/lib/button";
import Space from "antd/lib/space";
import Row from "antd/lib/row"
import Col from "antd/lib/col"
import Skeleton from "antd/lib/skeleton";
import DashboardLayout from "@/components/layouts/Dashboard";
import { getData } from "@api/livechat/list";
import { masterRole } from "@api/master/index";
import { useApp } from "@/context/AppContext";
import { IState } from "@/interfaces/livechat.interface";
import Notifications from "@/components/Notifications";
import Link from 'next/link'
import { masterAgent } from "@/pages/api/master/_model";
import { withAuth } from "@/components/authHOC";

const ModalFilter = dynamic(() => import('@/components/DataFilter'), { loading: () => <p></p> })

const Modals = dynamic(() => import('../../../pageComponents/Livechat/ModalDetail'), { loading: () => <p></p> })

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), { loading: () => <Skeleton />, ssr: false });

const Agents = (props: any, { fallback }: any) => {
    const [states, setStates] = useReducer((state: IState, newState: Partial<IState>) => ({ ...state, ...newState }), props)
    const { statesContex, setSubmitNotif } = useApp();

    const url = `/api/livechat/list?type=1&key=${states.filter.key}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&column=${states.filter.columns}&direction=${states.filter.directions}&agentId=${states.filter.agentId}`
    const { data, error, isValidating: isLoadingData } = useSWR(url)

    const expAgents = async () => {
        let param = states.filter
        await exportAgents(param)
    }

    const handleFilter = useCallback((data: any) => {
        setStates({
            data: {
                ...states.data,
                dataPerPage: 10,
                currentPage: 1,
            },
            filter: {
                ...states.filter,
                startDate: data.startDate,
                endDate: data.endDate,
                agentId: data.agentId,
            },
            modalFilter: false
        })
    }, [states.filter, states.data])

    const handleSearch = useCallback((data: any) => {
        setStates({
            filter: {
                ...data,
                agentId: '',
            },
            data: {
                ...states.data,
                dataPerPage: 10,
                currentPage: 1,
            },
        })
    }, [states.filter, states.data]);

    const handleOpenModal = useCallback(async (param: any) => {
        if (param.name === "openModal" && param.id) {
            const response = await getDetail(param.id)
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
        setSubmitNotif({ type: "", message: "", description: "" })
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
        addOn: {
            title: "Action",
            dataIndex: "action",
            key: "action",
            render: (text: any, record: any) => {
                const urlReturn = (mode: string) => {
                    return `/livechat/agents/detail?agentId=${record.id}&key=${states.filter.key}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&column=${states.filter.columns}&direction=${states.filter.directions}&mode=${mode}`
                }
                return (
                    <>
                        <Space size="middle">
                            {states.access.m_update == 1 ?
                                <>
                                    <Button type="link" className={"link"} disabled={record.total_chat == 0 ? true : false}>
                                        <Link href={urlReturn('1')} passHref>
                                            View
                                        </Link>
                                    </Button>

                                </>
                                : null}
                        </Space>
                    </>
                )
            }
        },
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
        title: "List Agents",
        dateRange: states.filter,
    }

    if (error) {
        return <p>Failed to load</p>
    }

    return (
        <>
            <SWRConfig value={{ fallback }}>
                <PageHeader
                    title="Agents Management"
                    extra={[
                        <Row key="1">
                            {states.master.isAdmin ? (
                                <>
                                    <Col style={{ marginRight: '1em' }}>
                                        <Button
                                            onClick={expAgents}
                                            className={'button'}
                                            shape="round"
                                        >
                                            Export
                                        </Button>
                                    </Col>
                                </>
                            ) : null}
                            <Col>
                                <Button
                                    onClick={() =>
                                        handleOpenModal({
                                            name: "modalFilter",
                                            value: true,
                                        })
                                    }
                                    className={'button'}
                                    shape="round"
                                >
                                    Filter
                                </Button>
                            </Col>
                        </Row>
                        //  : null
                    ]}
                />
                <TableRenderer {...tbc} />
                <Modals
                    open={states.openModal}
                    header={"Agent Detail"}
                    handleOpenModal={handleOpenModal}
                    data={states.dataDetail}
                />
                <ModalFilter
                    tgt={'agent'}
                    header={"Filter Agent"}
                    open={states.modalFilter}
                    handleOpenModal={handleOpenModal}
                    handleFilter={handleFilter}
                    master={states.master}
                    filter={states.filter}
                />
            </SWRConfig>
        </>
    )
}

const exportAgents = async (data: any) => {
    let res = await window.open(`/api/livechat/export?key=${data.key}&page=${data.currentPage}&row=${data.dataPerPage}&startDate=${data.startDate}&endDate=${data.endDate}&column=${data.columns}&direction=${data.directions}&agentId=${data.agentId}`)
}

const getDetail = async (data: any) => {
    let res = await fetch(`/api/livechat/${data}`)
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
        startDate: string
        endDate: string
        type: string
    }

    let date = new Date()
    const { row, page, key, direction, column, startDate, endDate, mode } = ctx.query as any

    const params: IPagination = {
        row: row ?? 10,
        page: page ?? 0,
        key: key ?? "",
        direction: direction ?? "",
        column: column ?? "",
        limit: "",
        startDate: startDate ?? '',
        endDate: endDate ?? '',
        type: ''
    }

    const getList = await getData(params);
    const roleMaster = await masterRole();
    const agentMaster = await masterAgent();

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
                '/api/livechat/list': JSON.parse(JSON.stringify(data))
            },
            data: JSON.parse(JSON.stringify(data)),
            master: {
                table: JSON.parse(JSON.stringify(getList.tabling)),
                role: JSON.parse(JSON.stringify(roleMaster)),
                agent: JSON.parse(JSON.stringify(agentMaster)),
            },
            columns: [],
            isLoading: false,
            openModal: false,
            typeModal: "",
            dataModal: {},
            filter: {
                startDate: startDate ?? params.startDate,
                endDate: endDate ?? params.endDate,
                key: key ?? "",
                directions: direction ?? "",
                columns: column ?? "",
                media: '',
                agentId: '',
            }
        }
    }
})

export default Agents;

Agents.getLayout = function getLayout(page: ReactElement) {
    return (
        <DashboardLayout>{page}</DashboardLayout>
    )
}