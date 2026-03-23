import React, { useCallback, useEffect, useState, useReducer } from "react";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { PageHeader } from "@ant-design/pro-layout";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import ButtonGroup from "antd/lib/button/button-group";
import Skeleton from "antd/lib/skeleton";
import DashboardLayout from "../../../components/layouts/Dashboard";
import { getData } from "../../api/pointredeem/list";
import { masterRole } from "../../api/master/index";
import { IState } from "../../../interfaces/winner.interface";
import { EyeOutlined, FileImageOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useRouter } from "next/router";
import { withAuth } from "@/components/authHOC";

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), {
  loading: () => <Skeleton />,
  ssr: false,
});

const Details = dynamic(() => import("@/pageComponents/Winners/Detail"), {
  loading: () => <p></p>,
});
const Filter = dynamic(() => import("@/components/DataFilter"), {
  loading: () => <p></p>,
});

const PointRedeem = (props: any, { fallback }: any) => {
  const [clicked, setClicked] = useState([] as string[]);
  const router = useRouter();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const url = `/api/pointredeem/list?mode=evoucher&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&key=${states.filter.key}&isValid=${states.filter.isValid}&isApproved=${states.filter.isApproved}&isHaveAtt=${states.filter.isHaveAtt}&prizeId=${states.filter.prizeId}`;
  const { data, mutate, error, isValidating: isLoading } = useSWR(url);

  const fileToBase64 = (data: any) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        return resolve(event.target?.result);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(data);
    });
  };

  const handleEdit = async (data: any) => {
    await editWinner({
      id: data?.id,
      hp: data?.hp,
      voucherId: data?.voucherId,
      status: data?.status,
      // status: data.topupType === 3 ? 2 : 0
    });
  };

  const handleTopup = async (data: any) => {
    setClicked((prev) => [...prev, data.id]);
    await topup(data);
  };

  const expWinner = async () => {
    let param = states.filter;
    exportWinner(param);
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

  const handleFilter = (data: any) => {
    setStates({
      data: {
        ...states.data,
        dataPerPage: 10,
        currentPage: 1,
      },
      filter: {
        ...states.filter,
        prizeId: data?.prize || "",
        isValid: data?.isValid || "",
        isApproved: data?.isApproved || "",
        startDate: data?.startDate,
        endDate: data?.endDate,
        isHaveAtt: data?.isHaveAtt,
      },
      modalFilter: false,
    });
  };

  const handleOpenModal = async (param: any) => {
    if (param.name === "openModal" && param.id) {
      const response = await getWinnerDetail(param.id);
      setStates({
        dataDetail: response,
        [param.name]: param.value,
      });
      return;
    }
    if (param.name === "openImage" && param.id) {
      const response = await getImage(param.id);
      const data = {
        winnerId: param.winnerId,
        voucher: param.voucher,
        status: param.status,
        img: response,
        userId: param.userId,
        entriesId: param.id,
        topupType: param.topupType,
        id_type: param.id_type,
      };
      setStates({
        dataImages: data,
        [param.name]: param.value,
      });
      return;
    }
    if (param.name === "openRevert" && param.winnerId) {
      const data = {
        winnerId: param.winnerId,
      };
      setStates({
        dataImages: data,
        [param.name]: param.value,
      });
    }

    if (
      (param.name === "modalReject" || param.name === "modalPusher") &&
      param.winnerId
    ) {
      const data = {
        winnerId: param.winnerId,
      };
      setStates({
        dataImages: data,
        [param.name]: param.value,
      });
    }

    if (
      ["openModal", "openImage"].includes(param.name) &&
      param.value == false
    ) {
      mutate();
    }

    setStates({
      [param.name]: param.value,
      typeModal: param.typeModal,
      dataModal: param.dataModal ? param.dataModal : {},
    });
    return;
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

  const getWinnerDetail = useCallback(async (data: any) => {
    let res = await fetch(`/api/pointredeem/${data}`);
    if (res.status !== 404) {
      let dataList = await res.json();
      return dataList;
    } else {
      return alert("Error 404");
    }
  }, []);

  const getImage = useCallback(async (data: any) => {
    let res = await fetch(`/api/pointredeem/images/?id=${data}`);
    if (res.status !== 404) {
      let dataList = await res.json();
      return dataList;
    } else {
      return alert("Error 404");
    }
  }, []);

  useEffect(() => {
    if (data) {
      setStates({
        isLoading: false,
        master: {
          ...states.master,
          table: data.tabling,
        },
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

  dataSource
    ? dataSource.forEach((i: any, index: number) => {
        i.key = index;
        i.no =
          states.data.currentPage === 1
            ? Number(index + 1)
            : states.data.currentPage === 2
            ? Number(states.data.dataPerPage) + (index + 1)
            : (Number(states.data.currentPage) - 1) *
                Number(states.data.dataPerPage) +
              (index + 1);
      })
    : [];

  let tbc = {
    array: states.master.table,
    addOn: {
      title: "Action",
      render: (text: any, record: any) => (
        <ButtonGroup>
          <Tooltip title="View Detail">
            <Button
              onClick={() => {
                handleOpenModal({
                  name: "openModal",
                  value: true,
                  id: record.id,
                });
              }}
            >
              <EyeOutlined />
            </Button>
          </Tooltip>
        </ButtonGroup>
      ),
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
    title: "List Prize Redeemed by Points",
    dateRange: states.filter,
  };

  if (error) {
    return <p>Failed to load</p>;
  }

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title={`Point Redeem (GoPay & Google Play)`}
          extra={[
            <Row key="1">
              {states.master.isAdmin ? (
                <Col style={{ marginRight: "1em" }}>
                  <Button
                    onClick={expWinner}
                    className={"button"}
                    shape="round"
                  >
                    Export
                  </Button>
                </Col>
              ) : null}
              <Col>
                <Button
                  onClick={() =>
                    handleOpenModal({
                      name: "modalFilter",
                      value: true,
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
        <Details
          open={states.openModal}
          header={"Data Detail"}
          handleOpenModal={handleOpenModal}
          prize={props.prize}
          topup={handleTopup}
          handleEdit={handleEdit}
          data={states.dataDetail}
          master={states.master}
          mode={3}
        />
        <Filter
          tgt={"winner"}
          header={"Filter Data"}
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

const exportWinner = async (data: any) => {
  await window.open(
    `/api/pointredeem/export?mode=evoucher&startDate=${data.startDate}&endDate=${data.endDate}&prize=${data.prize}&key=${data.key}&isValid=${data.isValid}&column=${data.columns}&direction=${data.directions}&isApproved=${data.isApproved}&isHaveAtt=${data.isHaveAtt}&prizeId=${data.prizeId}`
  );
};

const editWinner = async (data: any) => {
  let res = await fetch(`/api/pointredeem/edit`, {
    method: "POST",
    body: JSON.stringify({
      id: data.id,
      hp: data.hp,
      voucherId: data.voucherId,
      status: data.status,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status === 200) {
    let result = await res.json();
    return Modal.success({
      title: "Success edit",
    });
  } else {
    return alert(`Error ${res.statusText}`);
  }
};

const topup = async (data: any) => {
  let res = await fetch(`/api/pointredeem/topup`, {
    method: "POST",
    body: JSON.stringify({
      id: data?.id,
      brandId: data?.masterBrandId,
      userId: data?.userId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status === 200) {
    let result = await res.json();
    Modal.success({
      title: "Success Topup",
    });
    return result;
  } else {
    return alert(`Error ${res.statusText}`);
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
    isValid: string;
    isApproved: string;
    status: string;
    prizeId: string;
    isHaveAtt: number | string;
    mode: string;
  }

  const {
    row,
    page,
    key,
    startDate,
    endDate,
    column,
    direction,
    isValid,
    isApproved,
    prizeId,
    isHaveAtt,
  } = ctx.query as any;

  const params: RgPagination = {
    row: row ?? 10,
    page: page ?? 0,
    key: key ?? "",
    direction: direction ?? "",
    column: column ?? "",
    limit: "",
    media: "",
    status: "",
    startDate: startDate ?? "",
    endDate: endDate ?? "",
    isHaveAtt: isHaveAtt ?? "",
    isValid: isValid ?? "",
    isApproved: isApproved ?? "",
    prizeId: prizeId ?? "",
    mode: "evoucher",
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
        "/api/winners/list": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
        store: [],
        table: JSON.parse(JSON.stringify(getList.tabling)),
        role: JSON.parse(JSON.stringify(roleMaster)),
        isClient: false,
      },
      columns: [],
      isLoading: false,
      openModal: false,
      openFilter: false,
      openRevert: false,
      modalReject: false,
      modalPusher: false,
      openImage: false,
      typeModal: "",
      dataModal: {},
      filter: {
        startDate: startDate ?? params.startDate,
        endDate: endDate ?? params.endDate,
        prizeId: prizeId ?? "",
        isValid: isValid ?? "",
        isApproved: isApproved ?? "",
        key: key ?? "",
        directions: direction ?? "",
        columns: column ?? "",
        isHaveAtt: isHaveAtt ?? "",
      },
    },
  };
});

export default PointRedeem;

PointRedeem.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
