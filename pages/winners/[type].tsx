import React, { useCallback, useEffect, useState, useReducer } from "react";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import useSWR, { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { PageHeader } from '@ant-design/pro-layout'
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import ButtonGroup from "antd/lib/button/button-group";
import Skeleton from "antd/lib/skeleton";
import DashboardLayout from "../../components/layouts/Dashboard";
import { getData } from "../api/winners/list";
import { masterDistrictCity, masterInvReasonEntry, masterPrizes, masterRole } from "../api/master/index";
import { IState } from "../../interfaces/winner.interface";
import axios from "axios";
import { EyeOutlined, FileImageOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { masterVoucher } from "@api/winners/voucher";
import Link from "next/link";
import { useRouter } from "next/router";
import Notifications from "@/components/Notifications"
import { withAuth } from "@/components/authHOC";

const ModalRevert = dynamic(() => import("../../pageComponents/Winners/OnRevert"), { loading: () => <p>Loading...</p>, ssr: false });

const ModalRejects = dynamic(() => import("../../pageComponents/Winners/OnReject2"), { loading: () => <p>Loading...</p>, ssr: false });

const ModalPusher = dynamic(() => import("../../pageComponents/Winners/OnPush"), { loading: () => <p>Loading...</p>, ssr: false });

const TableRenderer = dynamic(() => import("@/components/TableRenderer"), { loading: () => <Skeleton />, ssr: false });

const Details = dynamic(() => import("@/pageComponents/Winners/Detail"), { loading: () => <p></p> });
const Filter = dynamic(() => import("@/components/DataFilter"), { loading: () => <p></p> });
const Images = dynamic(() => import("@/pageComponents/Winners/Images"), { loading: () => <p></p> });

const Winners = (props: any, { fallback }: any) => {
  const [clicked, setClicked] = useState([] as string[])
  const router = useRouter()
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const url = `/api/winners/list?prize=${router.query.type}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&key=${states.filter.key}&isApproved=${states.filter.isApproved}&isValid=${states.filter.isValid}&prizeId=${states.filter.prizeId}`;
  const { data, mutate, error, isValidating: isLoading } = useSWR(url);

  const fileToBase64 = (data: any) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        return resolve(event.target?.result)
      };
      reader.onerror = (err) => {
        reject(err)
      };
      reader.readAsDataURL(data);
    })
  }

  const handleSubmitImage = async (data: any) => {
    const base64File = await fileToBase64(data.selectedFile)
    setStates({
      pickedId: data.pickedId,
      fileName: data.fileName,
      selectedFile: data.selectedFile,
      isLoading: true,
    });
    // const formData = new FormData();
    // formData.append("file", data.file);
    // axios.post(`/api/v1/winner/importImage?winnerId=${states.pickedId}`,
    axios
      .post(`/api/winners/upload`, { file: base64File, entriesId: data.pickedId, userId: data.userId })
      .then((res) => {
        if (res.status === 200) {
          setStates({ selectedFile: null });
          if (states?.dataImages?.img) {
            setStates({
              dataImages: {
                img: [...states.dataImages.img, { url: `/api/images/${res.data.data.url}`, id: res.data.data.id }]
              }
            })
          }
          Modal.success({
            title: "Successfully uploaded",
          });
          //   swal.fire("Success!", "Data successfully imported", "success");
          //   this.setState(initialState);
          //   this.listEntries(this.state.filter)
        } else if (res.status === 404) {
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
        alert(err);
      });
  };

  const handleEdit = async (data: any) => {
    await editWinner({
      id: data?.id,
      hp: data?.hp,
      voucherId: data?.voucherId,
      status: data?.status
      // status: data.topupType === 3 ? 2 : 0
    })
  }

  const handleEditRek = async (data: any) => {
    await editWinnerRek({
      id: data?.id,
      bank_name: data?.bank_name,
      nomor_rekening: data?.nomor_rekening,
      name: data?.name
    })
  }

  const setToFailed = async (data: any) => {
    await setToFail({
      id: data?.id,
    })
  }

  const SetToSuccess = async (data: any) => {
    // await editWinnerRek({
    //   id: data?.id,
    //   bank_name: data?.bank_name,
    //   nomor_rekening: data?.nomor_rekening,
    //   name: data?.name
    // })
  }

  const handleTopup = async (data: any) => {
    setClicked(prev => [...prev, data.id])
    await topup(data);
  };

  const handleDeleteImage = async (id: any) => {
    const delImg = await deleteImage(id)
    return delImg
  }

  const handleInsertTransaction = async (data: any) => {
    await insertTransaction(data)
  }

  const handleTrf = async (data: any) => {
    await modifyTransaction(data)
  }

  const expWinner = async () => {
    let param = states.filter;
    exportWinner(param);
    Notifications('success', 'Processed', 'Export is on process.')
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
        isHaveAtt: data?.isHaveAtt
      },
      modalFilter: false
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
    if (param.name === "openImage" && param.winnerId) {
      const response = await getImage(param.winnerId);
      const data = {
        winnerId: param.winnerId,
        voucher: param.voucher,
        status: param.status,
        img: response,
        userId: param.userId,
        entriesId: param.id,
        topupType: param.topupType,
        id_type: param.id_type,
      }
      setStates({
        dataImages: data,
        [param.name]: param.value,
      });
      return;
    }
    if (param.name === "openRevert" && param.winnerId) {
      const data = {
        winnerId: param.winnerId
      }
      setStates({
        dataImages: data,
        [param.name]: param.value
      })
    }

    if ((param.name === "modalReject" || param.name === "modalPusher") && param.winnerId) {
      const data = {
        winnerId: param.winnerId
      }
      setStates({
        dataImages: data,
        [param.name]: param.value
      })
    }

    if (["openModal", "openImage"].includes(param.name) && param.value == false) {
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
    let res = await fetch(`/api/winners/${data}`);
    if (res.status !== 404) {
      let dataList = await res.json();
      return dataList;
    } else {
      return alert("Error 404");
    }
  }, []);

  const getImage = useCallback(async (data: any) => {
    let res = await fetch(`/api/winners/images/?id=${data}`);
    if (res.status !== 404) {
      let dataList = await res.json();
      return dataList;
    } else {
      return alert("Error 404");
    }
  }, []);

  const deleteImage = useCallback(async (data: any) => {
    let res = await fetch(`/api/winners/images/?id=${data}`, {
      method: "DELETE"
    });
    if (res.status !== 404) {
      return true
    } else {
      return alert("Error 404");
    }
  }, []);

  const revertData = async (datas: any) => {
    setStates({
      isLoading: true
    })
    let encryp = Buffer.from(JSON.stringify(datas)).toString('base64')
    let response: any = await revertThis(encryp)

    if (response.status !== 200) {
      Notifications('error', response.error, '')
      setStates({
        isLoading: false
      })
    } else {
      Notifications('success', "Data Reverted.", '')
      router.reload()
    }
  }

  const requestDocument = async (datas: any) => {
    const response = await sendDocRequest(datas);
    if (response.status !== 200) {
      Notifications('error', response.error, '')
      setStates({
        isLoading: false
      })
    } else {
      Notifications('success', "Document Requested.", '')
      router.reload()
    }
  }

  const rejectData = async (datas: any) => {
    datas.reject = datas.reason
    let encryp = Buffer.from(JSON.stringify(datas)).toString('base64')
    let response: any = await rejectThis(encryp)

    if (response.status !== 200) {
      alert(response.error);
      setStates({
        isLoading: false
      })
    } else {
      Notifications('success', "Data Rejected.", '')
      router.reload();
    }
  }

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

  // useEffect(() => {
  //   let x = true
  //   const resetFtr = () => {
  //     if (x) {
  //       setStates({
  //         data: {
  //           dataPerPage: 10,
  //           currentPage: 1,
  //           totalData: data?.totalData,
  //           totalPage: data?.totalPage,
  //           list: data?.data,
  //           key: states.data.key ? states.data.key : "",
  //         },
  //         filter: {
  //           ...states.filter,
  //           startDate: "",
  //           endDate: "",
  //           prize: "",
  //           isHaveAtt: "",
  //           status: "",
  //           isApproved: '',
  //           columns: "",
  //           directions: "",
  //         },
  //       });
  //     }
  //   }
  //   resetFtr()
  //   return () => {
  //     x = false
  //   }
  // }, [])

  const dataSource = states?.data.list;

  dataSource ? dataSource.forEach((i: any, index: number) => {
    i.key = index;
    i.no =
      states.data.currentPage === 1
        ? Number(index + 1)
        : states.data.currentPage === 2
          ? Number(states.data.dataPerPage) + (index + 1)
          : (Number(states.data.currentPage) - 1) *
          Number(states.data.dataPerPage) +
          (index + 1);
  }) : []

  let tbc = {
    array: states.master.table,
    addOn: {
      title: "Action",
      render: (text: any, record: any) =>
        // record.prizeCat === 1 ? (
        <ButtonGroup>
          <Tooltip title="View Detail">
            <Button
              onClick={() => {
                handleOpenModal({
                  name: "openModal",
                  value: true,
                  id: record.id,
                })
              }
              }
            >
              <EyeOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="Images">
            <Button
              onClick={() => {
                handleOpenModal({
                  name: "openImage",
                  value: true,
                  id: record.entriesId,
                  userId: record.userId,
                  status: record.status,
                  voucher: record.voucher,
                  winnerId: record.id,
                  topupType: record.topupTypeId
                })
              }
              }
            >
              <FileImageOutlined />
            </Button>
          </Tooltip>
          {states.access.m_insert == 1 ? (
            <>
              {/* <Tooltip title="Modify">
              <Button
                disabled={record.is_push == 0 ? true : record.status !== 0 ? true : parseInt(record.approvalStep) == 1 ? true : record.is_approved === 0 ? false : true}
              >
                <Link href={`/winners/entry?entries=${record.id}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&key=${states.filter.key}&status=${states.filter.status}&isHaveAtt=${states.filter.isHaveAtt}`} passHref>
                  Modify
                </Link>
              </Button>
            </Tooltip> */}
              {/* {record.prizeId === 4 ? (
                <>
                  <Tooltip title="Approve">
                    <Button
                      disabled={record.is_push == 0 ? true : record.status !== 0 ? true : parseInt(record.approvalStep) == 1 ? true : record.is_approved === 0 ? false : true}
                    >
                      <Link href={`/winners/entry?prize=${router.query.type}&aprv=${Buffer.from(JSON.stringify(1)).toString('base64')}&entries=${record.id}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&key=${states.filter.key}&isValid=${states.filter.isValid}&isApproved=${states.filter.isApproved}&isHaveAtt=${states.filter.isHaveAtt}&prizeId=${states.filter.prizeId}`} passHref>
                        Approve
                      </Link>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <Button
                      disabled={record.mustReject == 1 ? false : record.is_push == 0 ? true : record.status !== 0 ? true : parseInt(record.approvalStep) == 1 ? true : record.is_approved === 0 ? false : true}
                      onClick={() => handleOpenModal({
                        name: 'modalReject',
                        winnerId: record.id,
                        value: true
                      })}
                    >
                      Reject
                    </Button>
                  </Tooltip>
                  <Tooltip title="Revert Reject">
                    <Button
                      disabled={record.prizeId === 4 && record.is_approved === 2 ? false : true}
                      onClick={() => handleOpenModal({
                        name: 'openRevert',
                        winnerId: record.id,
                        value: true
                      })}
                    >
                      Revert Reject
                    </Button>
                  </Tooltip>
                </>
              ) : ( */}
              {/* <Tooltip title="Reject">
                  <Button
                    disabled={record.mustReject == 1 ? false : record.is_push == 0 ? true : record.status !== 0 ? true : parseInt(record.approvalStep) == 1 ? true : record.is_approved === 0 ? false : true}
                    onClick={() => handleOpenModal({
                      name: 'modalReject',
                      winnerId: record.id,
                      value: true
                    })}
                  >
                    Reject
                  </Button>
                </Tooltip> */}
              {router.query.type == 'evoucher' ? (
              <Tooltip title="Approve">
              <Button
                // disabled={record.is_approved === 1 || record.is_approved === 2 ? true : false}
                disabled={record.attachments < 2 || record.is_approved === 1 || record.is_approved === 2 ? true : false}
              >
                <Link href={`/winners/entry?prize=${router.query.type}&entries=${record.id}&aprv=${Buffer.from(JSON.stringify(1)).toString('base64')}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&key=${states.filter.key}`} passHref>
                  Approve
                </Link>
              </Button>
            </Tooltip>

              ) : null}
              {/* <Tooltip title="Topup">
                <Button
                  // disabled={clicked.includes(record.id) ? true : (record.is_approved === 1 && [0, 3].includes(record.isValid)) ? false : true}
                  onClick={() =>
                    handleTopup({ id: record.id, userId: record.userId, masterBrandId: record.masterBrandId })
                  }
                >
                  Topup
                </Button>
              </Tooltip> */}
            </>
          ) : null}

        </ButtonGroup>
      // ) : (
      //   <ButtonGroup>
      //     <Tooltip title="View Detail">
      //       <Button
      //         onClick={() => {
      //           handleOpenModal({
      //             name: "openModal",
      //             value: true,
      //             id: record.id,
      //           })
      //         }
      //         }
      //       >
      //         <EyeOutlined />
      //       </Button>
      //     </Tooltip>
      //     {states.access.m_insert == 1 ? (
      //       <>
      //       <Tooltip title="Images">
      //       <Button
      //         onClick={() => {
      //           handleOpenModal({
      //             name: "openImage",
      //             value: true,
      //             id: record.entriesId,
      //             userId: record.userId,
      //             status: record.status,
      //             voucher: record.voucher,
      //             winnerId: record.id,
      //             topupType: record.topupTypeId
      //           })
      //         }
      //         }
      //       >
      //         <FileImageOutlined />
      //       </Button>
      //     </Tooltip>
      //     <Tooltip title="Modify">
      //       <Button
      //         disabled={record.is_approved === 0 ? false : true}
      //       >
      //         <Link href={`/winners/entry?prize=${router.query.type}&entries=${record.id}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&key=${states.filter.key}&status=${states.filter.status}&isHaveAtt=${states.filter.isHaveAtt}`} passHref>
      //           Modify
      //         </Link>
      //       </Button>
      //     </Tooltip>

      //     <Tooltip title="Approve">
      //       <Button
      //         disabled={!record.ktp_name_admin && !record.id_number_admin ? true : record.is_approved === 1 || record.is_approved === 2 ? true : false}
      //       >
      //         <Link href={`/winners/entry?prize=${router.query.type}&entries=${record.id}&aprv=${Buffer.from(JSON.stringify(1)).toString('base64')}&page=${states.data.currentPage}&row=${states.data.dataPerPage}&column=${states.filter.columns}&direction=${states.filter.directions}&startDate=${states.filter.startDate}&endDate=${states.filter.endDate}&key=${states.filter.key}&status=${states.filter.status}&isHaveAtt=${states.filter.isHaveAtt}`} passHref>
      //           Approve
      //         </Link>
      //       </Button>
      //     </Tooltip>
      //     </>
      //     ):null}

      //   </ButtonGroup>
      // )
    },
    loading: isLoading,
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
    title: 'List Winner',
    dateRange: states.filter,
  }

  if (error) {
    return <p>Failed to load</p>;
  }

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title={`Winner List by ${router.query.type === 'all' ? 'Coupon Raffle' : 'E-Wallet'}`}
          extra={[
            // states.access.m_insert == 1 ?
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
        <Details
          open={states.openModal}
          header={"Winner Detail"}
          handleOpenModal={handleOpenModal}
          prize={props.prize}
          topup={handleTopup}
          handleEdit={handleEdit}
          handleEditRek={handleEditRek}
          handleTrf={handleTrf}
          setToFailed={setToFailed}
          insertTransaction={handleInsertTransaction}
          // submit={states.typeModal == "Add" ? submit : submitUpdate}
          data={states.dataDetail}
          master={states.master}
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
        <Filter
          tgt={'winner'}
          header={"Filter Winner"}
          open={states.modalFilter}
          handleOpenModal={handleOpenModal}
          handleFilter={handleFilter}
          master={states.master}
          filter={states.filter}
        />
        <ModalRevert
          open={states.openRevert}
          handleOpenModal={handleOpenModal}
          onSubmit={revertData}
          data={states.dataImages}
        />
        <ModalRejects
          title={"Fill Reject Reason"}
          reasons={states.master.invalidReason}
          open={states.modalReject}
          handleOpenModal={handleOpenModal}
          onSubmit={rejectData}
          data={states.dataImages}
        />
        <ModalPusher
          title={"Select Prompt Category"}
          reasons={states.master.invalidReason}
          open={states.modalPusher}
          handleOpenModal={handleOpenModal}
          onSubmit={requestDocument}
          data={states.dataImages}
        />
      </SWRConfig>
    </>
  );
};

const exportWinner = async (data: any) => {
  // await window.open(`/api/winners/export?startDate=${data.startDate}&endDate=${data.endDate}&prize=${data.prize}&key=${data.key}&isValid=${data.isValid}&column=${data.columns}&direction=${data.directions}&isApproved=${data.isApproved}&isHaveAtt=${data.isHaveAtt}&prizeId=${data.prizeId}`)
  let res = await fetch(`/api/winners/export?startDate=${data.startDate}&endDate=${data.endDate}&prize=${data.prize}&key=${data.key}&isValid=${data.isValid}&column=${data.columns}&direction=${data.directions}&isApproved=${data.isApproved}&prizeId=${data.prizeId}`);
  if (res.status !== 404) {
    return 'ok'
  } else {
    return alert("Error 404")
  }
};

const revertThis = async (data: any) => {
  let res: any = await fetch(`/api/winners/revertReject`, {
    method: 'POST',
    body: JSON.stringify({
      data: data
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (res.status !== 404) {
    let dataList = await res.json()
    return dataList
  } else {
    return alert("Error 404")
  }
}

const rejectThis = async (data: any) => {
  let res: any = await fetch(`/api/winners/reject`, {
    method: 'POST',
    body: JSON.stringify({
      data: data
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (res.status !== 404) {
    let dataList = await res.json()
    return dataList
  } else {
    return alert("Error 404")
  }
}

const sendDocRequest = async (data: any) => {
  let res: any = await fetch(`/api/winners/pusher`, {
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


const editWinner = async (data: any) => {
  let res = await fetch(`/api/winners/edit`, {
    method: "POST",
    body: JSON.stringify({
      id: data.id,
      hp: data.hp,
      voucherId: data.voucherId,
      status: data.status
    }),
    headers: {
      "Content-Type": "application/json",
    }
  })
  if (res.status === 200) {
    let result = await res.json();
    return Modal.success({
      title: "Success edit"
    })
  } else {
    return alert(`Error ${res.statusText}`);
  }
}

const editWinnerRek = async (data: any) => {
  let res = await fetch(`/api/winners/editRekening`, {
    method: "POST",
    body: JSON.stringify({
      id: data.id,
      name: data.name,
      nomor_rekening: data.nomor_rekening,
      bank_name: data.bank_name
    }),
    headers: {
      "Content-Type": "application/json",
    }
  })
  if (res.status === 200) {
    let result = await res.json();
    return Modal.success({
      title: "Success edit"
    })
  } else {
    return alert(`Error ${res.statusText}`);
  }
}

const setToFail = async (data: any) => {
  let res = await fetch(`/api/winners/gsReject`, {
    method: "POST",
    body: JSON.stringify({
      id: data.id,
    }),
    headers: {
      "Content-Type": "application/json",
    }
  })
  if (res.status === 200) {
    let result = await res.json();
    return Modal.success({
      title: "Success edit"
    })
  } else {
    return alert(`Error ${res.statusText}`);
  }
}

const insertTransaction = async (data: {
  hp: string,
  processDate: string,
  reason: string,
  reference: string,
  status: number,
  winnerId: number
}) => {
  let res = await fetch(`/api/winners/transaction`, {
    method: "POST",
    body: JSON.stringify({
      hp: data.hp,
      proccesDate: data.processDate,
      reason: "",
      reference: data.reference,
      status: 2,
      winnerId: data.winnerId
    }),
    headers: {
      "Content-Type": "application/json",
    }
  })
  if (res.status === 200) {
    let result = await res.json();
    return Modal.success({
      title: "Success topup"
    })
  } else {
    return alert(`Error ${res.statusText}`);
  }
}

const modifyTransaction = async (data: {
  id: number | string,
  trf_no: string,
  trf_date: string,
  trf_status: number
}) => {
  let res = await fetch(`/api/winners/transactionV2`, {
    method: "POST",
    body: JSON.stringify({
      id: data.id,
      trf_no: data.trf_no,
      trf_date: data.trf_date,
      trf_status: data.trf_status,
    }),
    headers: {
      "Content-Type": "application/json",
    }
  })
  if (res.status === 200) {
    let result = await res.json();
    return Modal.success({
      title: "Success Modified"
    })
  } else {
    return alert(`Error ${res.statusText}`);
  }
}

const topup = async (data: any) => {
  let res = await fetch(`/api/winners/topup`, {
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
      title: "Success Topup"
    })
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
    isApproved: string
    prize: string;
    prizeId: string;
    userType: any;
    isHaveAtt: number | string
  }

  const tgtPrize: any = ctx.query.type

  const { row, page, key, startDate, endDate, column, direction, isValid, isApproved, prize, prizeId, isHaveAtt } = ctx.query as any

  let date = new Date()
  const params: RgPagination = {
    row: row ?? 10,
    page: page ?? 0,
    key: key ?? "",
    direction: direction ?? "",
    column: column ?? "",
    limit: "",
    media: '',
    startDate: startDate ?? "",
    endDate: endDate ?? "",
    isHaveAtt: isHaveAtt ?? '',
    isValid: isValid ?? '',
    isApproved: isApproved ?? '',
    prize: tgtPrize ?? '',
    prizeId: prizeId ?? '',
    userType: ctx.query.type,
  };

  const getList = await getData(params);
  const roleMaster = await masterRole();
  const prizeMaster = await masterPrizes()
  const voucherMaster = await masterVoucher(1)
  const districtMaster = await masterDistrictCity()

  const data = {
    dataPerPage: getList.dataPerPage,
    currentPage: getList.currentPage,
    totalData: getList.totalData,
    totalPage: getList.totalPage,
    list: getList.data,
    key: ""
  }

  return {
    props: {
      fallback: {
        '/api/winners/list': JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
        store: [],
        table: JSON.parse(JSON.stringify(getList.tabling)),
        role: JSON.parse(JSON.stringify(roleMaster)),
        prize: JSON.parse(JSON.stringify(prizeMaster)),
        voucher: JSON.parse(JSON.stringify(voucherMaster)),
        districts: JSON.parse(JSON.stringify(districtMaster)),
        invalidReason: JSON.parse(JSON.stringify(await masterInvReasonEntry())),
        isClient: false
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
        prizeId: prizeId ?? '',
        isValid: isValid ?? '',
        isApproved: isApproved ?? '',
        key: key ?? "",
        directions: direction ?? "",
        columns: column ?? "",
        isHaveAtt: isHaveAtt ?? ''
      },
    },
  };
})

export default Winners;

Winners.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
