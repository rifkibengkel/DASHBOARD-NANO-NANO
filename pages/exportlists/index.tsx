import React, { useEffect, useReducer, useCallback } from "react";
import useSWR, { SWRConfig } from "swr";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import DashboardLayout from "../../components/layouts/Dashboard";
import { IState } from "../../interfaces/bwlist.interface";
import { PageHeader } from '@ant-design/pro-layout'
import Button from "antd/lib/button";
import ButtonGroup from "antd/lib/button/button-group";
import { getData } from "../api/exportlists/list";
import { masterRole } from "../api/master/index";
import Skeleton from "antd/lib/skeleton";
import Notifications from "../../components/Notifications";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useApp } from "@/context/AppContext";
import dayjs from "dayjs";
import { withAuth } from "@/components/authHOC";


const TableRenderer = dynamic(() => import("@/components/TableRenderer"), { loading: () => <Skeleton />, ssr: false });

const ExportLists = (props: any, { fallback }: any) => {
  const router = useRouter()
  const { statesContex, setSubmitNotif } = useApp();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const {
    data: arrayList,
    error: errorList,
    isValidating: isLoadingData,
  } = useSWR(`/api/exportlists/list`);

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

  const handleSearch = useCallback((data: any) => {
    setStates({
    filter: data,
    data: {
        ...states.data,
        dataPerPage: 10,
        currentPage: 1,
    },
    })
  }, [states.filter, states.data]); 

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

  const addNewWhitelist = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString('base64')
    router.push(`/whitelist/add?submit=${data}`)
  };

  const modifyWhitelist = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString('base64')
    router.push(`/whitelist/update?submit=${data}`)
  };

  const deleteWhitelist = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString('base64')
    router.push(`/whitelist/delete?submit=${data}`)
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
    if (arrayList) {
      setStates({
        isLoading: false,
        data: {
          ...states.data,
          list: arrayList
        },
      });
    }
  }, [arrayList]);

  useEffect(() => {
    const { type, message, description } = statesContex.submitNotif
    Notifications(type, message, description)
    setSubmitNotif({ type: "", message: "", description: "" })
  }, [])

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

  const exportFiles = async (data: string) => {
      await exportFile(data)
  }


  let tbc = {
    array: [
      {
        title: 'Created At',
        dataIndex: 'created_at',
        key: 'created_at',
        sorter: false,
        render: (x: any) => dayjs(x).format('DD-MM-YYYY HH:mm:ss')
      },
      {
        title: 'Filename',
        dataIndex: 'name',
        key: 'name',
        sorter: false
      }
    ],
    addOn: {
      title: 'Action',
      render: (text: any, record: any) => (
        <ButtonGroup>
          <Button
            onClick={() => exportFiles(record.name)}
          >
            Download
          </Button>
        </ButtonGroup>
      )
    },
    loading: isLoadingData,
    dataSource,
    summary: {
        for: '',
        data: {
            totalValid: 0,
            totalPending: 0,
            totalInvalid: 0,
            total: 0
        }
    },
    pagination: states.data,
    activeFilter: states.filter,
    filtering: handleTableChange,
    searching: handleSearch,
    title: "List of Exported Data",
    dateRange: {startDate: '', endDate: ''}
}

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="Export List"
        />
        <TableRenderer {...tbc} />
      </SWRConfig>
    </>
  );
};

const exportFile = async (data: any) => {
  let res = await window.open(`/api/file/${data}`);
}

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
    list: getList,
    key: "",
  };

  return {
    props: {
      fallback: {
        "/api/exportlists/list": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
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
})

export default ExportLists;

ExportLists.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
