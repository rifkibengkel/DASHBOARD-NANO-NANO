import React, { useReducer, useEffect } from "react";
import type { ReactElement } from "react";
import DashboardLayout from "@/components/layouts/Dashboard";
import dynamic from "next/dynamic";
import { PageHeader } from "@ant-design/pro-layout";
import Button from "antd/lib/button";
import Input from "antd/lib/input";

import { IState } from "@/interfaces/promosettings.interface";
import { getData } from "../../api/promosettings/news/list";
import { masterRole } from "../../api/master/index";
import { useRouter } from "next/router";
import useSWR, { SWRConfig } from "swr";
import Skeleton from "antd/lib/skeleton";
import { GetServerSideProps, NextApiRequest } from "next";
import { useApp } from "@/context/AppContext";
import Notifications from "@/components/Notifications";
import ButtonGroup from "antd/lib/button/button-group";
import Modal from "antd/lib/modal";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { withAuth } from "@/components/authHOC";

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), {
  loading: () => <Skeleton />,
  ssr: false,
});

const ModalData = dynamic(
  () => import("@/pageComponents/PromoSettings/News/AddMod"),
  {
    loading: () => <p></p>,
  }
);
// import { getUser } from '../../utils/Helper';

const { Search } = Input;

const News = (props: any, { fallback }: any) => {
  const router = useRouter();
  const { statesContex, setSubmitNotif } = useApp();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const {
    data: arrayData,
    error: errorData,
    isValidating: isLoadingData,
  } = useSWR(`/api/promosettings/news/list`);

  const handleSubmitData = async (data: any) => {
    // setStates({
    //   pickedId: data.pickedId,
    //   fileName: data.fileName,
    //   selectedFile: data.selectedFile,
    //   isLoading: true,
    // });
    const formData = new FormData();
    formData.append("id", data.id);
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("file", data.file);
    // axios.post(`/api/v1/winner/importImage?winnerId=${states.pickedId}`,
    axios
      .post(`/api/promosettings/news/upload`, formData)
      .then((res) => {
        if (res.status === 200) {
          setStates({ selectedFile: null, openModal: false });
          router.reload();
          Modal.success({
            title: "Successfully uploaded",
          });
          //   swal.fire("Success!", "Data successfully imported", "success");
          //   this.setState(initialState);
          //   this.listEntries(this.state.filter)
        } else if (res.status === 404) {
          // console.log("Data Not Found");
          //   this.handleOpenModal("modalConfirm", false);
          alert("Error 404 Please contact developer.");
          //   this.setState({
          //     confirmMessage: res.data.message,
          //   });
          //   this.handleOpenModal("confirms", true);
        } else if (res.status === 400) {
          alert("Error Code 400 Please Contact Developer");
        }
      })
      .catch((err) => {
        // console.log(err);
        alert(err);
      });
  };

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

  // const addData = async (param: any) => {
  //     const data = Buffer.from(JSON.stringify(param)).toString('base64')
  //     router.push(`/promosettings/news/add?submit=${data}`)
  //   };

  const modifyData = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/promosettings/news/update?submit=${data}`);
  };

  const removeData = async (param: any) => {
    const data = Buffer.from(JSON.stringify(param)).toString("base64");
    router.push(`/promosettings/news/delete?submit=${data}`);
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
    if (arrayData) {
      setStates({
        isLoading: false,
        data: {
          ...states.data,
          list: arrayData.data,
          key: states.data.key ? states.data.key : "",
        },
      });
    }
  }, [arrayData]);

  useEffect(() => {
    const { type, message, description } = statesContex.submitNotif;
    Notifications(type, message, description);
    setSubmitNotif({ type: "", message: "", description: "" });
  }, []);

  const dataSource = states?.data.list;

  const propsUpload = {
    showUploadList: false,
    disabled: states.selectedFile !== null ? true : false,
    accept: "image/png, image/gif, image/jpeg",
    name: "file",
    // showUploadList: false,
    multiple: false,
    onRemove: (e: any) => {
      setStates({
        // data: [],
        fileName: "",
        selectedFile: null,
      });
    },
    // beforeUpload: (file) => {
    //   this.setState({
    //     // winnerId: precord.id,
    //     fileName: file.name,
    //     selectedFile: file,
    //     isLoading: true,
    //   });
    // this.handleSubmitImage()
    // return false
    // }
  };

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
                  dtTitle: record.title,
                  dtContent: record.content,
                  dtPicture: record.picture,
                },
              })
            }
          >
            Edit
          </Button>
          {/* <ImgCrop
              modalTitle={"Set Attachment"}
              aspect={9/7}
              onModalOk={handleSubmitImage}
            >
              <Upload
                {...propsUpload}
                beforeUpload={(file) => {
                  //   setStates({
                  //     pickedId: record.id,
                  //     fileName: file.name,
                  //     selectedFile: file,
                  //     isLoading: true,
                  //   })
                  handleSubmitImage({
                    pickedId: record.id,
                    fileName: file.name,
                    selectedFile: file,
                    isLoading: true,
                  });
                  return false;
                }}
              >
                <Button
                // disabled={
                //   record.is_approved === 0
                //     ? false
                //     : true
                // }
                >Add Attachment</Button>
              </Upload>
            </ImgCrop> */}
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
                onOk: () => removeData(record.id),
              });
            }}
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
    searching: () => null,
    title: "List of News",
    dateRange: { startDate: "", endDate: "" },
  };

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="News"
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
        <ModalData
          open={states.openModal}
          handleOpenModal={handleOpenModal}
          header={"Edit Data"}
          data={states.editData}
          // handleEdit={modifyData}
          handleAdd={handleSubmitData}
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
        "/api/promosettings/news/list": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
        table: JSON.parse(JSON.stringify(getList.tabling)),
        role: JSON.parse(JSON.stringify(roleMaster)),
      },
      columns: [],
      selectedFile: null,
      isLoading: false,
      openModal: false,
      modalType: "",
      dataModal: {},
      editData: "",
    },
  };
});

export default News;

News.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
