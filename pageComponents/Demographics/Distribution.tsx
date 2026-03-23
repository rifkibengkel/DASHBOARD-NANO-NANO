import React, { useReducer, useEffect, useRef, memo} from "react";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Table from "antd/lib/table";

let initialState = {
  dataTable: [],
  column: null,
  direction: null,
  rowsPerPage: "10",
  key: "",
  page: 1,
  startDate: "",
  endDate: "",
  allData: [],
  tableData: [],
  totalInvalid: '',
  totalPending: '',
  totalValid: '',
  totalPage: '',
  filter: [],
  totalUniqueConsumen: '',
  totalData: '',
  totalSubmit: ''
};

const DistributionList = (props: any) => {
  const prevProps = useRef(props)
  const [states, setStates] = useReducer((state: any, newState: Partial<any>) => ({ ...state, ...newState }), initialState)

  const handleFilter = (data: any) => {
    let datas = {
      rowsPerPage: data.rowsPerPage,
      column: data.column,
      direction: data.direction,
      key: data.key === undefined ? "" : data.key,
      page: data.page,
      type: 1
    };
    apiDistribution(datas);
  };

  const apiDistribution = (data: any) => {
    // props.apiDistribution(data);
    // setStates({
    //   startDate: "",
    //   endDate: "",
    //   column: data.column,
    //   direction: data.direction,
    //   key: data.key,
    //   page: data.page,
    //   rowsPerPage: data.rowsPerPage,
    // });
  };

  // const handleRowsPerPage = (e, data) => {
  //   let datas = {
  //     startDate: "",
  //     endDate: "",
  //     rowsPerPage: data,
  //     column: states.column,
  //     direction: states.direction,
  //     key: states.key,
  //     page: states.page,
  //     type: 1
  //   };
  //   apiDistribution(datas);
  // };

  // const handleSort = (data) => {
  //   let { rowsPerPage, key, column } = states;

  //   if (column !== data.column) {
  //     let datas = {
  //       page: 1,
  //       rowsPerPage: rowsPerPage,
  //       key: key,
  //       column: data.column,
  //       direction: data.direction,
  //       type: 1
  //     };
  //     apiDistribution(datas);
  //     return;
  //   }

  //   let datas = {
  //     page: 1,
  //     rowsPerPage: rowsPerPage,
  //     key: key,
  //     column: data.column,
  //     direction: data.adirection,
  //     type: 1
  //   };

  //   apiDistribution(datas);
  // };

  // const handlePageChange = (event, data) => {
  //   let datas = {
  //     startDate: "",
  //     endDate: "",
  //     rowsPerPage: data,
  //     column: states.column,
  //     direction: states.direction,
  //     key: states.key,
  //     page: event,
  //     type: 1
  //   };

  //   apiDistribution(datas);
  // };

  useEffect(() => {
    let data = {
      rowsPerPage: "10",
      column: null,
      direction: null,
      key: "",
      page: 1,
      type: 1
    };
    // apiDistribution(data);
  })

  useEffect(() => {
    if (prevProps.current.data !== props.data || props.data.data.length > 0) {
      let data = props.data
      setStates({
        allData: data,
        tableData: data.data,
        totalInvalid: data.totalInvalid,
        totalPending: data.totalPending,
        totalValid: data.totalValid,
        totalPage: data.totalPage,
        page: data.currentPage === undefined ? 1 : data.currentPage,
        totalUniqueConsumen: data.totalUniqueConsumen,
        totalData: data.totalData,
        totalSubmit: data.totalSubmit,
        rowsPerPage: data.dataPerPage,
      })
    }
  }, [props.data])

  const handleChangeData = (pagination: any, filters: any, sorter: any) => {
    let filter = states.filter;
    let datas = {
      page: pagination.current,
      rowsPerPage: pagination.pageSize,
      key: filter.key === undefined ? '' : filter.key,
      columnSearch: filter.columnSearch,
      column: sorter.field,
      direction: sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : ''
    }
    props.apiDistribution(datas)
  }

  let { tableData, column, direction, page, rowsPerPage, totalData, totalSubmit, totalValid, totalPending, totalInvalid, totalUniqueConsumen } = states;

  const columns = [
    // {
    //   title: 'No',
    //   dataIndex: 'no',
    //   key: 'no'
    // },
    {
      title: 'City',
      dataIndex: 'regency',
      key: 'regency',
    },
    {
      title: 'Entries',
      children:
        // getUser().prjType.toString()
        "1" === "1" ?
          [{
            title: 'Valid',
            dataIndex: 'total_submit_valid',
            key: 'total_submit_valid',
            sorter: true,
          },
          {
            title: 'Invalid',
            dataIndex: 'total_submit_invalid',
            key: 'total_submit_invalid',
            sorter: true,
          },
          {
            title: 'Total',
            dataIndex: 'total_submit',
            key: 'total_submit',
            sorter: true,
          }]
          :
          [{
            title: 'Valid',
            dataIndex: 'total_submit_valid',
            key: 'total_submit_valid',
            sorter: true,
          },
          {
            title: 'Pending',
            dataIndex: 'total_submit_pending',
            key: 'total_submit_pending',
            sorter: true,
          },
          {
            title: 'Invalid',
            dataIndex: 'total_submit_invalid',
            key: 'total_submit_invalid',
            sorter: true,
          },
          {
            title: 'Total',
            dataIndex: 'total_submit',
            key: 'total_submit',
            sorter: true,
          }]
    },
    {
      title: 'Unique Consumen',
      dataIndex: 'uniqueConsumen',
      key: 'uniqueConsumen',
      sorter: true,
      render: (e: any) => e === null ? 'N/A' : e
    },
  ]

  let tabledt = states.tableData === undefined ? [] : states.tableData

  tabledt.forEach((i: any, index: number) => {
    i.key = index;
    // i.no =
    //     states.data.currentPage === 1
    //         ? Number(index + 1)
    //         : states.data.currentPage === 2
    //             ? Number(states.data.dataPerPage) + (index + 1)
    //             : Number(states.data.currentPage) - 1 * Number(states.data.dataPerPage) + (index + 1);
});

  return (
    <>
      <Row justify="space-between">
        <Col style={{ alignSelf: 'center' }}>
          {/* <Button
            style={{ marginRight: '1em' }}
            onClick={() => props.handleOpenModal({
              name: 'modalFilter',
              value: true
            })}
            >Filter</Button> */}
        </Col>
        <Col>
          {/* <Searchs
            handleFilter={handleFilter}
            filter={{
              page: page,
              column: column,
              direction: direction,
              rowsPerPage: rowsPerPage,
            }}
          /> */}
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div
            style={{
              display: "box",
              overflowX: "scroll",
              paddingBottom: "1em",
            }}
          >
            <Table
              bordered
              size="middle"
              loading={props.isLoading}
              pagination={{
                pageSize: rowsPerPage,
                // onShowSizeChange: props.handleRowsPerPage,
                defaultCurrent: Number(page),
                current: Number(page),
                total: totalData
              }}
              dataSource={tableData}
              columns={columns}
              summary={() => (
                <Table.Summary.Row style={{ fontWeight: "bolder" }}>
                  <Table.Summary.Cell index={1}>TOTAL</Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    {totalValid}
                  </Table.Summary.Cell>
                  {
                    // getUser().prjType
                    "1" === "1" ? null :
                      <Table.Summary.Cell index={3}>
                        {totalPending}
                      </Table.Summary.Cell>}
                  <Table.Summary.Cell index={4}>
                    {totalInvalid}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    {totalSubmit}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6}>
                    {totalUniqueConsumen}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
              onChange={handleChangeData}
            />
          </div>
        </Col>
      </Row>

      {/* <Row>
        <Col xs={18} xl={12}>
          <Pagination
            style={{ marginTop: "1em" }}
            showSizeChanger
            onShowSizeChange={handleRowsPerPage}
            defaultCurrent={Number(page)}
            current={Number(page)}
            total={totalData}
            onChange={handlePageChange}
          />
        </Col>
        <Col xs={6} xl={12}>
          <div style={{ textAlign: "right" }}>
            <p>
              Showing{" "}
              {page === 1
                ? 1
                : page === 2
                  ? formatNumber(parseInt(rowsPerPage) + 1)
                  : formatNumber((page - 1) * parseInt(rowsPerPage) + 1)}{" "}
              to{" "}
              {page * rowsPerPage > totalData
                ? totalData
                : page * rowsPerPage}{" "}
              of {totalData}
            </p>
          </div>
        </Col>
      </Row> */}
    </>
  );
}

DistributionList.displayName = "DistList"
export default memo(DistributionList)