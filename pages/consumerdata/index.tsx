import React, { useEffect, useReducer } from "react";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import { PageHeader } from "@ant-design/pro-layout";
import Button from "antd/lib/button";
import Skeleton from "antd/lib/skeleton";
import DashboardLayout from "@/components/layouts/Dashboard";
import { getData } from "@api/consumerdata/list";
import { masterRole } from "../api/master/index";
import { IState } from "@/interfaces/user.interface";
// import TableRenderer from "@/components/TableRenderer";
import dayjs from "dayjs";
// import { showApproveConfirm } from "@/components/modals/ModalAlert";
import { useRouter } from "next/router";
import Notifications from "@/components/Notifications";
import { withAuth } from "@/components/authHOC";
import ButtonGroup from "antd/lib/button/button-group";

const ModalFilter = dynamic(() => import("@/components/DataFilter"), {
  loading: () => <p></p>,
});

const Details = dynamic(() => import("@/pageComponents/ConsumerData/Detail"), {
  loading: () => <p></p>,
});

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), {
  loading: () => <Skeleton />,
  ssr: false,
});

const ConsumerData = (props: any, { fallback }: any) => {
  let router = useRouter();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const url = `/api/consumerdata/list?key=${states.filter.key}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}`;
  const { data, error, isValidating: isLoading } = useSWR(url);

  const expCnst = async () => {
    let param = states.filter;
    exportCnst(param);
  };

  // console.log(states);

  const handleFilter = (data: any) => {
    setStates({
      filter: {
        ...states.filter,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      modalFilter: false,
    });
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

  // const handleOpenModal = (param: any) => {
  //   setStates({
  //     [param.name]: param.value,
  //     typeModal: param.typeModal,
  //     dataModal: param.dataModal ? param.dataModal : {},
  //   });
  // };
  const handleOpenModal = async (param: any) => {
    if (param.name === "openModal" && param.id) {
      const response = await getPointHistory(param.id);
      setStates({
        dataDetail: response,
        [param.name]: param.value,
      });
      return;
    }

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

  const approveRanked = async () => {
    await approveRnk();
    Notifications("success", "Approve Success.", "");
    router.reload();
  };

  // const handleOpenModal = (data: any) => {
  //   if (data.id !== undefined) {
  //     setStates({
  //       editData: data,
  //       idList: data.id,
  //       fullname: data.fullname,
  //       sender: data.sender,
  //       [data.name]: data.value,
  //       modalType: data.type,
  //     });
  //   } else {
  //     setStates({
  //       [data.name]: data.value,
  //       editData: "",
  //       modalType: data.type,
  //     });
  //   }
  // };

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
      title: "Total Submit",
      children:
        // getUser().prjType.toString()
        [
          {
            title: "Valid",
            dataIndex: "total_submit_valid",
            key: "total_submit_valid",
            sorter: true,
          },
          // {
          //     title: 'Pending',
          //     dataIndex: 'total_submit_pending',
          //     key: 'total_submit_pending',
          //     sorter: true,
          // },
          {
            title: "Invalid",
            dataIndex: "total_submit_invalid",
            key: "total_submit_invalid",
            sorter: true,
          },
          {
            title: "Total",
            dataIndex: "total_submit",
            key: "total_submit",
            sorter: true,
          },
          {
            width: "10%",
            // align: "center",
            title: "Point Record",
            render: (text: any, record: any) => (
              <Button
                onClick={() => {
                  handleOpenModal({
                    name: "openModal",
                    value: true,
                    id: record.id,
                  });
                }}
              >
                Transactions
              </Button>
            ),
          },
        ],
    },
    loading: isLoading,
    dataSource,
    summary: {
      for: "consumer_data",
      data: {
        totalValid: !data ? 0 : data.totalValid,
        totalPending: !data ? 0 : data.totalPending,
        totalInvalid: !data ? 0 : data.totalInvalid,
        total: !data ? 0 : data.total,
      },
    },
    pagination: states.data,
    activeFilter: states.filter,
    filtering: handleTableChange,
    searching: handleSearch,
    title: "Amount of Entries per Consumer",
    dateRange: states.filter,
  };

  if (error) {
    return <p>Failed to load</p>;
  }

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="Consumer Data"
          extra={[
            <Row key="1">
              {states.access.m_insert === 1 ? (
                <Col style={{ marginRight: "1em" }}>
                  <Button onClick={expCnst} className={"button"} shape="round">
                    Export
                  </Button>
                </Col>
              ) : null}
              <Col>
                <Button
                  key="1"
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
            </Row>,
          ]}
        />
        <TableRenderer {...tbc} />
        <Details
          open={states.openModal}
          header={"Point History"}
          handleOpenModal={handleOpenModal}
          data={states.dataDetail}
          master={states.master}
        />

        <ModalFilter
          tgt={"consumer"}
          header={"Filter Consumers"}
          open={states.modalFilter}
          handleOpenModal={handleOpenModal}
          handleFilter={handleFilter}
          filter={states.filter}
        />
      </SWRConfig>
    </>
  );
};

const getPointHistory = async (data: any) => {
  let res = await fetch(`/api/consumerdata/${data}`);
  if (res.status !== 404) {
    let dataList = await res.json();
    return dataList;
  } else {
    return alert("Error 404");
  }
};

const exportCnst = async (data: any) => {
  await window.open(
    `/api/consumerdata/export?key=${data.key}&column=${data.columns}&direction=${data.directions}&startDate=${data.startDate}&endDate=${data.endDate}`
  );
};

const approveRnk = async () => {
  let res: any = await fetch(
    `/api/bigfive/approve/${dayjs().format("YYYYMM")}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (res.status !== 404) {
    let dataList = await res.json();
    return dataList;
  } else {
    return alert("Error 404");
  }
};

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
  interface IPagination {
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

  let date = new Date();
  const params: IPagination = {
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
        "/api/consumerdata/list": JSON.parse(JSON.stringify(data)),
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

export default ConsumerData;

ConsumerData.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
