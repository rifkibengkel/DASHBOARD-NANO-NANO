import React, { useReducer } from "react";
import type { ReactElement } from 'react'
import { useRouter } from 'next/router';
import dayjs from "dayjs";
import { GetServerSideProps } from 'next'
import Error from 'next/error'
import { PageHeader } from '@ant-design/pro-layout'
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Space from "antd/lib/space";
import DashboardLayout from "@/components/layouts/Dashboard";
import { IDataAgent } from "@/interfaces/livechat.interface";
import { detailAgent, detailAgentPerTopic } from "@/pages/api/livechat/list";
import { withAuth } from "@/components/authHOC";
import { Table } from "antd";
import { TableProps } from "antd/lib";
import Rate from "antd/lib/rate"

interface DataType {
    key: string;
    rcvd_time: string;
    rating: string;
}

const DataAgent = (props: any) => {
    const router = useRouter()
    const { query } = router
    const [states, setStates] = useReducer((state: IDataAgent, newState: Partial<IDataAgent>) => ({ ...state, ...newState }), props);

    if (props.error) {
        return <Error statusCode={400} />
    }

    const backToAgents = () => {
        router.push(`/livechat/agents?key=${states.backFilter.key}&page=${states.backFilter.page}&row=${states.backFilter.row}&startDate=${states.backFilter.startDate}&endDate=${states.backFilter.endDate}&column=${states.backFilter.column}&direction=${states.backFilter.direction}`)
    }


    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'NO',
            dataIndex: 'no',
        },
        {
            title: 'Created Date',
            dataIndex: 'rcvd_time',
            render: (text) => <a>{dayjs(text).format("DD/MM/YYYY")}</a>,
        },
        {
            title: 'Created Time',
            dataIndex: 'rcvd_time',
            render: (text) => <a>{dayjs(text).format("HH:mm:ss")}</a>,
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            render: (x:number) => <Rate allowHalf defaultValue={0} value={x} disabled={true}/>,
        }
    ];

    return (
        <>
            <PageHeader
                title={`Detail Agent ${props.dataAgent.name} Per Topics`}
                extra={[
                    !query.type ?
                        <Space key={'space1'}>
                            <Button
                                key="ReturnToAgent"
                                id={"returnRef"}
                                onClick={backToAgents}
                                className={'button4'}
                                shape="round"
                            >
                                Return to Agents
                            </Button>
                        </Space> : null,

                ]}
            />
                    
            {props.dataTable.map((item: any) => (
                <Card style={{overflow: "scroll"}}>
                    <h3>{"TOPIC - " + item.title}</h3>
                    <Table
                        columns={columns}
                        dataSource={item.list}
                    >
                    </Table>
                </Card>
            ))}
        </>
    )
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
        type: string
        agentId: string
    }

    const { row, page, key, direction, column, startDate, endDate, mode } = ctx.query as any
    let agentId: any = ctx.query.agentId

    const params: IPagination = {
        row: row ?? 10,
        page: page ?? 0,
        key: key ?? "",
        direction: direction ?? "",
        column: column ?? "",
        limit: "",
        media: '',
        startDate: startDate ?? '',
        endDate: endDate ?? '',
        type: "1",
        agentId,
    }

    const dataAgent: any = await detailAgent(agentId)
    const dataDetail: any = await detailAgentPerTopic(params)

    return {
        props: {
            backFilter: params,
            dataAgent: JSON.parse(JSON.stringify(dataAgent[0])),
            dataTable: JSON.parse(JSON.stringify(dataDetail)),
            formError: {
                error: false,
                errorField: "",
                errorMessage: ""
            },
            isLoading: false,
        }
    }
})

export default DataAgent;

DataAgent.getLayout = function getLayout(page: ReactElement) {
    return (
        <DashboardLayout>{page}</DashboardLayout>
    )
}