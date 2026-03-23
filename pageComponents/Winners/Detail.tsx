import React, { useReducer, useEffect } from "react";

import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Input from "antd/lib/input";
import Row from "antd/lib/row";
import dayjs from "dayjs";
import { Divider, Select, Space, Table } from "antd";
import Text from "antd/lib/typography/Text";
import TextArea from "antd/lib/input/TextArea";
import { showConfirm } from "@/components/modals/ModalAlert";
import DatePicker from "antd/lib/date-picker";

import { disabledDateTime } from "@/components/DataFilter";

let initialState = {
  data: [],
  img: [],
  isEdit: false,
  isEditRek: false,
  isEditTrf: false,
  isChange: false,
  vouchers: [],
  cashPrize: false,
  form: {
    hp: "",
    proccesDate: "",
    reason: "",
    reference: "",
    status: null,
    winnerId: null,
  },
};

const Modals = (props: any) => {
  const [states, setStates] = useReducer(
    (state: any, newState: Partial<any>) => ({ ...state, ...newState }),
    initialState
  );

  const handleChange = (name: string, value: string) => {
    setStates({
      data: {
        ...states.data,
        [name]: value,
      },
      isChange: true,
    });
  };

  const close = () => {
    props.handleOpenModal({ name: "openModal", value: false });
    setStates(initialState);
  };

  useEffect(() => {
    const { data, master } = props;
    if (data && Object.keys(data).length != 0) {
      setStates({
        data: data[0],
      });
    }
    if (master?.voucher && master?.voucher?.length > 0) {
      setStates({
        vouchers: master.voucher,
      });
    }
  }, [props.data, props.master]);

  const handleEdit = () => {
    if (!states.isEdit && !states.isChange) {
      setStates({
        isEdit: true,
      });
    } else if (states.isEdit && !states.isChange) {
      setStates({
        isEdit: false,
      });
    } else {
      props.handleEdit({
        id: states.data.id,
        hp: states.data.hpTopup,
        voucherId: states.data.voucherId,
        status: states.data.status,
      });
      setStates({
        isEdit: false,
        isChange: false,
      });
      // close()
    }
  };

  const handleEditRek = () => {
    if (!states.isEditRek && !states.isChange) {
      setStates({
        isEditRek: true,
      });
    } else if (states.isEditRek && !states.isChange) {
      setStates({
        isEditRek: false,
      });
    }
  };

  const handleEditTrf = () => {
    if (
      states.data?.trf_no &&
      states.data?.trf_date &&
      states.data?.trf_status
    ) {
      props.handleTrf({
        id: states.data.id,
        trf_no: states.data.trf_no,
        trf_date: states.data.trf_date,
        trf_status: states.data.trf_status,
      });
      setStates({
        isEditTrf: false,
        isChange: false,
      });
      close();
    }
  };

  const toggleEditTrf = () => {
    if (!states.isEditTrf && !states.isChange) {
      setStates({
        isEditTrf: true,
      });
    } else if (states.isEditTrf && !states.isChange) {
      setStates({
        isEditTrf: false,
      });
    } else {
      if (
        states.data?.trf_no &&
        states.data?.trf_date &&
        states.data?.trf_status
      ) {
        props.handleTrf({
          id: states.data.id,
          trf_no: states.data.trf_no,
          trf_date: states.data.trf_date,
          trf_status: states.data.trf_status,
        });
        setStates({
          isEditTrf: false,
          isChange: false,
        });
        close();
      } else {
        alert("Fill all transfer field.");
      }
    }
  };

  const setToFailed = () => {
    props.setToFailed({
      id: states.data.id,
    });
    close();
  };

  const handleInsertTransaction = () => {
    props.insertTransaction({
      hp: states.data.hpTopup,
      processDate: states.form.processDate,
      reference: states.form.reference,
      winnerId: states.data.id,
    });
    close();
  };

  const handleChangeForm = (params: React.ChangeEvent<HTMLInputElement>) => {
    let value = params.target.value;
    let name = params.target.name;
    if (name === "processDate") {
      value = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
    }
    setStates({
      form: {
        [name]: value,
      },
    });
  };

  const handleTopup = async () => {
    if (states.data.voucherType === 3) {
      setStates({
        cashPrize: true,
      });
    } else {
      props.topup({
        id: states.data.id,
        masterBrandId: states.data.masterBrandId,
        userId: states.data.userId,
        hp: states.data.hpTopup,
        voucherId: states.data.voucherId,
        voucherType: states.data.voucherType,
        topupType: states.data.topupType,
      });
      close();
    }
  };
  const handleChangeSelect = async (name: string, v: any) => {
    if (name === "voucherId") {
      setStates({
        data: {
          ...states.data,
          voucherId: +v?.split?.(",")?.[0] || 0,
        },
        isChange: true,
      });
    }
  };

  const handleChangeSelect2 = (e: any, { name, value }: any) => {
    setStates({
      data: {
        ...states.data,
        [name]: value,
      },
    });
  };

  const handleChangeDate = async (data: any) => {
    if (data.value !== "Invalid Date") {
      await setStates({
        data: {
          ...states.data,
          [data.name]: data.value,
        },
      });
    } else {
      await setStates({
        data: {
          ...states.data,
          [data.name]: "",
        },
      });
    }
  };

  let columns: any = [
    // {
    //   title: "Bank Name",
    //   dataIndex: "bank_name",
    //   key: "bank_name",
    // },
    // {
    //   title: "Account Number",
    //   dataIndex: "nomor_rekening",
    //   key: "nomor_rekening",
    // },
    // {
    //   title: "Account Name",
    //   dataIndex: "rek_name",
    //   key: "rek_name",
    // },
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text: any, record: any) =>
        props.master?.isClient ? "SUCCESS" : text,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Serial Number",
      dataIndex: "sn",
      key: "sn",
    },
    {
      title: "Amount Topup",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Proccessed Date",
      dataIndex: "proccesed_date",
      key: "proccesed_date",
      render: (text: any) => <>{dayjs(text).format("DD MMM YYYY HH:mm:ss")}</>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text: any, record: any) => (
        <>
          <Text>
            {props.master?.isClient
              ? "Sukses"
              : text === 1
              ? "Proses"
              : text === 2
              ? "Sukses"
              : text === 3
              ? "Gagal"
              : "Unknown"}
          </Text>
        </>
      ),
    },
  ];

  const dataSource = states?.data?.transaction ? states?.data?.transaction : [];

  dataSource.forEach((i: any, index: number) => {
    i.key = index;
  });

  const trfStatus = [
    { id: 1, key: 1, name: "trf_status", value: 2, label: "SUCCESS" },
    { id: 2, key: 2, name: "trf_status", value: 3, label: "FAILED" },
  ];
  return (
    <Modal
      destroyOnClose
      title={props.header}
      className={"modal"}
      onCancel={close}
      centered
      width={800}
      footer={
        <Space size={2}>
          {/* Original */}
          {/* {states.cashPrize ? (
            <Button
              onClick={handleInsertTransaction}
            >
              Save
            </Button>
          ) : (
              <>
                <Button
                  onClick={handleEdit}
                  style={[3, 0].includes(states?.data?.status) ? {borderBottomLeftRadius: 8} : {borderBottomLeftRadius: 8, backgroundColor: "grey"}}
                  disabled={[3, 0].includes(states?.data?.status) ? false : true}
                >
                  {states.isEdit ? "Save" : "Edit"}
                </Button>
                <Button
                  onClick={handleTopup}
                  style={[3, 0].includes(states?.data?.status) && states?.data?.voucher ? {} : {backgroundColor: "grey"}}
                  disabled={[3, 0].includes(states?.data?.status) && states?.data?.voucher && !states.isEdit ? false : true}
                >
                  Topup
          </Button>
              </>
            )} */}

          {/* mode 2 */}
          {props.master?.isAdmin === true ? (
            states.data?.voucherType === 3 ? (
              <>
                <Button
                  onClick={handleEditRek}
                  style={
                    [3, 0].includes(states?.data?.status)
                      ? { borderBottomLeftRadius: 8 }
                      : { borderBottomLeftRadius: 8, backgroundColor: "grey" }
                  }
                  disabled={
                    [3, 0].includes(states?.data?.status) ? false : true
                  }
                >
                  {states.isEditRek ? "Save" : "Edit"}
                </Button>
                <Button
                  onClick={() =>
                    showConfirm({ onOk: () => () => setToFailed() })
                  }
                  style={
                    [3, 0].includes(states?.data?.status)
                      ? {}
                      : { backgroundColor: "grey" }
                  }
                  disabled={
                    [3, 0].includes(states?.data?.status) && !states.isEditRek
                      ? false
                      : true
                  }
                >
                  Set As Failed
                </Button>
                {states.isEditTrf ? (
                  <Button
                    onClick={handleEditTrf}
                    style={
                      [3, 0].includes(states?.data?.status)
                        ? {}
                        : { backgroundColor: "grey" }
                    }
                    disabled={
                      [3, 0].includes(states?.data?.status) ? false : true
                    }
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    onClick={toggleEditTrf}
                    style={
                      [3, 0].includes(states?.data?.status)
                        ? {}
                        : { backgroundColor: "grey" }
                    }
                    disabled={
                      [3, 0].includes(states?.data?.status) ? false : true
                    }
                  >
                    Set As Complete
                  </Button>
                )}
              </>
            ) : (
              <>
                {props.mode == 1 ? (
                  ""
                ) : (
                  <Row>
                    <Col>
                      <Button
                        onClick={handleEdit}
                        // className={
                        //   [3, 0].includes(states?.data?.status) ? "button" : ""
                        // }
                        className="button"
                        shape="round"
                        style={
                          [3, 0].includes(states?.data?.status)
                            ? { borderBottomLeftRadius: 0 }
                            : {
                                // borderColor: "red",
                                // color: "red",
                                borderBottomLeftRadius: 20,
                                backgroundColor: "white",
                                marginRight: "20px",
                                width: "300px",
                              }
                        }
                        disabled={
                          [3, 0].includes(states?.data?.status) ? false : true
                        }
                      >
                        {states.isEdit ? "Save" : "Edit"}
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        onClick={handleTopup}
                        className={"button"}
                        shape="round"
                        style={
                          [3, 0].includes(states?.data?.status) 
                          // &&
                          // states?.data?.voucher
                            ? {}
                            : {
                                backgroundColor: "white",
                                marginLeft: "20px",
                                width: "300px",
                              }
                        }
                        disabled={
                          [3, 0].includes(states?.data?.status) 
                          // &&
                          // states?.data?.voucher 
                          &&
                          !states.isEdit
                            ? false
                            : true
                        }
                      >
                        Topup
                      </Button>
                    </Col>
                  </Row>
                )}
              </>
            )
          ) : null}
        </Space>
      }
      open={props.open}
    >
      <Form className={"form"} layout="vertical">
        {states.cashPrize ? (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="No Reference">
                <Input
                  name="reference"
                  onChange={(v) => handleChangeForm(v)}
                  value={states?.form?.reference}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Process Date">
                <Input
                  type="datetime-local"
                  name="processDate"
                  onChange={(v) => handleChangeForm(v)}
                  value={
                    dayjs(states?.form?.processDate).format(
                      "YYYY-MM-DDTHH:mm:ss"
                    ) || ""
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        ) : (
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Received Date">
                <Input
                  disabled
                  value={
                    dayjs(states?.data?.created_at).format(
                      "DD-MM-YYYY HH:mm:ss"
                    ) || ""
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Name">
                <Input disabled value={states?.data?.name || ""} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Handphone">
                <Input
                  name="hp"
                  onChange={(e) => {
                    handleChange("hpTopup", e.target.value);
                  }}
                  disabled={states.isEdit ? false : true}
                  value={states?.data?.hpTopup || ""}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Regency">
                <Input disabled value={states?.data?.regency || ""} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Status">
                <Input
                  disabled
                  value={
                    props.master?.isClient
                      ? "Success"
                      : states?.data?.status === 1
                      ? "Process"
                      : states?.data?.status === 2
                      ? "Success"
                      : states?.data?.status === 3
                      ? "Failed"
                      : states?.data?.status === 4
                      ? "Partial Success"
                      : "Unprocess"
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Prize">
                <Input disabled value={states?.data?.prize || ""} />
              </Form.Item>
            </Col>
            {props.mode == 1 ? (
              <Col span={24}>
                <Form.Item label="Invalid / Reject Reason">
                  <Input disabled value={states?.data?.invalid_reason || ""} />
                </Form.Item>
              </Col>
            ) : (
              ""
            )}
            {/* <Col span={8}>
                <Form.Item label="Voucher" name={states?.data?.voucherValue == "1,1" ? undefined : "voucher"} initialValue={states?.data?.voucherValue == "1,1" ? undefined : states?.data?.voucherValue}>
                  {states?.data?.voucherValue == "1,1" ?
                    (<Input disabled value={states?.data?.voucher ? `${states?.data?.voucher} ${states?.data?.voucherAmount}` : ""} />) :
                    (<Select
                      disabled={states.isEdit && states?.data?.status === 3 ? false : true}
                      onChange={(e) => {handleChangeSelect("voucherId", e)}}
                      options={states.vouchers}
                      placeholder="Choose an option"
                      className={"select"}
                    />)}
                </Form.Item>

              </Col> */}
            {/* <Col span={24}>
              <Form.Item label="Serial Number">
                <TextArea disabled value={states?.data?.sn || ""} />
              </Form.Item>
            </Col> */}

            {/* <Col span={24}>
              <Form.Item label="KTP Validation Reject Reason">
                <TextArea disabled value={states?.data?.reject_reason || ""} />
              </Form.Item>
            </Col> */}
            {states.data?.voucherType === 3 ? (
              <>
                <Divider>Detail (for Cash Prize)</Divider>
                <Col span={8}>
                  <Form.Item label="Account Name">
                    <Input
                      name="rek_name"
                      onChange={(e) => {
                        handleChange("rek_name", e.target.value);
                      }}
                      disabled={states.isEditRek ? false : true}
                      value={states?.data?.rek_name || ""}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Account Number">
                    <Input
                      name="nomor_rekening"
                      onChange={(e) => {
                        handleChange("nomor_rekening", e.target.value);
                      }}
                      disabled={states.isEditRek ? false : true}
                      value={states?.data?.nomor_rekening || ""}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Bank Name">
                    <Input
                      name="bank_name"
                      onChange={(e) => {
                        handleChange("bank_name", e.target.value);
                      }}
                      disabled={states.isEditRek ? false : true}
                      value={states?.data?.bank_name || ""}
                    />
                  </Form.Item>
                </Col>
                {/* </>
                <> */}
                <Divider>Fill Transfer Detail (for Cash Prize)</Divider>
                <Col span={8}>
                  <Form.Item label="No. Reference">
                    <Input
                      name="trf_no"
                      onChange={(e) => {
                        handleChange("trf_no", e.target.value);
                      }}
                      disabled={states.isEditTrf ? false : true}
                      value={states?.data?.trf_no || ""}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Transfer Date">
                    <DatePicker
                      disabled={states.isEditTrf ? false : true}
                      // showToday={false}
                      allowClear={false}
                      disabledTime={disabledDateTime}
                      format="DD-MM-YYYY"
                      style={{ width: "100%" }}
                      onChange={(date) =>
                        handleChangeDate({
                          name: "trf_date",
                          value: date,
                        })
                      }
                      defaultValue={
                        states.data?.trf_date
                          ? dayjs(states.data?.trf_date)
                          : undefined
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Status">
                    {/* <Input name="bank_name" onChange={(e) => {handleChange("bank_name", e.target.value)}} disabled={states.isEditTrf ? false : true} value={states?.data?.bank_name || ""} /> */}
                    <Select
                      // style={{ width: '10em', paddingBottom: '1em', paddingTop: '1em', marginRight: '1em' }}
                      disabled={states.isEditTrf ? false : true}
                      onChange={handleChangeSelect2}
                      value={states?.data?.trf_status}
                      options={trfStatus}
                      // placeholder="Pick one"
                    />
                  </Form.Item>
                </Col>
              </>
            ) : null}
            {props.mode == 1 ? "" : <Divider>Transaction</Divider>}
            <Col span={24}>
              {props.mode == 1 ? (
                ""
              ) : (
                <Table
                  style={{ overflowX: "scroll" }}
                  dataSource={states?.data?.transaction || []}
                  columns={columns}
                  key="transaction"
                  pagination={false}
                />
              )}
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};

// export default Modals;
export default React.memo(Modals);
