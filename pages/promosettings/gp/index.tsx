import React, { useReducer, useEffect } from "react";
import type { ReactElement } from "react";
import DashboardLayout from "@/components/layouts/Dashboard";
import dynamic from "next/dynamic";
import { PageHeader } from "@ant-design/pro-layout";
import Button from "antd/lib/button";
import Input from "antd/lib/input";
import Skeleton from "antd/lib/skeleton";
import { IState } from "../../../interfaces/promosettings.interface";
import { getData } from "../../api/promosettings/generalparameter/list";
import { masterRole } from "../../api/master/index";
import { useRouter } from "next/router";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { useApp } from "../../../context/AppContext";
import Notifications from "../../../components/Notifications";
import ButtonGroup from "antd/lib/button/button-group";
import { withAuth } from "@/components/authHOC";

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), {
  loading: () => <Skeleton />,
  ssr: false,
});

const ModalGP = dynamic(
  () => import("@/pageComponents/PromoSettings/GP/AddMod"),
  {
    loading: () => <p></p>,
  }
);
// import { getUser } from '../../utils/Helper';

const { Search } = Input;

let initialState = {
  isLoading: false,
  modalGnrlPrm: false,
  dataGnrlPrm: [],
  editGnrlPrm: {},
};
const GeneralParameter = (props: any, { fallback }: any) => {
  const router = useRouter();
  const { statesContex, setSubmitNotif } = useApp();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const {
    data: arrayGP,
    error: errorGP,
    isValidating: isLoadingGP,
  } = useSWR(`/api/promosettings/generalparameter/list`);

  const handleOpenModal = async (data: any) => {
    if (data.type === "modalAdd" || data.type === "modalClose") {
      setStates({
        [data.name]: data.value,
        editData: "",
      });
    } else {
      setStates({
        [data.name]: data.value,
        editData: data.data,
      });
    }
  };

  const addGP = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/promosettings/gp/add?submit=${data}`);
  };

  const modifyGP = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/promosettings/gp/update?submit=${data}`);
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
    if (arrayGP) {
      setStates({
        isLoading: false,
        data: {
          ...states.data,
          list: arrayGP.data,
          key: states.data.key ? states.data.key : "",
        },
      });
    }
  }, [arrayGP]);

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
            onClick={() =>
              handleOpenModal({
                name: "openModal",
                type: "modalEdit",
                value: true,
                data: {
                  id: record.id,
                  // value: true,
                  gpName: record.name,
                  gpDescription: record.description,
                  gpParam: record.value,
                  gpStatus: record.status,
                  // name: "openModal",
                  // type: "modalEdit"
                },
              })
            }
          >
            Edit
          </Button>
        </ButtonGroup>
      ),
    },
    loading: isLoadingGP,
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
    title: "List of General Parameters",
    dateRange: { startDate: "", endDate: "" },
  };

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="General Parameter"
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
          header={"Edit General Parameter"}
          data={states.editData}
          handleEdit={modifyGP}
          handleAdd={addGP}
        />
      </SWRConfig>
    </>
  );
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
        "/api/promosettings/gp/list": JSON.parse(JSON.stringify(data)),
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

export default GeneralParameter;

GeneralParameter.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
