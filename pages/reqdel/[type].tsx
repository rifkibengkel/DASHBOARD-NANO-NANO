import React, { useReducer, useEffect, useCallback } from "react";
import type { ReactElement } from "react";
import DashboardLayout from "../../components/layouts/Dashboard";
import { PageHeader } from '@ant-design/pro-layout'
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Input from "antd/lib/input";
import Form from "antd/lib/form";
import Row from "antd/lib/row";
import Modal from "antd/lib/modal";
import Table from "antd/lib/table";
import Space from "antd/lib/space"
import Tag from 'antd/lib/tag'
import SearchBar from "../../components/SearchBar"
// import Col from 'antd/lib/col'
// import Table from 'antd/lib/table';
import { IState } from "../../interfaces/promosettings.interface";
import { getData } from "../api/reqdel/list";
import { masterRole } from "../api/master/index";
import { useRouter } from "next/router";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { useApp } from "../../context/AppContext";
import Notifications from "../../components/Notifications";
import dayjs from "dayjs";
// import { TableRenderer } from "@/components/TableRenderer";
import { showApproveConfirm } from "@/components/modals/ModalAlert";
// import ButtonGroup from "antd/lib/button/button-group";
// import Modals from "./_modal";
// const { Search } = Input;

const ReqDel = (props: any, { fallback }: any) => {
  const router = useRouter();
  const { statesContex, setSubmitNotif } = useApp();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const url = `/api/reqdel/list?key=${states.filter.key}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&isApproved=${states.filter.isApproved}`
  const { data, error, isValidating: isLoadingData } = useSWR(url, { revalidateOnMount: false })
  //   const handleOpenModal = useCallback(async (param: any) => {
  //       setStates({
  //           [param.name]: param.value,
  //       });
  // }, [])

  const handleEnter = (data: any) => {
    let trimmed = data.data.trim()
      setStates({ sender: trimmed });
      handleSearch(data.data);  
  };

  // const reactivateCode = async (coupon: string) => {
  //   const resp: any = await reactivatE(coupon)
  //   if(resp.success) {
  //     Notifications('success', "Successfuly reactivated.", '')
  //     setStates({openModal: false})
  //   } else {
  //     Notifications('error', resp.data, '')
  //   }
  // }

  const addToList = async (sender: string) => {
    const resp: any = await addSender(sender)
    if (resp.success) {
      Notifications('success', "Successfuly inputted.", '')
      setStates({ openModal: false })
    } else {
      Notifications('error', resp.data, '')
    }
  }

  const handleSearch = async (data: any) => {
    const res = await getSearch(data);
    if (res.status !== 400) {
      const cp = res.data
      if (cp) {
        // setStates({
        //   openModal: true,
        //   dataDetail: cp
        // })
        Modal.info({
          className: "modal",
          title: "Sender Deletion Listing",
          content: (
            <div>
              {/* <p>Periode: {cp.periodeId}</p> */}
              <p>Status: {cp.status === 1 ? ('Already Added and Approved') : ('Added but not approved.')}</p>
              <p>
                Added Date: {dayjs(cp.created_at).format("DD-MM-YYYY HH:mm:ss")}
              </p>
              {cp.status === 1 ? (
                <p>
                Approved Date: {dayjs(cp.created_at).format("DD-MM-YYYY HH:mm:ss")}
              </p>
              ) : null}
            </div>
          ),
          onOk() { },
        });
      } else {
        Modal.info({
          className: "modal",
          title: "Sender Deletion Listing",
          closable: true,
          content: (
            <div>
              <p>No Sender Deletion Request Detected. Do you want to add this to request line?</p>
            </div>
          ),
          async onOk() {
            await addToList(data)
          },
        });
      }
    } else {
      Modal.info({
        className: "modal",
        title: "Sender Deletion Listing",
        content: (
          <div>
            {/* <p>Periode: {cp.periodeId}</p> */}
            <p>No user detected using this number.</p>
          </div>
        ),
        onOk() { },
      });
    }
  };

  const handleSearchData = (data: any) => {
    setStates({
    filter: data,
    data: {
        ...states.data,
        dataPerPage: 10,
        currentPage: 1,
    },
    })
  }; 

  // const approveThis = async (data: any) => {
  //   const res = await approveReq(data);
  //   if (res.status !== 404) {
  //     Notifications('success', "Successfuly approved.", '')
  //     setStates({ openModal: false })
  //     setTimeout(() => {
  //       router.reload();
  //     }, 1000);
  //   } else {
  //     Notifications('error', res.data, '')
  //   }
  // };

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
    const { type, message, description } = statesContex.submitNotif;
    Notifications(type, message, description);
    setSubmitNotif({ type: "", message: "", description: "" });
  }, []);

  useEffect(() => {
    // let columns: any = TableRenderer(states.master.table)
    let columns: any = [
      {
        title: 'no',
        key: 'no',
        dataIndex: 'no'
      },
      {
        title: 'Sender',
        key: 'sender',
        dataIndex: 'sender',
      },
      {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        render: (x: string) => x == '0' ? <Tag color="warning">UNPROCESSED</Tag> : x == '1' ? <Tag color="success">APPROVED</Tag> : <Tag color="error">REJECTED</Tag>
      },
      {
        title: 'Created At',
        key: 'created_at',
        dataIndex: 'created_at',
        render: (x: any) => dayjs(x).format('DD-MM-YYYY HH:mm:ss')
      }
  ]
    if (states.access.m_insert == 1 || states.access.m_update == 1 || states.access.m_delete == 1) {
      columns.push({
          title: "Action",
          dataIndex: "action",
          key: "action",
          render: (text: any, record: any) => (
              <>
                  <Space size="middle">
                  {states.access.m_update == 1 ?
                          <>
                              {/* <Button type="link" disabled={record.status == '1'} className={"link"} onClick={() => showApproveConfirm({ onOk : (() => approveThis(record.sender))})}>
                                  Approve
                              </Button> */}
                          </>
                          : null}
                  </Space>
              </>
          )
      })
  }
    setStates({
      columns: columns
    })
  }, [states.access])

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

  // if (error) {
  //   return <p>Failed to load</p>
  // }

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="Request Deletion"
        />
        {router.query.type == 'request' ? (
          <Card
          className="custom-card"
          title="Insert Number/Sender"
        >
          <Row>
            <Form layout="inline">
              <Form.Item>
                <Input
                  type="number"
                  placeholder="Input sender here..."
                  onPressEnter={(data: any) =>
                    handleEnter({
                      data: data.target.value,
                      name: "sender",
                    })
                  }
                />
              </Form.Item>
              <Form.Item>
                {/* <Button type="link" shape="circle" icon={<SearchOutlined />} /> */}
              </Form.Item>
            </Form>
          </Row>
        </Card>
        ) : (
          <Card
          className="custom-card"
          title="Sender Deletion Approver"
        extra={<SearchBar handleFilter={handleSearchData} filter={states.filter} />}
        >
          <Table
            style={{ overflowX: 'scroll' }}
            loading={isLoadingData}
            dataSource={dataSource}
            columns={states.columns}
            size="middle"
            pagination={{
              current: states.data.currentPage as number || 0,
              total: states.data.totalData as number || 0,
              pageSize: states.data.dataPerPage as number
            }}
            onChange={handleTableChange}
          />
        </Card>
        )}
      </SWRConfig>
    </>
  );
};

const addSender = async (code: string) => {
  let res: any = await fetch(`/api/reqdel/add/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (res.status !== 404) {
    let dataList = await res.json()
    return dataList
  } else {
    return alert("Error 404")
  }
}

const approveReq = async (code: string) => {
  let res: any = await fetch(`/api/reqdel/modify/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (res.status !== 404) {
    let dataList = await res.json()
    return dataList
  } else {
    return alert("Error 404")
  }
}

const getSearch = async (data: any) => {
  let res = await fetch(`/api/reqdel/find/${data}`);
  if (res.status !== 404) {
    let dataList = await res.json();
    return dataList;
  } else {
    return alert("Error 404");
  }
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  interface IPagination {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    isApproved: string | number
  }

  const params: IPagination = {
    row: 10,
    page: 0,
    key: "",
    direction: "",
    column: "",
    limit: "",
    isApproved: '',
  }

  const getList = await getData(params);
  const roleMaster = await masterRole();

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
        "/api/reqdel": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
        table: JSON.parse(JSON.stringify(getList.tabling)),
        role: JSON.parse(JSON.stringify(roleMaster)),
      },
      columns: [],
      access: {
        m_insert: 1,
        m_update: 1,
        m_delete: 1,
        m_view: 1,
      },
      isLoading: false,
      openModal: false,
      modalType: "",
      dataModal: {},
      editData: "",
      dataDetail: [],
      filter: {
        key: "",
        directions: "",
        columns: "",
        isApproved: '',
      }
    },
  };
};

export default ReqDel;

ReqDel.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
