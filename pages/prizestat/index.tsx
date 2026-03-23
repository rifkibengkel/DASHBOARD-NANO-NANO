import React, { useEffect, useReducer } from "react";
import type { ReactElement } from 'react'
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router';
import dayjs from "dayjs";
import { PageHeader } from '@ant-design/pro-layout'
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Card from "antd/lib/card";
import Table from "antd/lib/table";
import DashboardLayout from "@/components/layouts/Dashboard";
import { getData } from "../api/dashboard/prizesV2";
import { masterRole } from "../api/master/index";
import { useApp } from "@/context/AppContext";
import Notifications from "@/components/Notifications";
import { formatNumber2 } from "@/lib/clientHelper";
import { withAuth } from "@/components/authHOC";
const { Column } = Table;

const PrizeSummary = (props: any, { fallback }: any) => {
    const [states, setStates] = useReducer((state: any, newState: Partial<any>) => ({ ...state, ...newState }), props)
    const router = useRouter();
    const { statesContex, setSubmitNotif } = useApp();

    const url = `/api/dashboard/prizesV2`
    const { data, error, isValidating: isLoadingData } = useSWR(url)

    const handleOpenModal = (param: any) => {
        setStates({
            [param.name]: param.value,
            typeModal: param.typeModal,
            dataModal: param.dataModal ? param.dataModal : {}
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
        const { type, message, description } = statesContex.submitNotif
        Notifications(type, message, description)
        setSubmitNotif({ type: "", message: "", description: "" })
    }, [])

    useEffect(() => {
        if (data) {
            setStates({
                isLoading: false,
                data: data
            })
        }
    }, [data])

    const dataSource = states?.data?.fixData

    dataSource.forEach((i: any, index: number) => {
        i.key = index;
        // i.no =
        //     page === 1
        //         ? formatNumber(index + 1)
        //         : page === 2
        //             ? formatNumber(parseInt(rowsPerPage) + (index + 1))
        //             : formatNumber((page - 1) * parseInt(rowsPerPage) + (index + 1));
    });

    // const dataSource2 = states?.data?.fixDataPulsa

    // dataSource2.forEach((i: any, index: number) => {
    //     i.key = index;
    //     // i.no =
    //     //     page === 1
    //     //         ? formatNumber(index + 1)
    //     //         : page === 2
    //     //             ? formatNumber(parseInt(rowsPerPage) + (index + 1))
    //     //             : formatNumber((page - 1) * parseInt(rowsPerPage) + (index + 1));
    // });

    // const prizeMapper: any = states.data?.przMap.length > 0 ? states.data?.przMap.map((item: any, index: number) => {
    //     let cols: any = (
    //         <>
    //             <Column title="Allocation" dataIndex={`${item.codes}All`} key={`${item.codes}All`} render={value => formatNumber2(value) || 0} />
    //             <Column title="Winner" dataIndex={`${item.codes}Used`} key={`${item.codes}Used`} render={value => formatNumber2(value) || 0} />
    //         </>
    //     )
    //     return (
    //         <Column key={item.name} title={item.name}>
    //             {cols}
    //         </Column>
    //     )
    // }) : []

    // const prizeSumMapper: any = states.data?.przMap.length > 0 ? states.data?.przMap.map((item: any, index: number) => {
    //     return (
    //         <Table.Summary.Cell key={index} index={index} colSpan={2}>
    //             {formatNumber2(dataSource.map((item1: any, idx1: any) => item1[`${item.codes}All`] ? item1[`${item.codes}All`] : 0).reduce((a: number, b: number) => a + b, 0))}
    //         </Table.Summary.Cell>
    //     )
    // }) : []


    if (error) {
        return <p>Failed to load</p>
    }

    return (
        <>
            <SWRConfig value={{ fallback }}>
                <PageHeader
                    title="Prize List"
                />
                <Row gutter={12}>
                    {/* <Col xs={24} xl={24}>
                        <Card
                            className="custom-card"
                            title="Prize Claimed Charts and List"
                        >
                            <Row justify="space-between">

                                <Col span={24}>
                                    <Table
                                        style={{ overflowX: 'scroll' }}
                                        bordered
                                        size="middle"
                                        loading={props.isLoading}
                                        pagination={false}
                                        dataSource={dataSource}
                                        summary={() => (
                                            <Table.Summary.Row style={{ fontWeight: "bolder" }}>
                                                <Table.Summary.Cell index={0}>TOTAL</Table.Summary.Cell>
                                                {prizeSumMapper}
                                            </Table.Summary.Row>
                                        )}
                                    >
                                        <Column title="Date" dataIndex="date" key="date" render={date => date !== null ? dayjs(date).format('DD-MM-YYYY') : '-'} />
                                        {prizeMapper}
                                    </Table>
                                </Col>
                            </Row>
                        </Card>
                    </Col> */}

                    <Col xs={24} xl={11}>
                    <Table
                    bordered
                    size="middle"
                    loading={props.isLoading}
                    pagination={false}
                    dataSource={dataSource}
                    // summary={() => (
                    //     <Table.Summary.Row style={{ fontWeight: "bolder" }}>
                    //     <Table.Summary.Cell index={0}>TOTAL</Table.Summary.Cell>
                    //     <Table.Summary.Cell index={1}>
                    //         {dataTable.map((item: any) => item.value).reduce((a: any, b: any) => a + b, 0)}
                    //     </Table.Summary.Cell>
                    //     </Table.Summary.Row>
                    // )}
                    >
                    <Column title="Prize Name" dataIndex="value" key="value" />
                    <Column title="Amount" dataIndex="amount" key="amount" />
                    </Table>
                </Col>
                    {/* {props.master?.isClient ? null : (
                        <Col xs={24} xl={8}>
                            <Card
                                className="custom-card"
                                title="Prize Claimed Charts (Pulsa Only)"
                            >
                                <Row justify="space-between">

                                    <Col span={24}>
                                        <Table
                                            style={{ overflowX: 'scroll' }}
                                            bordered
                                            size="middle"
                                            loading={props.isLoading}
                                            pagination={false}
                                            dataSource={dataSource2}
                                            summary={() => (
                                                <Table.Summary.Row style={{ fontWeight: "bolder" }}>
                                                    <Table.Summary.Cell index={0}>TOTAL</Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1} colSpan={1}>
                                                        {formatNumber2(dataSource2.map((item: any, idx: any) => Number(item.success)).reduce((a: number, b: number) => a + b, 0))}
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1} colSpan={1}>
                                                        {formatNumber2(dataSource2.map((item: any, idx: any) => Number(item.failed)).reduce((a: number, b: number) => a + b, 0))}
                                                    </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                            )}
                                        >
                                            <Column title="Date" dataIndex="date" key="date" render={date => date !== null ? dayjs(date).format('DD-MM-YYYY') : '-'} />
                                            <Column title="Success" dataIndex="success" key="success" />
                                            <Column title="Failed" dataIndex="failed" key="failed" />
                                        </Table>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    )} */}
                </Row>
            </SWRConfig>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
    const getList = await getData();
    const roleMaster = await masterRole();
    const data = {}

    return {
        props: {
            fallback: {
                '/api/prizestat/list': JSON.parse(JSON.stringify(data))
            },
            data: JSON.parse(JSON.stringify(getList)),
            master: {
                role: JSON.parse(JSON.stringify(roleMaster)),
                isClient: false
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
            }
        }
    }
})

export default PrizeSummary;

PrizeSummary.getLayout = function getLayout(page: ReactElement) {
    return (
        <DashboardLayout>{page}</DashboardLayout>
    )
}