import React, { useEffect, useReducer, useRef } from "react";
import Table from 'antd/lib/table';
import { formatNumber } from "@/lib/clientHelper";

const { Column } = Table;

interface IState {
    tableData: [];
    total: string | number;
    totalMedia: string[];
    medias: string[]
    isLoading: boolean;
}

let initialState = {
    tableData: [],
    total: "",
    isLoading: true
};

const TableRS = React.memo((props: any) => {
    const [states, setStates] = useReducer((state: IState, newState: Partial<IState>) => ({ ...state, ...newState }), props)
    const prevProps = useRef(props)

    useEffect(() => {
        if (prevProps.current.data !== props.data) {
            setStates({
              tableData: props.data,
              isLoading: false
            })
          }
    }, [props.data])

    useEffect(() => {
        if (prevProps.current.total !== props.total) {
            setStates({
              total: props.total,
              isLoading: false
            })
          }
    }, [props.total])
    
    useEffect(() => {
        if (prevProps.current.totalMedia !== props.totalMedia) {
            setStates({
              totalMedia: props.totalMedia,
              isLoading: false
            })
          }
    }, [props.totalMedia])

    useEffect(() => {
        if (prevProps.current.medias !== props.medias) {
            setStates({
              medias: props.medias,
              isLoading: false
            })
          }
    }, [props.medias])

    // const handleOpenModal = (data) => {
    //     props.handleOpenModal(data);
    // };

    let { tableData, total, totalMedia} = states;
    tableData ? tableData.forEach((i: any, index: any) => {
        i.key = index;
        i.no = index + 1
    }) : [];

    let medias = states.medias ? states.medias.map((item: any, i: any) => (
        <Column title={item.name} dataIndex={item.name} key={item.name} render={(x) => formatNumber(x)} />
    )) : []

    let mediasSmr = states.medias ? states.medias.map((item: any, i: any) => (
        <Table.Summary.Cell key={i} index={i}>
            {states.totalMedia[item.name] === null ? 0 : formatNumber(states.totalMedia[item.name] as unknown as number) }
        </Table.Summary.Cell>
    )) : []

    return (
        <div>
            <Table
                style={{overflowX: 'scroll'}}
                bordered
                loading={props.isLoading}
                size="middle"
                pagination={false}
                dataSource={tableData}
                summary={() => (
                    <Table.Summary.Row style={{ fontWeight: "bolder" }}>
                        <Table.Summary.Cell index={0}>TOTAL</Table.Summary.Cell>
                        {mediasSmr}
                        <Table.Summary.Cell index={9}>
                            {formatNumber(total === null ? 0 : total as number || 0)}
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            >
                <Column title="Registration Date" dataIndex="DATE" key="DATE" />
                {medias}
                <Column title="Total" dataIndex="all" key="all" render={(x) => formatNumber(x)} />
            </Table>
        </div>
    );
})

TableRS.displayName = "RegstatTable"
export default TableRS