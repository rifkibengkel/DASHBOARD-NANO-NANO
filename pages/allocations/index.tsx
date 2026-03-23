import React, { useEffect, useReducer } from "react";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { PageHeader } from "@ant-design/pro-layout";
import Button from "antd/lib/button";
import Skeleton from "antd/lib/skeleton";
import DashboardLayout from "@/components/layouts/Dashboard";
import { getData } from "../api/allocations/list";
import { masterPrizes, masterRegions, masterRole } from "../api/master/index";
import { useRouter } from "next/router";
import { withAuth } from "@/components/authHOC";

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), {
  loading: () => <Skeleton />,
  ssr: false,
});

const Modals = dynamic(
  () => import("../../pageComponents/Allocations/AddMod"),
  { loading: () => <p></p> }
);

const Allocations = (props: any, { fallback }: any) => {
  const [states, setStates] = useReducer(
    (state: any, newState: Partial<any>) => ({ ...state, ...newState }),
    props
  );

  const router = useRouter();
  const url = `/api/allocations/list?page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&condition=daily`;
  const { data, error, isValidating: isLoading } = useSWR(url);

  const handleOpenModal = (param: any) => {
    setStates({
      [param.name]: param.value,
      typeModal: param.typeModal,
      dataModal: param.dataModal ? param.dataModal : {},
    });
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

  const addAllocation = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/allocations/add?submit=${data}`);
  };

  const modifyAllocation = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/allocations/update?submit=${data}`);
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
    addOn: {},
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
    searching: () => {},
    title: "List of Prize Allocated",
    dateRange: states.filter,
  };

  if (error) {
    return <p>Failed to load</p>;
  }

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title={`Control Allocations`}
          extra={[
            states.access.m_insert == 1 ? (
              // <Row>
              //     <Col>
              <Button
                key="1"
                onClick={() =>
                  handleOpenModal({
                    name: "openModal",
                    typeModal: "modalAdd",
                    value: true,
                  })
                }
                className={"button"}
                shape="round"
              >
                Add
              </Button>
            ) : // </Col>
            // <Col>
            // <Button key="2"
            // onClick={() => handleOpenModal({
            //   name: 'openModal',
            //   typeModal: 'modalEdit',
            //   value: true
            // })}
            //     className={'button'}
            //     shape="round"
            //     style={{marginLeft: '2px'}}
            // >
            //     Modify
            // </Button>
            // </Col>
            // </Row>
            null,
          ]}
        />
        <TableRenderer {...tbc} />
        <Modals
          open={states.openModal}
          header={
            states.typeModal == "modalAdd"
              ? "Add Allocation"
              : "Update Allocation"
          }
          handleOpenModal={handleOpenModal}
          // submit={states.typeModal == "Add" ? submit : submitUpdate}
          data={states.dataModal}
          master={states.master}
          addNewAllocation={addAllocation}
          editAllocation={modifyAllocation}
        />
      </SWRConfig>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
  interface RgPagination {
    row: string | number;
    page: string | number;
    key: string;
    direction: string;
    column: string;
    limit: number | string;
    condition: string;
    threshold: string;
  }

  const params: RgPagination = {
    row: 10,
    page: 0,
    key: "",
    direction: "",
    column: "",
    limit: "",
    condition: "daily",
    threshold: "",
  };

  const getList = await getData(params);
  const roleMaster = await masterRole();
  const prizeMaster = await masterPrizes();
  const regions = await masterRegions();

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
        "/api/allocations/list": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
        table: JSON.parse(JSON.stringify(getList.tabling)),
        role: JSON.parse(JSON.stringify(roleMaster)),
        prizes: JSON.parse(JSON.stringify(prizeMaster)),
        region: JSON.parse(JSON.stringify(regions)),
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

export default Allocations;

Allocations.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
