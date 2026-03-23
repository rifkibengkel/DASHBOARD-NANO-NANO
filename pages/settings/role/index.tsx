import React, { useEffect, useReducer } from "react";
import type { ReactElement } from "react";
import useSWR, { useSWRConfig, SWRConfig } from "swr";
import axios from "axios";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { PageHeader } from "@ant-design/pro-layout";
import { Card, Table, Button, Space, Tag, Input } from "antd";
import DashboardLayout from "../../../components/layouts/Dashboard";
import Notifications from "../../../components/Notifications";

import { getData } from "../../api/role/list";
import { masterRole } from "../../api/master/index";
import { IState } from "../../../interfaces/user.interface";
import { showDeleteConfirm } from "../../../components/modals/ModalAlert";
import { useApp } from "../../../context/AppContext";
import { withAuth } from "@/components/authHOC";
const { Search } = Input;

const Role = (props: any, { fallback }: any) => {
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );
  const { mutate } = useSWRConfig();
  const { statesContex, setSubmitNotif } = useApp();
  const router = useRouter();

  const url = `/api/role/list?page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}`;
  const { data, error } = useSWR(url);

  const deleteRole = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/settings/role/delete?&submit=${data}`);
  };

  const handleOpenModal = (param: any) => {
    setStates({
      [param.name]: param.value,
      typeModal: param.typeModal,
      dataModal: param.dataModal ? param.dataModal : {},
    });
  };

  const submitUpdate = async (param: any) => {
    setStates({ isLoading: true });
    mutate(url, async (items: any) => {
      // let's update the todo with ID `1` to be completed,
      // this API returns the updated data

      await axios.put("/api/users/update", { ...param });

      // filter the list, and return it with the updated item
      const filteredRole = items.data.filter(
        (item: any) => item.username !== param.username
      );

      setStates({ isLoading: false });
      items.data = [...filteredRole, { ...param }];

      setStates({
        openModal: false,
        typeModal: "",
        isLoading: false,
        dataModal: {},
      });
      return items;
    });
  };

  const submit = async (param: any) => {
    var item = data ? data.data : states.data.list;
    const postUrl = `/api/users/add`;

    setStates({
      isLoading: true,
    });

    // update the local data immediately, but disable the revalidation
    mutate(postUrl, { ...item, ...param }, false);

    // send a request to the API to update the source
    await axios.post(postUrl, {
      ...param,
    });

    // trigger a revalidation (refetch) to make sure our local data is correct
    mutate(url);
    setStates({
      openModal: false,
      typeModal: "",
      isLoading: false,
    });
  };

  // const handleTableChange = (pagination, filters, sorter) => {
  //     setStates({
  //         data: {
  //             ...states.data,
  //             dataPerPage: pagination.pageSize,
  //             currentPage: pagination.current,
  //             column: sorter.field,
  //             direction: sorter.order
  //         }
  //     })
  // };

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
    var columns: any = [
      // {
      //     title: "No",
      //     dataIndex: "no",
      //     key: "no",
      //     width: 50
      // },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        sorter: true,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (record: any) => (
          <>
            {record == 1 ? (
              <Tag color="green" key={record}>
                ACTIVE
              </Tag>
            ) : null}
            {record == 0 ? (
              <Tag color="red" key={record}>
                INACTIVE
              </Tag>
            ) : null}
          </>
        ),
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
        width: "25%",
        render: (text: any, record: any) => (
          <>
            <Space size="middle">
              {states.access.m_update == 1 ? (
                <Link
                  legacyBehavior
                  href={`/settings/role/update?role=${record.description}`}
                  key={"linkEdit"}
                >
                  <Button className={"link"}>Edit</Button>
                </Link>
              ) : null}
              {states.access.m_delete == 1 ? (
                <Button
                  className={"link"}
                  onClick={() =>
                    showDeleteConfirm({ onOk: () => deleteRole(record) })
                  }
                >
                  Delete
                </Button>
              ) : // <a
              //   className={"link"}
              //   onClick={() =>
              //     showDeleteConfirm({ onOk: () => deleteRole(record) })
              //   }
              // >
              //   Delete
              // </a>
              null}
            </Space>
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

  useEffect(() => {
    const { type, message, description } = statesContex.submitNotif;
    Notifications(type, message, description);
    setSubmitNotif({ type: "", message: "", description: "" });
    if (router.query) {
      router.push(
        {
          pathname: "/settings/role",
          query: {},
        },
        undefined,
        { shallow: true }
      );
    }
  }, []);

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
          title="Role Management"
          extra={[
            states.access.m_insert == 1 ? (
              <Link href={`/settings/role/add`} key={"link1"}>
                <Button key="1" className={"button"} shape="round">
                  Add Role
                </Button>
              </Link>
            ) : null,
          ]}
          // subTitle="This is a subtitle"
        />
        <Card
          className="custom-card"
          title="List Role"
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
            // onChange={handleTableChange}
          />
        </Card>
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
        "/api/role/list": JSON.parse(JSON.stringify(data)),
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

export default Role;

Role.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
