import Notifications from "@/components/Notifications";
import { withAuth } from "@/components/authHOC";
import { EyeOutlined, FileImageOutlined } from "@ant-design/icons";
import { PageHeader } from "@ant-design/pro-layout";
import { Tooltip } from "antd";
import Button from "antd/lib/button";
import ButtonGroup from "antd/lib/button/button-group";
import Col from "antd/lib/col";
import Modal from "antd/lib/modal";
import Row from "antd/lib/row";
import Skeleton from "antd/lib/skeleton";
import axios from "axios";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import { useCallback, useEffect, useReducer, useState } from "react";
import useSWR, { SWRConfig } from "swr";
import DashboardLayout from "../../../components/layouts/Dashboard";
import { IState } from "../../../interfaces/winner.interface";
import { masterRole } from "../../api/master/index";
import { getData } from "../../api/pointredeem/list";

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
const Images = dynamic(() => import("@/pageComponents/Winners/Images"), {
  loading: () => <p></p>,
});

const PointRedeem = (props: any, { fallback }: any) => {
  const [clicked, setClicked] = useState([] as string[]);
  const router = useRouter();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );
  // console.log(states, "detail");

  const url = `/api/pointredeem/list?mode=physical&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&key=${states.filter.key}&isValid=${states.filter.isValid}&isApproved=${states.filter.isApproved}&isHaveAtt=${states.filter.isHaveAtt}&prizeId=${states.filter.prizeId}`;
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

  const setAsDelivered = async (data: any) => {
    setClicked((prev) => [...prev, data]);
    let datas = {
      id: data,
      status: 2,
    };
    const encryp = Buffer.from(JSON.stringify(datas)).toString("base64");
    const response = await setStatusDelivery(encryp);
    if (response.status === 200) {
      Notifications("success", "Set as delivered succeed.", "");
      setTimeout(() => {
        router.reload();
      }, 2000);
    } else {
      Notifications("error", response.message, "");
    }
  };

  const setAsCompleted = async (data: any) => {
    setClicked((prev) => [...prev, data]);
    let datas = {
      id: data,
      status: 3,
    };
    const encryp = Buffer.from(JSON.stringify(datas)).toString("base64");
    const response = await setStatusDelivery(encryp);
    if (response.status === 200) {
      Notifications("success", "Set as completed succeed.", "");
      setTimeout(() => {
        router.reload();
      }, 2000);
    } else {
      Notifications("error", response.message, "");
    }
  };

  const handleDeleteImage = async (id: any) => {
    const delImg = await deleteImage(id);
    return delImg;
  };

  const handleSubmitImage = async (data: any) => {
    const base64File = await fileToBase64(data.selectedFile);
    setStates({
      pickedId: data.pickedId,
      fileName: data.fileName,
      selectedFile: data.selectedFile,
      isLoading: true,
    });

    try {
      const response = await axios.post(`/api/pointredeem/upload`, {
        file: base64File,
        entriesId: data.pickedId,
        userId: data.userId,
      });

      if (response.status === 200) {
        setStates({ selectedFile: null, isLoading: false });
        if (states?.dataImages?.img) {
          setStates({
            dataImages: {
              img: [
                ...states.dataImages.img,
                { url: response.data.data.url, id: response.data.data.id },
              ],
            },
          });
        }
        Modal.success({
          title: "Successfully uploaded",
          content: "Image has been uploaded successfully",
        });
      } else if (response.status === 404) {
        setStates({ isLoading: false });
        Modal.error({
          title: "Image not found",
          content: "The requested image could not be found",
        });
      } else if (response.status === 400) {
        setStates({ isLoading: false });
        Modal.error({
          title: "Bad Request",
          content: "Invalid request. Please check your data and try again.",
        });
      } else if (response.status === 500) {
        setStates({ isLoading: false });
        Modal.error({
          title: "Upload Failed",
          content:
            response.data?.message || "Server error occurred during upload",
        });
      } else {
        setStates({ isLoading: false });
        Modal.error({
          title: "Upload Failed",
          content: `Unexpected error occurred (Status: ${response.status})`,
        });
      }
    } catch (err: any) {
      setStates({ isLoading: false });
      console.error("Upload Error:", err);
      Modal.error({
        title: "Upload Failed",
        content:
          err.response?.data?.message ||
          err.message ||
          "Network error occurred",
      });
    }
  };

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
          {states.access.m_insert == 1 ? (
            <>
              <Tooltip title="Images">
                <Button
                  onClick={() => {
                    handleOpenModal({
                      name: "openImage",
                      value: true,
                      winnerId: record.id,
                      id: record.id,
                      userId: record.userId,
                    });
                  }}
                >
                  <FileImageOutlined />
                </Button>
              </Tooltip>
              {/* <Button disabled={record.is_approved === 0 ? false : true}>
                <Link
                  href={`/pointredeem/physical/entry?entries=${record.id}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&prize=${states.filter.prize}&key=${states.filter.key}&isHaveAtt=${states.filter.isHaveAtt}`}
                  passHref
                >
                  Entry
                </Link>
              </Button> */}
              {/* <Button disabled={record.is_approved === 1 ? false : true}>
                <Link
                  href={`/pointredeem/physical/entry?entries=${
                    record.id
                  }&aprv=${Buffer.from(JSON.stringify(1)).toString(
                    "base64"
                  )}&page=${states.data.currentPage}&row=${
                    states.data.dataPerPage
                  }&column=${states.filter.columns}&direction=${
                    states.filter.directions
                  }&startDate=${states.filter.startDate}&endDate=${
                    states.filter.endDate
                  }&prize=${states.filter.prize}&key=${
                    states.filter.key
                  }&isHaveAtt=${states.filter.isHaveAtt}`}
                  passHref
                >
                  Approve
                </Link>
              </Button> */}
              <Button disabled={record.shipment_status == 1 ? false : true}>
                <Link
                  href={`/pointredeem/physical/entry?entries=${
                    record.id
                  }&aprv=${Buffer.from(JSON.stringify(2)).toString(
                    "base64"
                  )}&page=${states.data.currentPage}&row=${
                    states.data.dataPerPage
                  }&column=${states.filter.columns}&direction=${
                    states.filter.directions
                  }&startDate=${states.filter.startDate}&endDate=${
                    states.filter.endDate
                  }&prize=${states.filter.prize}&key=${
                    states.filter.key
                  }&isHaveAtt=${states.filter.isHaveAtt}`}
                  passHref
                >
                  Assign Shipment
                </Link>
              </Button>
              <Button
                disabled={record.shipment_status == 2 ? false : true}
                onClick={() => {
                  setAsDelivered(record.id);
                }}
              >
                Set As Delivered
              </Button>
              <Button
                disabled={record.shipment_status == 3 ? false : true}
                onClick={() => {
                  setAsCompleted(record.id);
                }}
              >
                Set As Completed
              </Button>
            </>
          ) : null}
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
          title={`Point Redeem (Hadiah Fisik)`}
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
          mode={1}
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
        <Images
          open={states.openImage}
          header={"Images"}
          handleOpenModal={handleOpenModal}
          prize={props.prize}
          upload={handleSubmitImage}
          master={states.master}
          topup={handleEdit}
          deleteImage={handleDeleteImage}
          // handleEdit={handleEdit}
          // submit={states.typeModal == "Add" ? submit : submitUpdate}
          data={states.dataImages}
        />
      </SWRConfig>
    </>
  );
};

const exportWinner = async (data: any) => {
  await window.open(
    `/api/pointredeem/export?mode=physical&startDate=${data.startDate}&endDate=${data.endDate}&prize=${data.prize}&key=${data.key}&isValid=${data.isValid}&column=${data.columns}&direction=${data.directions}&isApproved=${data.isApproved}&isHaveAtt=${data.isHaveAtt}&prizeId=${data.prizeId}`
  );
};

const deleteImage = async (data: any) => {
  let res = await fetch(`/api/pointredeem/images/?id=${data}`, {
    method: "DELETE",
  });
  if (res.status !== 404) {
    return true;
  } else {
    return alert("Error 404");
  }
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

const setStatusDelivery = async (data: any) => {
  let res: any = await fetch(`/api/pointredeem/setDeliverStatus`, {
    method: "POST",
    body: JSON.stringify({
      data: data,
    }),
    headers: {
      "Content-Type": "application/json",
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
    mode: "physical",
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
        // "/api/pointredeem/list": JSON.parse(JSON.stringify(data)),
        "/api/winner/list": JSON.parse(JSON.stringify(data)),
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
