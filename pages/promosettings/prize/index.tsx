import React, { useReducer, useEffect } from "react";
import type { ReactElement } from "react";
import DashboardLayout from "../../../components/layouts/Dashboard";
import dynamic from "next/dynamic";
import { PageHeader } from "@ant-design/pro-layout";
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Input from "antd/lib/input";
import Table from "antd/lib/table";
import { IState } from "../../../interfaces/promosettings.interface";
import { getData } from "../../api/promosettings/prizes/list";
import { masterRole } from "../../api/master/index";
import { useRouter } from "next/router";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { useApp } from "../../../context/AppContext";
import Notifications from "../../../components/Notifications";
import ButtonGroup from "antd/lib/button/button-group";
import { withAuth } from "@/components/authHOC";

const { Column } = Table;

const ModalPrizes = dynamic(
  () => import("../../../pageComponents/PromoSettings/Prize/AddMod"),
  {
    loading: () => <p>Loading...</p>,
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
const Prizes = (props: any, { fallback }: any) => {
  const router = useRouter();
  const { statesContex, setSubmitNotif } = useApp();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const {
    data: arrayPrizes,
    error: errorPrizes,
    isValidating: isLoadingPrizes,
  } = useSWR(`/api/promosettings/prizes/list`);

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

  const modifyPrize = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/promosettings/prize/update?submit=${data}`);
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

  const formatNumber = (number: number) => {
    if (number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    return number;
  };

  useEffect(() => {
    if (arrayPrizes) {
      setStates({
        isLoading: false,
        data: {
          ...states.data,
          list: arrayPrizes,
          key: states.data.key ? states.data.key : "",
        },
      });
    }
  }, [arrayPrizes]);

  useEffect(() => {
    const { type, message, description } = statesContex.submitNotif;
    Notifications(type, message, description);
    setSubmitNotif({ type: "", message: "", description: "" });
  }, []);

  const dataSource = states?.data.list;

  dataSource.forEach((i: any, index: number) => {
    i.key = index;
  });

  let columnsChild: any = (
    <>
      <Column title="Start Time" dataIndex="start_time" key="start_time" />
      <Column title="End Time" dataIndex="end_time" key="end_time" />
    </>
  );

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader title="Prizes" />
        <Card
          className="custom-card"
          title="Prizes Setting"
          // extra={
          //   <Search
          //     name="key"
          //     placeholder="input search text"
          //     // value={states.data.key}
          //     // onSearch={onSearch}
          //     // onChange={handleChange}
          //   />
          // }
        >
          <Table
            style={{ overflowX: "scroll" }}
            loading={states.isLoading}
            dataSource={dataSource}
            // columns={columns}
            size="middle"
            pagination={{
              current: states.data.currentPage as number,
              total: states.data.totalData as number,
              pageSize: states.data.dataPerPage as number,
            }}
            onChange={handleTableChange}
          >
            <Column title="Prize" dataIndex="name" key="name" />
            <Column title="Active Time">{columnsChild}</Column>
            <Column
              title="Status"
              dataIndex="enabled"
              key="enabled"
              render={(value) => (value === 1 ? "Enable" : "Disable")}
            />
            <Column
              title="Limit Claim Prize"
              render={(text: any, record: any) =>
                record.interval < 1
                  ? "Without Limitation"
                  : `${record.limit} Claim / ${record.interval} Minute`
              }
            />
            <Column
              title="Purchase Minimal"
              dataIndex="purchase_min"
              key="purchase_min"
              render={(value) => formatNumber(value)}
            />
            <Column
              title="Purchase Maximal"
              dataIndex="purchase_max"
              key="purchase_max"
              render={(value) => formatNumber(value)}
            />
            <Column
              title="Action"
              render={(text: any, record: any) => (
                <ButtonGroup>
                  <Button
                    className={"button-action"}
                    shape="round"
                    onClick={() =>
                      handleOpenModal({
                        name: "openModal",
                        type: "modalEdit",
                        value: true,
                        data: record,
                      })
                    }
                  >
                    Edit
                  </Button>
                </ButtonGroup>
              )}
            />
          </Table>
        </Card>
        <ModalPrizes
          open={states.openModal}
          handleOpenModal={handleOpenModal}
          header={"Edit Prize"}
          data={states.editData}
          modifyPrizeSetting={modifyPrize}
        />
      </SWRConfig>
    </>
  );
};

const getSearchKtp = async (data: any) => {
  let res = await fetch(`/api/settings/ktp/${data}`);
  if (res.status !== 404) {
    let dataList = await res.json();
    return dataList;
  } else {
    return alert("Error 404");
  }
};

const updatePrizeSetting = async (data: any) => {
  let res = await fetch(`/api/settings/prizes/modify`, {
    method: "POST",
    body: JSON.stringify({
      id: data.id,
      startTime: data.startTime,
      endTime: data.endTime,
      enabled: data.enabled,
      limit: data.limit,
      interval: data.interval,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status !== 404) {
    let result = await res.json();
    return result;
  } else {
    return alert("Error 404");
  }
};

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
  const getList = await getData();
  const roleMaster = await masterRole();

  const data = {
    list: getList,
  };

  return {
    props: {
      fallback: {
        "/api/promosettings/prizes/list": JSON.parse(JSON.stringify(data)),
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
    },
  };
});

export default Prizes;

Prizes.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
