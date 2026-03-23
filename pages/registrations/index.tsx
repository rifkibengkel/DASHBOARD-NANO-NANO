import React, { useEffect, useReducer, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { PageHeader } from "@ant-design/pro-layout";
import Col from "antd/lib/col";
import Button from "antd/lib/button";
import Skeleton from "antd/lib/skeleton";
import DashboardLayout from "../../components/layouts/Dashboard";
import { getData } from "@api/registrations/list";
import { masterRole } from "../api/master/index";
import { IState } from "../../interfaces/user.interface";
import Notifications from "../../components/Notifications";
import { useRouter } from "next/router";
import { withAuth } from "@/components/authHOC";
import ButtonGroup from "antd/lib/button/button-group";
import { showReactivateConfirm2 } from "@/components/modals/ModalAlert";

const ModalFilter = dynamic(() => import("@/components/DataFilter"), {
  loading: () => <p></p>,
});
const TableRenderer = dynamic(() => import("@/components/TableRenderer"), {
  loading: () => <Skeleton />,
  ssr: false,
});

const Registrations = (props: any, { fallback }: any) => {
  const router = useRouter();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const url = `/api/registrations/list?key=${states.filter.key}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}`;
  const { data, mutate, error, isValidating: isLoading } = useSWR(url);

  const expReg = async () => {
    let param = states.filter;
    exportReg(param);
  };

  const handleSearch = (data: any) => {
    setStates({
      filter: data,
      data: {
        ...states.data,
        dataPerPage: 10,
        currentPage: 1,
      },
    });
  };

  const handleOpenModal = (param: any) => {
    setStates({
      [param.name]: param.value,
      typeModal: param.typeModal,
      dataModal: param.dataModal ? param.dataModal : {},
    });
  };

  const submitUpdate = async (data: any) => {
    let res: any = await fetch(`/api/registrations/edit`, {
      method: "PUT",
      body: JSON.stringify({ ...data }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let resData = await res.json();
    if (resData.statusCode === 409) {
      Notifications("warning", "Warning", resData.message);
      return;
    }

    if (resData.statusCode === 400) {
      Notifications("error", "Error", resData.message);
      return;
    }

    Notifications("success", "Success", "Data Updated");
    mutate();
    return;
  };

  const reactivateUser = async (id: number) => {
    const resp: any = await reactivatU(id);
    if (resp.success) {
      Notifications("success", "Successfuly modified.", "");
      router.reload();
    } else {
      Notifications("error", resp.data, "");
    }
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

  const handleFilter = useCallback(
    (data: any) => {
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
        },
        modalFilter: false,
      });
    },
    [states.filter, states.data]
  );

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

  dataSource.forEach((i: any, index: number) => {
    i.key = index;
    i.no =
      states.data.currentPage === 1
        ? Number(index + 1)
        : states.data.currentPage === 2
        ? Number(states.data.dataPerPage) + (index + 1)
        : (Number(states.data.currentPage) - 1) *
            Number(states.data.dataPerPage) +
          (index + 1);
  });

  let tbc = {
    array: states.master.table,
    addOn: {
      // title: 'Action',
      // render: (text: any, record: any) => (
      //   <ButtonGroup>
      //     <Button
      //       onClick={() => showReactivateConfirm2({ onOk: (() => reactivateUser(record.id)) })}
      //     >
      //       {record.activationStatus === 1 ? "Deactivate" : "Activate"}
      //     </Button>
      //   </ButtonGroup>
      // )
    },
    loading: isLoading,
    dataSource,
    summary: {
      for: "",
      data: {
        totalValid: 0,
        totalPending: 0,
        totalInvalid: 0,
        total: 0,
      },
    },
    pagination: states.data,
    activeFilter: states.filter,
    filtering: handleTableChange,
    searching: handleSearch,
    title: "List of Consumer Registered",
    dateRange: states.filter,
  };

  if (error) {
    return <p>Failed to load</p>;
  }

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="Registrations"
          extra={[
            states.access.m_insert === 1 ? (
              <>
                <Col key="1" style={{ marginRight: "6px" }}>
                  <Button onClick={expReg} className={"button"} shape="round">
                    Export
                  </Button>
                </Col>
                <Col key="2">
                  <Button
                    onClick={() =>
                      handleOpenModal({
                        name: "modalFilter",
                        value: true,
                        // typeModal: "Add",
                      })
                    }
                    className={"button"}
                    shape="round"
                  >
                    Filter
                  </Button>
                </Col>
              </>
            ) : (
              // ) : null
              <Col>
                <Button
                  onClick={() =>
                    handleOpenModal({
                      name: "modalFilter",
                      value: true,
                      // typeModal: "Add",
                    })
                  }
                  className={"button"}
                  shape="round"
                >
                  Filter
                </Button>
              </Col>
            ),
          ]}
        />
        <TableRenderer {...tbc} />
        <ModalFilter
          tgt={"registrations"}
          header={"Filter Registration"}
          open={states.modalFilter}
          handleOpenModal={handleOpenModal}
          handleFilter={handleFilter}
          master={states.master}
          filter={states.filter}
        />
      </SWRConfig>
    </>
  );
};

const exportReg = async (data: any) => {
  await window.open(
    `/api/registrations/export?key=${data.key}&column=${data.columns}&direction=${data.directions}`
  );
};

const reactivatU = async (id: number) => {
  let res: any = await fetch(`/api/registrations/reactivate/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status !== 404) {
    let dataList = await res.json();
    return dataList;
  } else {
    return alert("Error 404");
  }
};

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
  interface RgPagination {
    row: string | number;
    page: string | number;
    key: string;
    direction: string;
    column: string;
    limit: number | string;
    media: string;
    startDate: string;
    endDate: string;
  }

  const params: RgPagination = {
    row: 10,
    page: 0,
    key: "",
    direction: "",
    column: "",
    limit: "",
    media: "",
    startDate: "",
    endDate: "",
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
        "/api/registrations/list": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
        table: JSON.parse(JSON.stringify(getList.tabling)),
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
        startDate: params.startDate,
        endDate: params.endDate,
      },
    },
  };
});

export default Registrations;

Registrations.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
