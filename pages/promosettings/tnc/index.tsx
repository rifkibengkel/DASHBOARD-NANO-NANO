import React, { useReducer, useEffect } from "react";
import type { ReactElement } from "react";
import DashboardLayout from "@/components/layouts/Dashboard";
import dynamic from "next/dynamic";
import { PageHeader } from "@ant-design/pro-layout";
import Button from "antd/lib/button";
import Skeleton from "antd/lib/skeleton";
import { IState } from "@/interfaces/promosettings.interface";
import { getData } from "@api/promosettings/tnc/list";
import { masterRole } from "@api/master/index";
import { useRouter } from "next/router";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { useApp } from "@/context/AppContext";
import Notifications from "@/components/Notifications";
import ButtonGroup from "antd/lib/button/button-group";
import Modal from "antd/lib/modal";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { withAuth } from "@/components/authHOC";

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), {
  loading: () => <Skeleton />,
  ssr: false,
});

const ModalGP = dynamic(
  () => import("@/pageComponents/PromoSettings/TNC/AddMod"),
  {
    loading: () => <p></p>,
  }
);
// import { getUser } from '../../utils/Helper';

let initialState = {
  isLoading: false,
  modalGnrlPrm: false,
  dataGnrlPrm: [],
  editGnrlPrm: {},
};
const TiEnSi = (props: any, { fallback }: any) => {
  const router = useRouter();
  const { statesContex, setSubmitNotif } = useApp();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const {
    data: arrayTNC,
    error: errorTNC,
    isValidating: isLoadingTNC,
  } = useSWR(`/api/promosettings/tnc/list`);

  const handleOpenModal = async (data: any) => {
    if (data.type === "modalAdd" || data.type === "modalClose") {
      setStates({
        [data.name]: data.value,
      });
    } else {
      setStates({
        [data.name]: data.value,
        editData: data.data,
      });
    }
  };

  // const addTNC = async (param: any) => {
  //     const data = Buffer.from(JSON.stringify(param)).toString('base64')
  //     router.push(`/promosettings/tnc/add?submit=${data}`)
  //   };

  const modifyTNC = async (param: any) => {
    let datas = {
      id: param.id,
      title: param.title,
      content: param.content,
      type: param.type,
    };

    let mask = JSON.stringify(datas);
    let response: any = await updateThis(mask);
    if (response.error) {
      alert("Failed to modify.");
    } else {
      setStates({
        openModal: false,
      });
      router.push(`/promosettings/tnc/update`);
    }
  };

  const addTNC = async (param: any) => {
    let datas = {
      title: param.title,
      content: param.content,
      type: param.type,
    };

    let mask = JSON.stringify(datas);
    let response: any = await saveThis(mask);
    if (response.error) {
      alert("Failed to modify.");
    } else {
      setStates({
        openModal: false,
      });
      router.push(`/promosettings/tnc/add`);
    }
  };

  const removeData = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/promosettings/tnc/delete?submit=${data}`);
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
    if (arrayTNC) {
      setStates({
        isLoading: false,
        data: {
          ...states.data,
          list: arrayTNC.data,
          key: states.data.key ? states.data.key : "",
        },
      });
    }
  }, [arrayTNC]);

  useEffect(() => {
    const { type, message, description } = statesContex.submitNotif;
    Notifications(type, message, description);
    setSubmitNotif({ type: "", message: "", description: "" });
  }, []);

  const dataSource = states?.data.list;

  dataSource.forEach((i: any, index: number) => {
    i.key = index;
    // i.no =
    //     page === 1
    //         ? formatNumber(index + 1)
    //         : page === 2
    //             ? formatNumber(parseInt(rowsPerPage) + (index + 1))
    //             : formatNumber((page - 1) * parseInt(rowsPerPage) + (index + 1));
  });

  let tbc = {
    array: states.master.table,
    addOn: {
      title: "Action",
      render: (text: any, record: any) => (
        <ButtonGroup>
          <Button
            className={"button-action"}
            shape="round"
            style={{ marginRight: "10px" }}
            onClick={() =>
              handleOpenModal({
                name: "openModal",
                type: "modalEdit",
                value: true,
                data: {
                  id: record.id,
                  // value: true,
                  title: record.title,
                  content: record.content,
                  type: record.type,
                  // name: "openModal",
                  // type: "modalEdit"
                },
              })
            }
          >
            Edit
          </Button>
          <Button
            className={"button-action-app"}
            shape="round"
            onClick={() => {
              Modal.confirm({
                title: "Confirm Delete",
                icon: <ExclamationCircleOutlined />,
                content: `You can't undo this.`,
                okText: "Yes",
                cancelText: "Nope",
                onOk: () => removeData(record),
              });
            }}
          >
            Delete
          </Button>
        </ButtonGroup>
      ),
    },
    loading: isLoadingTNC,
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
    searching: () => null,
    title: "List of TnC",
    dateRange: { startDate: "", endDate: "" },
  };

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="TNC"
          extra={[
            states.access.m_insert == 1 ? (
              <Button
                key="1"
                onClick={() =>
                  handleOpenModal({
                    name: "openModal",
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
        <ModalGP
          open={states.openModal}
          handleOpenModal={handleOpenModal}
          header={"Edit TNC"}
          data={states.editData}
          handleEdit={modifyTNC}
          handleAdd={addTNC}
        />
      </SWRConfig>
    </>
  );
};

const saveThis = async (data: any) => {
  let res: any = await fetch(`/api/promosettings/tnc/save`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "text/plain",
    },
  });
  if (res.status !== 404) {
    let dataList = await res.json();
    return dataList;
  } else {
    return alert("Error 404");
  }
};

const updateThis = async (data: any) => {
  let res: any = await fetch(`/api/promosettings/tnc/modify`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "text/plain",
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
  const getList = await getData();
  const roleMaster = await masterRole();

  const data = {
    list: getList.data,
  };

  return {
    props: {
      fallback: {
        "/api/promosettings/tnc/list": JSON.parse(JSON.stringify(data)),
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
    },
  };
});

export default TiEnSi;

TiEnSi.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
