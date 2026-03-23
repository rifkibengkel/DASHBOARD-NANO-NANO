import React, { useEffect, useReducer } from "react";
import type { ReactElement } from "react";
import useSWR, { SWRConfig } from "swr";
import dynamic from "next/dynamic";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { PageHeader } from "@ant-design/pro-layout";
import { Card, Table, Button, Space, Input } from "antd";
import DashboardLayout from "@/components/layouts/Dashboard";
import { getData } from "../../api/user/list";
import { masterRole } from "../../api/master/index";
import { useApp } from "@/context/AppContext";
import { IState } from "@/interfaces/user.interface";
import Notifications from "@/components/Notifications";
import { showDeleteConfirm } from "@/components/modals/ModalAlert";
import { withAuth } from "@/components/authHOC";
const Modals = dynamic(
  () => import("@/pageComponents/MasterSettings/User/AddMod"),
  { loading: () => <p></p> }
);
const { Search } = Input;

const Users = (props: any, { fallback }: any) => {
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );
  const router = useRouter();
  const { statesContex, setSubmitNotif } = useApp();

  const url = `/api/user/list?page=${states.data.currentPage}&row=${states.data.dataPerPage}
    &column=${states.filter.columns}&direction=${states.filter.directions}`;
  const { data, error } = useSWR(url);

  const deleteUser = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/settings/users/delete?&submit=${data}`);
  };

  const handleOpenModal = (param: any) => {
    setStates({
      [param.name]: param.value,
      typeModal: param.typeModal,
      dataModal: param.dataModal ? param.dataModal : {},
    });
  };

  const submitUpdate = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/settings/users/update?&submit=${data}`);
  };

  const submit = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/settings/users/add?&submit=${data}`);
  };

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
        directions: sorter.order,
      },
    });
  };

  // const handleChange = (e) => {
  //     setStates({
  //         data: {
  //             ...states.data,
  //             [e.target.name]: e.target.value
  //         },
  //         isLoading: true
  //     });
  // };

  useEffect(() => {
    const { type, message, description } = statesContex.submitNotif;
    Notifications(type, message, description);
    setSubmitNotif({ type: "", message: "", description: "" });
  }, []);

  useEffect(() => {
    var columns: any = [
      // {
      //     title: "No",
      //     dataIndex: "no",
      //     key: "no",
      //     width: 50
      // },
      {
        title: "Username",
        dataIndex: "username",
        key: "username",
        sorter: true,
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: true,
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        sorter: true,
      },
      {
        title: "Registered At",
        dataIndex: "created_at",
        key: "created_at",
        sorter: true,
        render: (rcvd_time: string) =>
          `${dayjs(rcvd_time).format("DD-MM-YYYY HH:mm:ss")}`,
      },
    ];

    if (
      states.access.m_insert == 1 ||
      states.access.m_update == 1 ||
      states.access.m_delete == 1
    ) {
      columns.push({
        title: "Action",
        dataIndex: "action",
        key: "action",
        align: "center",
        width: "20%",
        render: (text: any, record: any) => (
          <>
            <Space size="middle">
              {states.access.m_update == 1 ? (
                <Button
                  className={"link"}
                  style={{ margin: "" }}
                  onClick={() =>
                    handleOpenModal({
                      name: "openModal",
                      value: true,
                      typeModal: "Update",
                      dataModal: record,
                    })
                  }
                >
                  Edit
                </Button>
              ) : null}
              {states.access.m_delete == 1 ? (
                <Button
                  className={"link"}
                  style={{ margin: "" }}
                  onClick={() =>
                    showDeleteConfirm({ onOk: () => deleteUser(record) })
                  }
                >
                  Delete
                </Button>
              ) : null}
            </Space>
            {/* <Space size="middle">
                            {states.access.m_update == 1 ?
                                <a className={"link"} style={{ margin: '0 1em 1em 0' }}
                                    onClick={() =>
                                        handleOpenModal({
                                            name: "openModal",
                                            value: true,
                                            typeModal: "Update",
                                            dataModal: record
                                        })
                                    }
                                >
                                    Edit
                                </a>
                                : null}
                            {states.access.m_delete == 1 ?
                                <a className={"link"} style={{ margin: '0 1em 1em 0' }}
                                    onClick={() => showDeleteConfirm({ onOk: (() => deleteUser(record)) })}
                                >
                                    Delete
                                </a>
                                : null}
                        </Space> */}
          </>
        ),
      });
    }

    setStates({
      columns: columns,
    });
  }, [states.access]);

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
          key: states.data.key ? states.data.key : "",
        },
      });
    }
  }, [data]);

  const dataSource = states?.data.list;
  // const page = Number(states.data.currentPage)
  // const rowsPerPage = states.data.dataPerPage.toString()

  dataSource.forEach((i: any, index: number) => {
    i.key = index;
    // i.no =
    //     page === 1
    //         ? formatNumber(index + 1)
    //         : page === 2
    //             ? formatNumber(parseInt(rowsPerPage) + (index + 1))
    //             : formatNumber((page - 1) * parseInt(rowsPerPage) + (index + 1));
  });

  if (error) {
    return <p>Failed to load</p>;
  }

  if (!data && !states.data) {
    setStates({ isLoading: true });
  }

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="User Management"
          extra={[
            states.access.m_insert == 1 ? (
              <Button
                key="1"
                onClick={() =>
                  handleOpenModal({
                    name: "openModal",
                    value: true,
                    typeModal: "Add",
                  })
                }
                className={"button"}
                shape="round"
              >
                Add User
              </Button>
            ) : null,
          ]}
        />
        <Card
          className="custom-card"
          title="List User"
          extra={
            <Search
              name="key"
              placeholder="input search text"
              // value={states.data.key}
              // onSearch={onSearch}
              // onChange={handleChange}
            />
          }
        >
          <Table
            style={{ overflowX: "scroll" }}
            loading={states.isLoading}
            dataSource={dataSource}
            columns={states.columns}
            size="middle"
            pagination={{
              current: states.data.currentPage as number,
              total: states.data.totalData as number,
              pageSize: states.data.dataPerPage as number,
            }}
            onChange={handleTableChange}
          />
        </Card>
        <Modals
          open={states.openModal}
          header={states.typeModal == "Add" ? "Add User" : "Update User"}
          handleOpenModal={handleOpenModal}
          submit={states.typeModal == "Add" ? submit : submitUpdate}
          data={states.dataModal}
          master={states.master}
        />
      </SWRConfig>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
  interface IPagination {
    row: string | number;
    page: string | number;
    key: string;
    direction: string;
    column: string;
    limit: number | string;
  }

  const params: IPagination = {
    row: 10,
    page: 0,
    key: "",
    direction: "",
    column: "",
    limit: "",
  };

  const getList = await getData(params);
  const roleMaster = await masterRole();

  const data = {
    dataPerPage: getList.dataPerPage,
    currentPage: getList.currentPage,
    totalData: getList.totalData,
    totalPage: getList.totalPage,
    list: getList.data,
    key: "",
  };

  return {
    props: {
      fallback: {
        "/api/users/list": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
        role: JSON.parse(JSON.stringify(roleMaster)),
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
      },
    },
  };
});

export default Users;

Users.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
