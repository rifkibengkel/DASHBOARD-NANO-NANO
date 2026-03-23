import React, { useEffect, useReducer, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { PageHeader } from "@ant-design/pro-layout";
import Button from "antd/lib/button";
import Space from "antd/lib/space";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Skeleton from "antd/lib/skeleton";
import DashboardLayout from "@/components/layouts/Dashboard";
import { getData } from "@api/entries/list";
import { masterRole } from "@api/master/index";
import { useApp } from "@/context/AppContext";
import { IState } from "@/interfaces/entries.interface";
import Notifications from "@/components/Notifications";
import Link from "next/link";
import { masterStore } from "@/pages/api/master/_model";
import dayjs from "dayjs";
import { withAuth } from "@/components/authHOC";

const ModalFilter = dynamic(() => import("@/components/DataFilter"), {
  loading: () => <p></p>,
});

const Modals = dynamic(
  () => import("../../pageComponents/Entries/ModalDetail"),
  { loading: () => <p></p> }
);

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), {
  loading: () => <Skeleton />,
  ssr: false,
});

const Entries = (props: any, { fallback }: any) => {
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const { statesContex, setSubmitNotif } = useApp();

  const url = `/api/entries/list?type=1&key=${states.filter.key}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&column=${states.filter.columns}&direction=${states.filter.directions}&isValid=${states.filter.isValid}&isValidAdmin=${states.filter.isValidAdmin}&isApprovedAdmin=${states.filter.isApprovedAdmin}&media=${states.filter.media}&storeId=${states.filter.storeId}`;
  const { data, error, isValidating: isLoadingData } = useSWR(url);

  const expEntries = async () => {
    let param = states.filter;
    await exportEntries(param);
    Notifications("success", "Processed", "Export is on process.");
  };

  const expEntriesPrd = async () => {
    let param = states.filter;
    await exportEntriesPrd(param);
  };

  const expEntriesCoupons = async () => {
    let param = states.filter;
    await exportCoupons(param);
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
          isValid: data.isValid,
          isValidAdmin: data.isValidAdmin,
          isApprovedAdmin: data.isApprovedAdmin,
          media: data.media,
          storeId: data.storeId,
        },
        modalFilter: false,
      });
    },
    [states.filter, states.data]
  );

  const handleSearch = useCallback(
    (data: any) => {
      setStates({
        filter: data,
        data: {
          ...states.data,
          dataPerPage: 10,
          currentPage: 1,
        },
      });
    },
    [states.filter, states.data]
  );

  const handleOpenModal = useCallback(async (param: any) => {
    if (param.name === "openModal" && param.id) {
      const response = await getEntryDetail(param.id);
      setStates({
        dataDetail: response.entries[0],
        [param.name]: param.value,
      });
    } else {
      setStates({
        [param.name]: param.value,
      });
    }
  }, []);

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
    const { type, message, description } = statesContex.submitNotif;
    Notifications(type, message, description);
    setSubmitNotif({ type: "", message: "", description: "" });
    setStates({
      ...states,
      filter: states.filter,
    });
  }, []);

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
    align: "center",
    addOn: {
      align: "center",
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "7%",
      render: (text: any, record: any) => {
        const disabler =
          record.is_valid === 0 ||
          record.is_approved_admin === 1 ||
          record.is_approved_admin === 2
            ? true
            : false;

        const disablerA =
          record.is_valid_admin === 1 && record.is_approved_admin === 0
            ? false
            : true;

        const disablerH =
          record.is_approved_admin === 1 &&
          record.voucher_number != null &&
          record.voucher_number != "" &&
          record.is_exist_winner == 0
            ? false
            : true;
        const urlReturn = (mode: string) => {
          return `/entries/entry?entries=${record.id}&key=${states.filter.key}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&column=${states.filter.columns}&direction=${states.filter.directions}&isValid=${states.filter.isValid}&isValidAdmin=${states.filter.isValidAdmin}&isApprovedAdmin=${states.filter.isApprovedAdmin}&storeId=${states.filter.storeId}&mode=${mode}`;
          // return `/entries`;
        };

        return (
          <>
            <Space size="middle">
              {states.access.m_update == 1 ? (
                <>
                  <Button type="link" className={"button-action"} shape="round">
                    <Link href={urlReturn("1")} passHref>
                      View
                    </Link>
                  </Button>
                  {/* <Button
                    type="link"
                    disabled={disabler}
                    className={
                      disabler ? "button-action-dis-entry" : "button-action"
                    }
                    shape="round"
                  >
                    <Link href={urlReturn("2")} passHref>
                      Entry
                    </Link>
                  </Button>
                  <Button
                    type="link"
                    className={
                      disablerA ? "button-action-dis" : "button-action-app"
                    }
                    shape="round"
                    disabled={disablerA}
                  >
                    <Link href={urlReturn("3")} passHref>
                      Approve
                    </Link>
                  </Button> */}
                  {/* <Button
                    type="link"
                    className={
                      disablerH ? "button-action-dis-set" : "button-action-set"
                    }
                    shape="round"
                    disabled={disablerH}
                  >
                    <Link href={urlReturn("5")} passHref>
                      Set 100 Winner
                    </Link>
                  </Button> */}
                </>
              ) : null}
            </Space>
          </>
        );
      },
    },
    loading: isLoadingData,
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
    title: "List Entries",
    dateRange: states.filter,
  };

  if (error) {
    return <p>Failed to load</p>;
  }

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="Entries Management"
          extra={[
            // states.access.m_insert == 1 ?
            <Row key="1">
              {states.master.isAdmin ? (
                <>
                  <Col style={{ marginRight: "1em" }}>
                    <Button
                      onClick={expEntries}
                      className={"button"}
                      shape="round"
                    >
                      Export
                    </Button>
                  </Col>
                  {/* <Col style={{ marginRight: "1em" }}>
                    <Button
                      onClick={expEntriesPrd}
                      className={"button"}
                      shape="round"
                    >
                      Export By Products
                    </Button>
                  </Col>
                  <Col style={{ marginRight: "1em" }}>
                    <Button
                      onClick={expEntriesCoupons}
                      className={"button"}
                      shape="round"
                    >
                      Export By Coupons
                    </Button>
                  </Col> */}
                </>
              ) : null}
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
            //  : null
          ]}
        />
        <TableRenderer {...tbc} />
        <Modals
          open={states.openModal}
          header={"Entry Detail"}
          handleOpenModal={handleOpenModal}
          data={states.dataDetail}
        />
        <ModalFilter
          tgt={"entries"}
          header={"Filter Entries"}
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

const exportEntries = async (data: any) => {
  const res = await window.open(
    `/api/entries/export?key=${data.key}&page=${data.currentPage}&row=${data.dataPerPage}&startDate=${data.startDate}&endDate=${data.endDate}&column=${data.columns}&direction=${data.directions}&isValid=${data.isValid}&isValidAdmin=${data.isValidAdmin}&isApprovedAdmin=${data.isApprovedAdmin}&media=${data.media}&storeId=${data.storeId}`
  );
  // let res = await fetch(
  //   `/api/entries/export?key=${data.key}&page=${data.currentPage}&row=${data.dataPerPage}&startDate=${data.startDate}&endDate=${data.endDate}&column=${data.columns}&direction=${data.directions}&isValid=${data.isValid}&isValidAdmin=${data.isValidAdmin}&isApprovedAdmin=${data.isApprovedAdmin}&media=${data.media}&storeId=${data.storeId}`
  // );
  // if (res.status !== 404) {
  //   return "ok";
  // } else {
  //   return alert("Error 404");
  // }
};

const exportEntriesPrd = async (data: any) => {
  let res = await window.open(
    `/api/entries/exportByProducts?key=${data.key}&isValid=${data.isValid}&startDate=${data.startDate}&endDate=${data.endDate}&column=${data.columns}&direction=${data.directions}`
  );
};

const exportCoupons = async (data: any) => {
  let res = await window.open(
    `/api/entries/exportByCoupons?key=${data.key}&isValid=${data.isValid}&startDate=${data.startDate}&endDate=${data.endDate}&column=${data.columns}&direction=${data.directions}`
  );
};

const getEntryDetail = async (data: any) => {
  let res = await fetch(`/api/entries/${data}`);
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
    isValid: string | number;
    isValidAdmin: string | number;
    isApprovedAdmin: string | number;
    type: string;
  }

  let date = new Date();
  const {
    row,
    page,
    key,
    direction,
    column,
    startDate,
    endDate,
    isValid,
    isValidAdmin,
    isApprovedAdmin,
    mode,
  } = ctx.query as any;

  const params: IPagination = {
    row: row ?? 10,
    page: page ?? 0,
    key: key ?? "",
    direction: direction ?? "",
    column: column ?? "",
    limit: "",
    media: "",
    startDate: startDate ?? "",
    endDate: endDate ?? "",
    isValid: isValid ?? "",
    isValidAdmin: isValidAdmin ?? "",
    isApprovedAdmin: isApprovedAdmin ?? "",
    type: "",
  };

  const getList = await getData(params);
  const roleMaster = await masterRole();
  const storeMaster = await masterStore();

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
        "/api/entries/list": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
        table: JSON.parse(JSON.stringify(getList.tabling)),
        role: JSON.parse(JSON.stringify(roleMaster)),
        store: JSON.parse(JSON.stringify(storeMaster)),
      },
      columns: [],
      isLoading: false,
      openModal: false,
      typeModal: "",
      dataModal: {},
      filter: {
        startDate: startDate ?? params.startDate,
        endDate: endDate ?? params.endDate,
        isValid: isValid ?? "",
        isValidAdmin: isValidAdmin ?? "",
        isApprovedAdmin: isApprovedAdmin ?? "",
        key: key ?? "",
        directions: direction ?? "",
        columns: column ?? "",
        media: "",
      },
    },
  };
});

export default Entries;

Entries.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
