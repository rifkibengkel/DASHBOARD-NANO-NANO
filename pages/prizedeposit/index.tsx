import React, { useEffect, useReducer } from "react";
import type { ReactElement } from 'react'
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from 'next'
import { PageHeader } from '@ant-design/pro-layout'
import Table from "antd/lib/table";
import DashboardLayout from "@/components/layouts/Dashboard";
import { getData } from "../api/dashboard/prizesDeposit";
import { masterRole } from "../api/master/index";
import { IState } from "@/interfaces/prizestat.interface";
import { Button, Col, Row } from "antd";
import Skeleton from "antd/lib/skeleton";
import dynamic from "next/dynamic";
import { withAuth } from "@/components/authHOC";

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), { loading: () => <Skeleton />, ssr: false });

const ModalFilter = dynamic(() => import('@/components/DataFilter'), { loading: () => <p></p>, ssr: false });

const formatNumber = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const Prizestat = (props: any, { fallback }: any) => {
    const [states, setStates] = useReducer((state: IState, newState: Partial<IState>) => ({ ...state, ...newState }), props)

    const url = `/api/dashboard/prizesDeposit?key=${states.filter.key}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&condition=daily`
    const { data, error, isValidating: isLoading } = useSWR(url)


    const handleSearch = (data: any) => {
        setStates({
            filter: data,
            data: {
                ...states.data,
                dataPerPage: 10,
                currentPage: 1,
            },
        })
    };

    const handleFilter = (data: any) => {
        setStates({
            filter: {
                ...states.filter,
                startDate: data.startDate,
                endDate: data.endDate
            },
            data: {
                ...states.data,
                currentPage: 0
            },
            modalFilter: false
        })
    };

    const resetFilter = () => {
        setStates({
            modalFilter: false,
            data: {
                ...states.data,
                dataPerPage: 10,
                currentPage: 1,
            },
            filter: {
                ...states.filter,
                startDate: '',
                endDate: '',
                isValid: '',
                columns: "",
                directions: ""
            }
        })
    };

    const handleOpenModal = async (param: any) => {
        setStates({
            [param.name]: param.value,
        });
    }

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
        if (data) {
            setStates({
                isLoading: false,
                data: {
                    ...states.data,
                    dataPerPage: data.dataPerPage,
                    currentPage: data.currentPage,
                    totalData: data.totalData,
                    totalPage: data.totalPage,
                    winnerList: data.data,
                    key: states.data.key ? states.data.key : ""
                },

            })
        }
    }, [data])

    useEffect(() => {
        const columnsDepost: any = [
            {
                title: "Prize",
                dataIndex: "prizeName",
                key: "prizeName",
            },
            {
                title: "Claimed Amount",
                dataIndex: "claimedAmount",
                key: "claimedAmount",
                render: (amount: string) => `Rp ${formatNumber((amount || 0) as number)} ,-`
            },
            {
                title: "Prize Redeemed",
                dataIndex: "prizeRedeemed",
                key: "prizeRedeemed",
                render: (amount: string) => formatNumber((amount || 0) as number)
            },
        ]

        const columns: any = [
            {
                title: "No",
                dataIndex: 'no',
                key: 'no'
            },
            {
                title: "Received Time",
                dataIndex: "rcvd_time",
                key: "rcvd_time",
                sorter: true,
                // render: (rcvd_time: string) => `${moment(rcvd_time).format('DD-MM-YYYY HH:mm:ss')}`
            },
            {
                title: "Fullname",
                dataIndex: "fullname",
                key: "fullname",
                sorter: true,
            },
            {
                title: "Sender",
                dataIndex: "sender",
                key: "sender",
                sorter: true,
            },
            {
                title: "City",
                dataIndex: "regency",
                key: "regency",
                sorter: true,
            },
            {
                title: "Prize",
                dataIndex: "prize",
                key: "prize",
                sorter: true,
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                sorter: true,
                render: (status: any) => status === 2 ? "Success" : status === 3 ? "Failed" : '-'
            },
        ]

        setStates({
            columns: columns,
            columnsDepost: columnsDepost

        })
    }, [states.access])

    const dataSourceDepost = states?.data.pulsaList
    const dataSourceDepost2 = states?.data.pulsaList2
    const dataSourceList = states?.data.winnerList

    dataSourceDepost.forEach((i: any, idx: number) => {
        i.key = idx
    })

    dataSourceDepost2.forEach((i: any, idx: number) => {
        i.key = idx
    })

    dataSourceList.forEach((i: any, idx: number) => {
        i.key = idx
        i.no =
            states.data.currentPage === 1
                ? Number(idx + 1)
                : states.data.currentPage === 2
                    ? Number(states.data.dataPerPage) + (idx + 1)
                    : (Number(states.data.currentPage) - 1) * Number(states.data.dataPerPage) + (idx + 1);
    })

    let tbc = {
        array: states.columns,
        addOn: {},
        loading: isLoading,
        dataSource: dataSourceList,
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
        title: "List Entries",
        dateRange: states.filter,
    }

    if (error) {
        return <p>Failed to load</p>
    }

    return (
        <>
            <SWRConfig value={{ fallback }}>
                <PageHeader
                    title={`Prize Deposit`}
                />
                <Row justify="space-between">
                <Col span={12}>
                <h4>Mobile Pulsa</h4>
                <Table
                    bordered
                    size="large"
                    pagination={false}
                    columns={states.columnsDepost}
                    dataSource={dataSourceDepost}
                    loading={isLoading}
                    summary={() => (
                        <>
                            <Table.Summary.Row key={1} style={{ fontWeight: "bolder" }}>
                                <Table.Summary.Cell index={0}>TOTAL</Table.Summary.Cell>
                                <Table.Summary.Cell index={0}>
                                    {`Rp ${formatNumber(dataSourceDepost.map((item: any) => Number(item.claimedAmount)).reduce((a: any, b: any) => a + b, 0))} ,-`}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1}>
                                    {formatNumber(dataSourceDepost.map((item: any) => Number(item.prizeRedeemed)).reduce((a: any, b: any) => a + b, 0) || 0)}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                            <Table.Summary.Row key={2} style={{ fontWeight: "bolder" }}>
                                <Table.Summary.Cell index={3}>DEPOSIT</Table.Summary.Cell>
                                <Table.Summary.Cell colSpan={2} index={4}>
                                    {`Rp ${formatNumber((states?.data.deposit || 0) as number)} ,-`}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                            <>
                                <Table.Summary.Row style={{ fontWeight: "bolder" }}>
                                    <Table.Summary.Cell index={5}>BALANCE</Table.Summary.Cell>
                                    <Table.Summary.Cell colSpan={2} index={6}>
                                        {`Rp ${formatNumber((states?.data.deposit || 0) as number - (dataSourceDepost.map((item: any) => Number(item.claimedAmount)).reduce((a: any, b: any) => a + b, 0)) as number)} ,-`}
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </>
                        </>
                    )}
                />
                </Col>
                </Row>
                <br />
                <PageHeader
                    title="Pulsa Only Entries"
                    extra={[
                        <Row key="1">
                            <Col >
                                <Button
                                    onClick={() =>
                                        handleOpenModal({
                                            name: "modalFilter",
                                            value: true,
                                            // typeModal: "Add",
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
            <ModalFilter
                tgt={'prize_deposit'}
                header={"Filter Transaction"}
                open={states.modalFilter}
                handleOpenModal={handleOpenModal}
                handleFilter={handleFilter}
                master={states.master}
                filter={states.filter}
            />
            </SWRConfig >
        </>
    )
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
    interface RgPagination {
        row: string | number
        page: string | number
        key: string
        direction: string
        column: string
        limit: number | string
        media: string
        startDate: string
        endDate: string
    }

    const params: RgPagination = {
        row: 10,
        page: 0,
        key: "",
        direction: "",
        column: "",
        limit: "",
        media: '',
        startDate: '',
        endDate: '',
    }

    const getList = await getData(params);
    const roleMaster = await masterRole();


    const data = {
        dataPerPage: getList.dataPerPage,
        currentPage: getList.currentPage,
        totalData: getList.totalData,
        totalPage: getList.totalPage,
        key: "",
        pulsaList: getList.dataWinPulsa,
        pulsaList2: getList.dataWinPulsa2,
        winnerList: getList.data,
        deposit: getList.deposit,
        deposit2: getList.deposit2,
    }


    return {
        props: {
            fallback: {
                '/api/dashboard/prizesDeposit': JSON.parse(JSON.stringify(data))
            },
            data: JSON.parse(JSON.stringify(data)),
            master: {
                role: JSON.parse(JSON.stringify(roleMaster)),
                store: []
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
            }
        }
    }
})

export default Prizestat;

Prizestat.getLayout = function getLayout(page: ReactElement) {
    return (
        <DashboardLayout>{page}</DashboardLayout>
    )
}