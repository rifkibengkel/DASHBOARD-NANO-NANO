import React, { useEffect, useReducer, Suspense, useCallback } from "react";
import useSWR, { SWRConfig } from "swr";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import DashboardLayout from "../../components/layouts/Dashboard";
import { IState } from "../../interfaces/bwlist.interface";
import { PageHeader } from "@ant-design/pro-layout";
import Button from "antd/lib/button";
import ButtonGroup from "antd/lib/button/button-group";
import { getData } from "../api/blacklist/list";
import { masterRole } from "../api/master/index";
// import Button from "antd/lib/button";
import Skeleton from "antd/lib/skeleton";
import { useApp } from "../../context/AppContext";
import Notifications from "../../components/Notifications";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { showDeleteConfirm } from "@/components/modals/ModalAlert";
import { withAuth } from "@/components/authHOC";

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), {
  loading: () => <Skeleton />,
  ssr: false,
});

const Modals = dynamic(() => import("../../pageComponents/BlackWhite/AddMod"), {
  loading: () => <p></p>,
});
const Blacklists = (props: any, { fallback }: any) => {
  const router = useRouter();
  const { statesContex, setSubmitNotif } = useApp();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const {
    data: arrayBlacklist,
    mutate: blRefresh,
    error: errorBlacklist,
    isValidating: isLoadingData,
  } = useSWR(
    `/api/blacklist/list?row=${states.data.dataPerPage}&page=${states.data.currentPage}&key=${states.filter.key}&columnSearch=${states.filter.columnSearch}&column=${states.filter.columns}&direction=${states.filter.directions}`
  );

  const handleRowsPerPage = (e: any, data: any) => {
    let { filter } = states;
    let datas = {
      key: filter.key,
      columns: "",
      columnSearch: filter.columnSearch,
      directions: "",
      row: data,
      page: 1,
    };
    setStates({
      filter: datas,
    });
  };

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

  const handleOpenModal = (data: any) => {
    if (data.id !== undefined) {
      setStates({
        editData: data,
        idList: data.id,
        fullname: data.fullname,
        sender: data.sender,
        [data.name]: data.value,
        modalType: data.type,
      });
    } else {
      setStates({
        [data.name]: data.value,
        editData: "",
        modalType: data.type,
      });
    }
  };

  const handleFilter = (data: any) => {
    setStates({
      filter: data,
      isLoading: true,
    });
  };

  const addNewBlacklist = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/blacklist/add?submit=${data}`);
  };

  const modifyBlacklist = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/blacklist/update?submit=${data}`);
  };

  const deleteBlacklist = async (param: any) => {
    param.name = "";
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/blacklist/delete?submit=${data}`);
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
    if (arrayBlacklist) {
      setStates({
        isLoading: false,
        data: {
          ...states.data,
          dataPerPage: arrayBlacklist.dataPerPage,
          currentPage: arrayBlacklist.currentPage,
          totalData: arrayBlacklist.totalData,
          totalPage: arrayBlacklist.totalPage,
          list: arrayBlacklist.data,
          key: states.data.key ? states.data.key : "",
        },
      });
    }
  }, [arrayBlacklist]);

  useEffect(() => {
    const { type, message, description } = statesContex.submitNotif;
    Notifications(type, message, description);
    setSubmitNotif({ type: "", message: "", description: "" });
  }, []);

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
      width: "15%",
      // align: "center",
      title: "Action",
      render: (text: any, record: any) => (
        <ButtonGroup>
          <Button
            className={"button-action"}
            shape="round"
            style={{ marginRight: "10px" }}
            onClick={() =>
              handleOpenModal({
                id: record.id,
                fullname: record.name,
                sender: record.sender,
                id_number: record.id_number,
                value: true,
                name: "modalAny",
                type: "modalEdit",
              })
            }
          >
            Edit
          </Button>
          <Button
            className={"button-action-app"}
            shape="round"
            onClick={() =>
              showDeleteConfirm({ onOk: () => deleteBlacklist(record) })
            }
          >
            Delete
          </Button>
        </ButtonGroup>
      ),
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
    title: "BlackList",
    dateRange: { startDate: "", endDate: "" },
  };

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="Blacklist"
          extra={[
            states.access.m_insert == 1 ? (
              <Button
                key="1"
                onClick={() =>
                  handleOpenModal({
                    name: "modalAny",
                    type: "modalAdd",
                    value: true,
                  })
                }
                className={"button"}
                shape="round"
              >
                Add
              </Button>
            ) : null,
          ]}
        />
        <TableRenderer {...tbc} />
        <Modals
          data={states.modalType === "modalAdd" ? "" : states.editData}
          open={states.modalAny}
          header="Add & Edit"
          handleOpenModal={handleOpenModal}
          addNewList={addNewBlacklist}
          editList={modifyBlacklist}
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
  }

  const params: RgPagination = {
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
        "/api/blacklist/list": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
        table: JSON.parse(JSON.stringify(getList.tabling)),
        role: JSON.parse(JSON.stringify(roleMaster)),
      },
      columns: [],
      isLoading: false,
      openModal: false,
      modalType: "",
      dataModal: {},
      editData: "",
      filter: {
        row: 10,
        page: 0,
        key: "",
        direction: "",
        column: "",
        limit: "",
        columnSearch: "",
      },
    },
  };
});

export default Blacklists;

Blacklists.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
