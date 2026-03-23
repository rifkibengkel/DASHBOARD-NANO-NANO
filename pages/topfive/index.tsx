import React, { useEffect, useReducer } from "react";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps, NextApiRequest } from "next";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import { PageHeader } from "@ant-design/pro-layout";
import Card from "antd/lib/card";
import Table from "antd/lib/table";
import SearchBar from "../../components/SearchBar";
import Button from "antd/lib/button";
import DashboardLayout from "../../components/layouts/Dashboard";
import { getData } from "../api/bigfive/list";
import { masterRole } from "../api/master/index";
import { IState } from "../../interfaces/user.interface";
import dayjs from "dayjs";
import { showApproveConfirm } from "@/components/modals/ModalAlert";
import { useRouter } from "next/router";
import Notifications from "@/components/Notifications";
import { formatNumber } from "@/lib/clientHelper";
import { withAuth } from "@/components/authHOC";

// const mainUrl = process.env.APP_DOMAIN

const Modals = dynamic(() => import("./_filter"), { loading: () => <p></p> });

const Big5 = (props: any, { fallback }: any) => {
  let router = useRouter();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const url = `/api/bigfive/list?type=1&key=${states.filter.key}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&period=${states.filter.period}`;
  const {
    data,
    error,
    isValidating: isLoadingData,
  } = useSWR(url, { revalidateOnMount: false });

  const expCnst = async () => {
    let param = states.filter;
    await exportCnst(param);
  };

  const handleFilter = (data: any) => {
    setStates({
      filter: {
        ...states.filter,
        period: dayjs(data.periode).format('YYYY-MM'),
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

  const approveRanked = async () => {
    await approveRnk();
    Notifications("success", "Approve Success.", "");
    router.reload();
  };

  useEffect(() => {
    if (data) {
      setStates({
        isLoading: false,
        isApproved: data.isApproved,
        currentPeriode: data.currentPeriode,
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

  const columns2 = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      render: (x: number) => formatNumber(x),
    },
    {
      title: "Name",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Total Point",
      dataIndex: "point",
      key: "point",
      render: (x: number) => formatNumber(x),
    },
  ];

  if (error) {
    return <p>Failed to load</p>;
  }

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title={`Top Seven (${states.currentPeriode ? dayjs(states.currentPeriode, "YYYY-MM").format(
            "MMMM YYYY"
          ) : 'No Data'})`}
          extra={[
            // states.access.m_insert == 1 ?
            <Row key="1">
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
            </Row>,
          ]}
        />
        <Card
          className="custom-card"
          title="Top 7 List"
          extra={
            <SearchBar handleFilter={handleSearch} filter={states.filter} />
          }
        >
          {states.isApproved === 0 ? (
            <Row style={{ paddingBottom: "1em" }}>
              <Col span={2}>
                <Button
                  onClick={() =>
                    showApproveConfirm({ onOk: () => approveRanked() })
                  }
                  className={"button"}
                  shape="round"
                >
                  Approve
                </Button>
              </Col>
            </Row>
          ) : null}
          <Row style={{ paddingBottom: "2em" }}>
            <Col span={12}>
              <Table
                loading={isLoadingData}
                dataSource={dataSource}
                columns={columns2}
                size="middle"
                pagination={false}
                // pagination={{
                //   current: (states.data.currentPage as number) || 0,
                //   total: (states.data.totalData as number) || 0,
                //   pageSize: states.data.dataPerPage as number,
                // }}
                // onChange={handleTableChange}
              />
            </Col>
          </Row>
        </Card>
        <Modals
          header={"Select Periode"}
          open={states.modalFilter}
          handleOpenModal={handleOpenModal}
          handleFilter={handleFilter}
          master={states.master}
        />
      </SWRConfig>
    </>
  );
};

const exportCnst = async (data: any) => {
  let res = await window.open(
    `/api/bigfive/export?key=${data.key}&column=${data.columns}&direction=${data.directions}&startDate=${data.startDate}&endDate=${data.endDate}`
  );
};

const approveRnk = async () => {
  let res: any = await fetch(
    `/api/bigfive/approvare/${dayjs().subtract(1, "months").format("YYYY-MM")}`,
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
    period: string;
    limit: number | string;
  }

  const params: IPagination = {
    row: 10,
    page: 0,
    key: "",
    limit: "",
    period: dayjs().subtract(1, "months").format("YYYY-MM"),
  };

  // let topfive = [] as any
  // const getTop5 = await fetch(`${mainUrl}/api/bigfive/list/${dayjs().format('YYYYMM')}`)
  // if (getTop5.status !== 404) {
  //     topfive = await getTop5.json();
  // } else {
  // alert("Error 404");
  // }

  const getList = await getData(params);
  const roleMaster = await masterRole();

  const data = {
    dataPerPage: getList.dataPerPage,
    currentPage: getList.currentPage,
    totalData: getList.totalData,
    totalPage: getList.totalPage,
    list: getList.data,
    isApproved: getList.isApproved,
    key: "",
  };

  let prds = getList.periodes;

  prds.forEach((i: any, index: number) => {
    i.label = dayjs(i.value).format("MMMM YYYY");
  });

  return {
    props: {
      fallback: {
        "/api/bigfive/list": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      //   isApproved: JSON.parse(JSON.stringify(data.isApproved)),
        currentPeriode: JSON.parse(JSON.stringify(getList.currentPeriode)),
      master: {
        role: JSON.parse(JSON.stringify(roleMaster)),
        periodes: JSON.parse(JSON.stringify(prds)),
      },
      columns: [],
      isLoading: false,
      openModal: false,
      typeModal: "",
      dataModal: {},
      filter: {
        key: "",
        period: params.period,
      },
    },
  };
});

export default Big5;

Big5.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
