import React, { useCallback, useEffect, useReducer, useState } from "react";
import dynamic from "next/dynamic";
import type { ReactElement, FocusEvent } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { GetServerSideProps } from "next";
import Error from "next/error";
import {
  getAllProducts,
  masterInvReasonEntry,
  masterStore,
} from "@api/master/index";
// import { PageHeader } from '@ant-design/pro-layout'
import { PageHeader } from "@ant-design/pro-layout";
import Select from "antd/lib/select";
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import Space from "antd/lib/space";
import Divider from "antd/lib/divider";
import Table from "antd/lib/table";
import Affix from "antd/lib/affix";
import Checkbox from "antd/lib/checkbox";
import Notifications from "@/components/Notifications";
import DashboardLayout from "@/components/layouts/Dashboard";
import { showConfirm } from "@/components/modals/ModalAlert";
import {
  IDataEntry,
  IMaster,
  IInvReason,
  IMasterStore,
} from "@/interfaces/entries.interface";
import { detailEnt } from "@/pages/api/entries/list";
import AddItem from "@/pageComponents/Entries/ModalAddItem";
import Compare from "@/pageComponents/Entries/ModalCompare";
import Viewerjs from "@/components/Viewer";
import { withAuth } from "@/components/authHOC";
import { randomString } from "@/lib/clientHelper";

const ModalRejects = dynamic(
  () => import("@/pageComponents/Entries/ModalReject"),
  { loading: () => <p></p>, ssr: false }
);

const DataEntry = (props: any) => {
  const router = useRouter();
  const { query } = router;
  const [states, setStates] = useReducer(
    (state: IDataEntry, newState: Partial<IDataEntry>) => ({
      ...state,
      ...newState,
    }),
    props
  );

  const [container, setContainer] = useState();

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setStates({
      isChecked: false,
    });
    e.preventDefault();
    const { name, value } = e.currentTarget;
    setStates({
      form: {
        ...states.form,
        [name]: value,
      },
    });
  };

  const handleDate = (e: FocusEvent<HTMLInputElement>) => {
    setStates({
      isChecked: false,
    });
    let { purchaseDate } = states.form;
    if (dayjs(purchaseDate, "DDMMYYYY").isValid() === true) {
      setStates({
        form: {
          ...states.form,
          purchaseDate: dayjs(purchaseDate, "DMMYYYY").format("DD/MM/YYYY"),
        },
        formError: {
          error: false,
          errorMessage: "",
          errorField: "",
        },
      });
      return;
    }

    e.preventDefault();
    setStates({
      formError: {
        error: true,
        errorField: e.target.name,
        errorMessage: "Wrong Date Format ex:(23082022)",
      },
    });
  };
  // console.log(states);

  const handleTime = (e: FocusEvent<HTMLInputElement>) => {
    setStates({
      isChecked: false,
    });
    let { purchaseTime } = states.form;
    if (e.target.name == "purchaseTime") {
      if (dayjs(purchaseTime, "HHmmss").isValid() === true) {
        setStates({
          form: {
            ...states.form,
            purchaseTime: dayjs(purchaseTime, "HHmmss").format("HH:mm:ss"),
          },
          formError: {
            error: false,
            errorMessage: "",
            errorField: "",
          },
        });
        return;
      }

      setStates({
        form: {
          ...states.form,
          purchaseTime: "00:00:00",
        },
        formError: {
          error: false,
          errorMessage: "",
          errorField: "",
        },
      });
      return;
    }

    e.preventDefault();
    setStates({
      formError: {
        error: true,
        errorField: e.target.name,
        errorMessage: "Wrong Date Format ex:(23082022)",
      },
    });
  };

  const handleChangeSelect = (value: string, option: any) => {
    setStates({
      isChecked: false,
    });
    const name = option.name;
    if (name == "storeCity") {
      setStates({
        form: {
          ...states.form,
          [name]: value,
          storeProvince: option.province,
        },
      });
      return;
    }

    if (name == "storeName") {
      setStates({
        form: {
          ...states.form,
          [name]: value,
          storeArea: option.area,
          storeCity: option.city,
        },
      });
      return;
    }

    setStates({
      form: {
        ...states.form,
        [name]: value,
      },
    });
  };

  const handleCheckBox = async (e: any, param: any) => {
    const { form } = states;
    const { name, value } = param;
    if (name == "isInvalid") {
      setStates({
        form: {
          ...form,
          [name]: value,
          isValid: false,
        },
        entryCondition: {
          ...states.entryCondition,
          invalidId: undefined,
          duplicateImg: [],
          invalidReason: undefined,
          isDuplicate: 0,
          isValid: 0,
          replyId: 0,
        },
        isChecked: false,
      });
      return;
    }

    if (states.isChecked && form.isInvalid) {
      setStates({
        form: {
          ...form,
          [name]: value,
          isInvalid: false,
        },
        entryCondition: {
          ...states.entryCondition,
          invalidId: undefined,
          duplicateImg: [],
          invalidReason: undefined,
          isDuplicate: 0,
          isValid: 1,
          replyId: 0,
        },
      });
    }

    if (name === "isStampAdmin") {
      setStates({
        form: {
          ...form,
          [name]: value,
          isInvalid: false,
        },
      });
    }
  };

  const handleOpenModal = useCallback(
    (e: any) => {
      if (e.mode === "edit") {
        setStates({
          [e.name]: e.value,
          editList: e.data,
        });
      } else {
        if (e.name == "compareModal" && e.value == false) {
          document.getElementById("compareButtonRef")?.focus();
        }

        if (e.name == "modalAdd" && e.value == false) {
          document.getElementById("modalAddRef")?.focus();
        }

        setStates({
          [e.name]: e.value,
          editList: "",
          modalType: e.modalType,
        });
      }
    },
    [
      states.modalAdd,
      states.modalAddItem,
      states.modalAttachments,
      states.modalCompare,
      states.modalReject,
      states.modalType,
    ]
  );

  const getProductsByCategory = async (value: any) => {
    const dataProd: any = await getProductByCats(value);
    setStates({
      master: {
        ...states.master,
        productsByCat: dataProd,
      },
    });
  };

  const handleProduct = async (data: any) => {
    setStates({
      isChecked: false,
    });
    let { dataTable, totalAmount } = states;

    totalAmount = Number(totalAmount);

    if (data.action === "add") {
      dataTable.push(data.data);
      totalAmount = totalAmount + data.data.totalPrice;
    } else if (data.action === "edit") {
      let index = await data.data.index;
      totalAmount = totalAmount - dataTable[index].totalPrice;
      dataTable.splice(data.data.index, 1);

      dataTable.push(data.data);
      totalAmount = totalAmount + data.data.totalPrice;
    } else {
      let index = data.data.key;
      totalAmount = totalAmount - dataTable[index].totalPrice;
      dataTable.splice(data.data.key, 1);
    }

    setStates({
      dataTable,
      totalAmount,
    });
    document.getElementById("buttonAddItem")?.focus();
  };

  const formatNumber = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    const { data } = props;
    if (data) {
      setStates({
        master: {
          ...states.master,
          rsa: data.rsaByStore,
        },
      });

      router.push(
        {
          pathname: router.pathname,
          query: { entries: router.query.entries },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [props.data]);

  useEffect(() => {
    const { form } = props;
    if (form) {
      setStates({
        form: form,
      });
    }
  }, [props.form]);

  // useEffect(() => {
  //     const {form} = states
  //     if (form.storeName) {
  //         const rsaData = async () => {
  //             let data = await getRsaByStore(form.storeName)
  //             return data
  //         }
  //         rsaData().then(res =>
  //             setStates({
  //                 master: {
  //                     ...states.master,
  //                     rsa: res
  //                 }
  //             })
  //         )
  //     }
  // }, [states.form.storeName])

  useEffect(() => {
    setContainer(document.getElementById("containerImage") as any);
  }, []);

  if (props.error) {
    return <Error statusCode={400} />;
  }

  !states.dataTable
    ? []
    : states.dataTable.forEach((i: any, index: any) => {
        i.key = index;
      });

  const validateData = async () => {
    setStates({
      isLoading: true,
    });
    let { form, dataTable, totalAmount, entryCondition } = states;

    if (states.form.storeType == "1") {
      setStates({
        isLoading: false,
        isChecked: true,
        form: {
          ...states.form,
          isValid: true,
          isInvalid: false,
        },
      });
      return;
    }

    let data = {
      entryId: form.entryId,
      trx: form.storeReceipt,
      purchaseDate: !form.purchaseDate
        ? "0000-00-00 00:00:00"
        : dayjs(form.purchaseDate, "DD/MM/YYYY")
            .format("YYYY-MM-DD")
            .toString() +
          " " +
          (form.purchaseTime == "" ? "00:00:00" : form.purchaseTime),
      totalAmount,
      // isStamp: form.isStampAdmin === true ? 1 : 0,
      products: dataTable,
      invalidId: entryCondition.invalidId,
    };

    let encryp = Buffer.from(JSON.stringify(data)).toString("base64");
    let response: any = await validateThis(encryp);
    setStates({
      isLoading: false,
      isChecked: true,
      entryCondition: {
        duplicateImg: response.duplicate_img,
        isValid: response.is_valid,
        isDuplicate: response.is_duplicate,
        replyId: response.reply_id,
        invalidId: response.invalid_id,
        invalidReason: response.invalid_reason,
      },
      form: {
        ...states.form,
        isValid: response.is_valid == 1 ? true : false,
        isInvalid: response.is_valid == 0 ? true : false,
      },
    });

    if (response.is_duplicate == 1) {
      handleOpenModal({
        name: "modalCompare",
        value: true,
      });
    }
  };

  const submitData = async () => {
    let { form, dataTable, totalAmount, entryCondition } = states;
    setStates({
      isChecked: false,
    });
    let datas = {
      entryId: form.entryId,
      trx: form.storeReceipt,
      purchaseDate: !form.purchaseDate
        ? null
        : dayjs(form.purchaseDate, "DD/MM/YYYY")
            .format("YYYY-MM-DD")
            .toString() +
          " " +
          (form.purchaseTime == "" ? "00:00:00" : form.purchaseTime),
      products: dataTable,
      isValid: entryCondition.isValid,
      storeId: form.storeId,
      promoId: form.promoId,
      // storeType: form.storeTypeAdmin,
      // storeChannel: form.storeChannelAdmin,
      // isStamp: form.isStampAdmin === true ? 1 : 0,
      // storeAddress: form.storeName,
      invalidId: entryCondition.invalidId ? entryCondition.invalidId : 0,
      // totalAmount,
      // name: form.name,
      // handphone: form.handphone,
      // regency: form.regency,
    };

    let encryp = Buffer.from(JSON.stringify(datas)).toString("base64");
    let response: any = await saveThis(encryp);

    if (response.status !== 200) {
      alert(response.error);
    } else {
      Notifications("success", "Data successfully Entried.", "");
      backToEntries();
    }
  };

  const approveData = async (status: string) => {
    setStates({
      isLoading: true,
    });

    let { form } = states;

    let datas = {
      entryId: form.entryId,
      approve: status,
    };

    let encryp = Buffer.from(JSON.stringify(datas)).toString("base64");

    let response: any = await approveThis(encryp);

    if (response.status !== 200) {
      Notifications("error", response.error, "");
    } else {
      Notifications("success", "Approve Success.", "");
      backToEntries();
    }
  };

  const approveData100 = async (status: string) => {
    setStates({
      isLoading: true,
    });
    let { form } = states;
    let datas = {
      entryId: form.entryId,
      approve: status,
    };

    let encryp = Buffer.from(JSON.stringify(datas)).toString("base64");
    let response: any = await approveThis100(encryp);

    if (response.status !== 200) {
      Notifications("error", response.error, "");
    } else {
      Notifications("success", "Send 100 Winner Success.", "");
      backToEntries();
    }
  };

  // console.log(states, "TSTATTA");

  const rejectData = async (reason: any) => {
    setStates({
      isLoading: true,
    });
    let { form, profileId } = states;

    let datas = {
      entryId: form.entryId,
      rejectId: reason,
      userId: profileId,
    };
    let encryp = Buffer.from(JSON.stringify(datas)).toString("base64");
    let response: any = await rejectThis(encryp);

    if (response.status !== 200) {
      Notifications("error", response.error, "");
    } else {
      Notifications("success", "Data Rejected.", "");
      backToEntries();
    }
  };

  // console.log(states.master.invalidReason);
  // console.log(states.entryCondition.invalidId);
  // console.log(states.form.isValid, "ISVAL");
  // console.log(states.form.isInvalid, "InVALID");
  // console.log(states.approval == 2 ? false : true, "isApp");

  const backToEntries = () => {
    router.push(
      `/entries`
      // `/entries?key=${states.backFilter.key}&page=${states.backFilter.page}&row=${states.backFilter.row}&startDate=${states.backFilter.startDate}&endDate=${states.backFilter.endDate}&column=${states.backFilter.column}&direction=${states.backFilter.direction}&isValid=${states.backFilter.isValid}&isValidAdmin=${states.backFilter.isValidAdmin}&isApprovedAdmin=${states.backFilter.isApprovedAdmin}`
    );
  };
  return (
    <>
      <PageHeader
        title="Data Entry"
        extra={[
          !query.type ? (
            <Space key={"space1"}>
              <Button
                key="ReturnToEnt"
                id={"returnRef"}
                onClick={backToEntries}
                className={"button"}
                shape="round"
              >
                Return to Entries
              </Button>
              {states.approval == 3 ? (
                <>
                  <Button
                    loading={states.isLoading}
                    key="ButtonInvalid"
                    // style={{ backgroundColor: "grey" }}
                    // onClick={() => showConfirm({ onOk: (() => approveData("2") )})}
                    onClick={() =>
                      handleOpenModal({
                        name: "modalReject",
                        value: true,
                      })
                    }
                    className={"button"}
                    shape="round"
                    id={"invalidButRef"}
                    // disabled
                  >
                    Reject
                  </Button>
                  <Button
                    loading={states.isLoading}
                    key="Buttonvalid"
                    onClick={() =>
                      showConfirm({ onOk: () => approveData("1") })
                    }
                    className={"button"}
                    shape="round"
                    id={"validRef"}
                  >
                    Approve
                  </Button>{" "}
                </>
              ) : null}
              {states.approval == 5 ? (
                <>
                  <Button
                    loading={states.isLoading}
                    key="Buttonvalid"
                    onClick={() =>
                      showConfirm({ onOk: () => approveData100("1") })
                    }
                    className={"button"}
                    shape="round"
                    id={"validRef"}
                  >
                    Set to 100 Winner
                  </Button>{" "}
                </>
              ) : null}
            </Space>
          ) : null,
        ]}
      />
      <Row gutter={20}>
        <Col xl={14} sm={12}>
          <Card title="Entry">
            <Form
              className={"form"}
              layout="vertical"
              onFinish={() => showConfirm({ onOk: () => submitData() })}
            >
              <Row gutter={16}>
                {/* <Col span={24}>
                                    <Form.Item label="Message">
                                        <Input.TextArea
                                            rows={5}
                                            name="message"
                                            value={states.form.message}
                                            placeholder="Message"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col> */}
                <Col span={12}>
                  <Form.Item
                    label="Name"
                    rules={[
                      {
                        required: true,
                        message: "This field is required!",
                      },
                    ]}
                    initialValue={states.form.name}
                  >
                    <Input
                      tabIndex={1}
                      name="name"
                      value={states.form.name}
                      onChange={handleChange}
                      placeholder="Name"
                      className={"input"}
                      readOnly
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email">
                    <Input
                      tabIndex={3}
                      name="email"
                      value={states.form.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className={"input"}
                      readOnly
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="No Whatsapp">
                    <Input
                      tabIndex={4}
                      name="sender"
                      value={states.form.sender}
                      placeholder="Sender"
                      className={"input"}
                      readOnly
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Media">
                    <Input
                      tabIndex={4}
                      name="media"
                      value={states.form.media}
                      placeholder="Media"
                      className={"input"}
                      readOnly
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="ID Number (KTP)">
                    <Input
                      tabIndex={4}
                      name="idNumber"
                      value={states.form.idNumber}
                      placeholder="ID Number"
                      className={"input"}
                      readOnly
                    />
                  </Form.Item>
                </Col>
                {/* <Col span={12}>
                  <Form.Item label="City">
                    <Input
                      tabIndex={5}
                      name="regency"
                      value={states.form.regency}
                      onChange={handleChange}
                      placeholder="City"
                      className={"input"}
                      readOnly
                    />
                  </Form.Item>
                </Col> */}
                <Col span={24}>
                  <Form.Item label="Received Date">
                    <Input
                      tabIndex={6}
                      name="rcvd_time"
                      value={states.form.rcvd_time}
                      placeholder="Received Date"
                      className={"input"}
                      readOnly
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Coupon Number">
                    <Input
                      tabIndex={6}
                      name="couponNumber"
                      value={states.form.coupon}
                      placeholder="Coupons"
                      className={"input"}
                      readOnly
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Points Claimed">
                    <Input
                      tabIndex={6}
                      name="totalPoint"
                      value={states.form.totalPoint}
                      placeholder="Coupons"
                      className={"input"}
                      readOnly
                    />
                  </Form.Item>
                </Col>
                <Divider />
                {/* <Col span={12}>
                  <Form.Item
                    label="Purchase Date"
                    rules={[
                      {
                        required: true,
                        message: "This field is required!",
                      },
                    ]}
                    validateStatus={
                      states.formError.errorField == "purchaseDate" &&
                      states.formError.error
                        ? "error"
                        : "success"
                    }
                    help={states.formError.errorMessage}
                  >
                    <Input
                      id={"purchaseDateRef"}
                      tabIndex={8}
                      name="purchaseDate"
                      onChange={handleChange}
                      value={states.form.purchaseDate}
                      placeholder="dd/MM/yyyy"
                      className={"input"}
                      onBlur={handleDate}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                        }
                      }}
                      readOnly={states.approval == 2 ? false : true}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Purchase Time"
                    rules={[
                      {
                        required: true,
                        message: "This field is required!",
                      },
                    ]}
                  >
                    <Input
                      tabIndex={9}
                      name="purchaseTime"
                      onChange={handleChange}
                      value={states.form.purchaseTime}
                      placeholder="HH:mm:ss"
                      className={"input"}
                      onBlur={handleTime}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                        }
                      }}
                      readOnly={states.approval == 2 ? false : true}
                    />
                  </Form.Item>
                </Col> */}
                {/* <Col span={12}>
                                    <Form.Item
                                        label="Store Name"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'This field is required!',
                                            },
                                        ]}
                                        initialValue={states.form.storeNameAdmin}
                                    >
                                        <Input
                                            tabIndex={10}
                                            name="storeNameAdmin"
                                            onChange={handleChange}
                                            value={states.form.storeNameAdmin}
                                            placeholder="Store Name"
                                            className={"input"}
                                        />
                                    </Form.Item>
                                </Col> */}
                {/* <Col span={12}>
                  <Form.Item label="Store Name">
                    <Select
                      tabIndex={12}
                      className={"select"}
                      filterOption={(input, option: any) =>
                        option?.props.label
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      id="categoryProductRef"
                      value={states.form.storeId}
                      placeholder="- Select -"
                      options={states.master.store}
                      showSearch
                      onChange={(e, { value, text }: any) =>
                        handleChangeSelect(value, { name: "storeId" })
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Backspace") {
                          // setStates({
                          //   pickedProd: undefined,
                          // });
                        } else if (event.key === "Tab") {
                          // event.preventDefault();
                          // handleChangeFocus("categoryProductRef");
                        } else if (event.key === "Enter") {
                          event.preventDefault();
                        }
                      }}
                      disabled={states.approval == 2 ? false : true}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Store Receipt"
                    rules={[
                      {
                        required: true,
                        message: "This field is required!",
                      },
                    ]}
                    initialValue={states.form.storeReceipt}
                  >
                    <Input
                      tabIndex={16}
                      name="storeReceipt"
                      onChange={handleChange}
                      value={states.form.storeReceipt}
                      placeholder="Store Receipt"
                      className={"input"}
                      readOnly={states.approval == 2 ? false : true}
                    />
                  </Form.Item>
                </Col> */}
                {/* <Col span={24}>
                  {states.approval == 2 ? (
                    <Button
                      className="button-c"
                      // shape="round"
                      style={{
                        marginBottom: "1em",
                        borderRadius: "20px",
                        color: "grey",
                      }}
                      onClick={() =>
                        handleOpenModal({ name: "modalAdd", value: true })
                      }
                      tabIndex={18}
                      id={"modalAddRef"}
                      onKeyDown={(event) => {
                        if (event.key === "Tab") {
                          event.preventDefault();
                          document.getElementById("invalidRef")?.focus();
                        }
                      }}
                    >
                      Add Item
                    </Button>
                  ) : null}
                  <Table
                    size="middle"
                    pagination={false}
                    dataSource={[...states.dataTable]}
                    summary={() => (
                      <Table.Summary.Row style={{ fontWeight: "bolder" }}>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          Total Amount
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          {formatNumber(states.totalAmount)}
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                  >
                    <Table.Column title="Product" dataIndex="name" key="name" />
                    <Table.Column
                      title="Quantity"
                      dataIndex="quantity"
                      key="quantity"
                      render={(x) => {
                        return <>{formatNumber(x)}</>;
                      }}
                    />
                    <Table.Column
                      title="Price Per Item"
                      dataIndex="price"
                      key="price"
                      render={(x) => {
                        return <>{formatNumber(x)}</>;
                      }}
                    />
                    <Table.Column
                      title="Total Price"
                      dataIndex="totalPrice"
                      key="totalPrice"
                      render={(x) => {
                        return <>{formatNumber(x)}</>;
                      }}
                    />
                    <Table.Column
                      title="Action"
                      key="action"
                      render={(text, record) =>
                        states.approval == 2 ? (
                          <Button.Group>
                            <Button
                              onClick={() =>
                                handleOpenModal({
                                  name: "modalAdd",
                                  mode: "edit",
                                  data: record,
                                  value: true,
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleProduct({ data: record })}
                            >
                              Delete
                            </Button>
                          </Button.Group>
                        ) : null
                      }
                    />
                  </Table>
                </Col> */}
                <Col span={24} style={{ marginTop: "1em" }}>
                  <Row>
                    <Col span={12}>
                      <Checkbox
                        id={"invalidRef"}
                        disabled={states.approval == 2 ? false : true}
                        checked={states.form.isInvalid}
                        onChange={(e) =>
                          handleCheckBox(e, {
                            name: "isInvalid",
                            value: e.target.checked,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Tab") {
                            event.preventDefault();
                            document.getElementById("validRef")?.focus();
                          }

                          if (event.key === " ") {
                            event.preventDefault();
                            handleCheckBox(event, {
                              name: "isInvalid",
                              value: !states.form.isInvalid,
                            });
                          }
                        }}
                      >
                        INVALID
                      </Checkbox>
                    </Col>
                    <Col span={12}>
                      <Checkbox
                        id={"validRef"}
                        checked={states.form.isValid}
                        disabled={states.approval == 2 ? false : true}
                        onChange={(e) =>
                          handleCheckBox(e, {
                            name: "isValid",
                            value: e.target.checked,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Tab") {
                            event.preventDefault();
                            if (states.form.isInvalid) {
                              document.getElementById("rejRef")?.focus();
                              return;
                            }

                            document.getElementById("checkRef")?.focus();
                          }

                          if (event.key === " ") {
                            event.preventDefault();
                            handleCheckBox(event, {
                              name: "isValid",
                              value: !states.form.isValid,
                            });
                          }
                        }}
                      >
                        VALID
                      </Checkbox>
                    </Col>
                  </Row>
                </Col>
                {[1, 3].includes(states.approval as number) &&
                states.form.isValid ? (
                  <Col span={24} style={{ marginTop: "1em" }}>
                    <Form.Item label="Prize Received">
                      <Input
                        tabIndex={6}
                        name="prizeName"
                        value={states.form.prizeName}
                        placeholder="Prize Received"
                        className={"input"}
                        readOnly
                      />
                    </Form.Item>
                  </Col>
                ) : null}
                <Col span={24} style={{ paddingTop: "2em" }}>
                  <Form.Item
                    label="Invalid Reason"
                    hidden={!states.form.isInvalid ? true : false}
                  >
                    <Select
                      tabIndex={19}
                      disabled={[1, 3].includes(states.approval as number)}
                      className={"select"}
                      style={{ color: "black" }}
                      placeholder="Pick a Reason"
                      options={states.master.invalidReason}
                      value={states.entryCondition.invalidId}
                      id={"rejRef"}
                      onChange={(e, { value, text }: any) =>
                        states.form.storeType == "1"
                          ? setStates({
                              isChecked: true,
                              entryCondition: {
                                ...states.entryCondition,
                                invalidId: value,
                              },
                            })
                          : setStates({
                              entryCondition: {
                                ...states.entryCondition,
                                invalidId: value,
                              },
                            })
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Tab") {
                          event.preventDefault();
                          document.getElementById("checkRef")?.focus();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                {states.approval == 2 ? (
                  <>
                    <Col span={12}>
                      <Form.Item>
                        <Button
                          key="ButtonCheck"
                          // style={{marginTop: "1em"}}
                          onClick={validateData}
                          className={"button2"}
                          shape="round"
                          loading={states.isLoading}
                          id={"checkRef"}
                          type="default"
                          onKeyDown={(event) => {
                            if (event.key === "Tab") {
                              event.preventDefault();
                              if (!states.isChecked) {
                                document
                                  .getElementById("purchaseDateRef")
                                  ?.focus();
                                return;
                              }

                              document.getElementById("saveRef")?.focus();
                            }
                          }}
                        >
                          Check
                        </Button>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item>
                        <Button
                          key="ButtonSave"
                          id={"saveRef"}
                          style={
                            !states.isChecked
                              ? { backgroundColor: "white" }
                              : {}
                          }
                          disabled={!states.isChecked}
                          // onClick={() => showConfirm({ onOk: (() => submitData() )})}
                          htmlType={"submit"}
                          className={"button-dataEntry"}
                          shape="round"
                          onKeyDown={(event) => {
                            if (event.key === "Tab") {
                              event.preventDefault();
                              document
                                .getElementById("purchaseDateRef")
                                ?.focus();
                            }
                          }}
                        >
                          Save
                        </Button>
                      </Form.Item>
                    </Col>
                  </>
                ) : null}
              </Row>
            </Form>
          </Card>
        </Col>
        <Col xl={10} sm={12}>
          <Row>
            <Col span={24}>
              <Affix offsetTop={10}>
                <Card
                  className={"card-profile-data-entry"}
                  title="Struct Photo"
                >
                  <div
                    id="containerImage"
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Viewerjs url={states.form.url} container={container} />
                  </div>
                </Card>
              </Affix>
            </Col>
          </Row>
        </Col>
      </Row>
      <AddItem
        header={
          states.modalType == "Add"
            ? "Add Item"
            : states.modalType == "Edit"
            ? "Edit Item"
            : ""
        }
        open={states.modalAdd}
        handleOpenModal={handleOpenModal}
        // dataCat={states.master.productsCat}
        // dataCat={dataProductByCat}
        getProducts={getProductsByCategory}
        dataProd={states.master.productsByCat}
        handleAddItem={handleProduct}
        editList={states.editList}
      />
      <ModalRejects
        dataReject={states.master.invalidReason}
        open={states.modalReject}
        handleOpenModal={handleOpenModal}
        onSubmit={rejectData}
      />
      <Compare
        header={
          states.modalType == "compareStruct"
            ? "Compare Struct"
            : "Duplicate Validation"
        }
        open={states.modalCompare}
        handleOpenModal={handleOpenModal}
        // storeGenuineStruct={states.form.storeGenuineStruct}
        storeGenuineStruct={states.form.url}
        duplicateStruct={states.entryCondition.duplicateImg}
        url={states.form.url}
        type={
          states.modalType == "compareStruct"
            ? "compareStruct"
            : "duplicateValidation"
        }
        handleCheckBox={handleCheckBox}
      />
    </>
  );
};

const getRsaByStore = async (id: string | undefined) => {
  let res: any = await fetch(`/api/master/rsa?id=${id}`);
  if (res.status !== 404) {
    let dataList = await res.json();
    return dataList;
  } else {
    return alert("Error 404");
  }
};

const approveThis100 = async (data: any) => {
  let res: any = await fetch(`/api/validatore/approvare100`, {
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

const getProductByCats = async (id: string) => {
  let res: any = await fetch(`/api/master/products?category=${id}`);
  if (res.status !== 404) {
    let dataList = await res.json();
    return dataList;
  } else {
    return alert("Error 404");
  }
};

const approveThis = async (data: any) => {
  let res: any = await fetch(`/api/validatore/approvare`, {
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

const rejectThis = async (data: any) => {
  let res: any = await fetch(`/api/validatore/rifiutare`, {
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

const validateThis = async (data: any) => {
  let res: any = await fetch(`/api/validatore/controllare`, {
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

const saveThis = async (data: any) => {
  let res: any = await fetch(`/api/validatore/salvare`, {
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
  let entryId: any = ctx.query.entries;
  // let storeId = ctx.query.store

  // if (storeId) {
  //     const rsa = await rsaByStore(storeId.toString())
  //     return {
  //         props: {
  //             data: {
  //                 rsaByStore: JSON.parse(JSON.stringify(rsa))
  //             }
  //         }
  //     }
  // }

  const dataDetail: any = await detailEnt(entryId);
  const {
    // fullname,
    name,
    media,
    idNumber,
    sender,
    email,
    hp,
    coupon,
    regency,
    rcvd_time,
    message,
    is_valid,
    invalidId,
    purchase_date,
    purchase_amount_admin,
    storeReceipt,
    totalPoint
  } = dataDetail.entries[0];

  let dataImgs = JSON.parse(JSON.stringify(dataDetail.url)) || [];

  let form = {
    entryId,
    // fullname,
    name,
    email,
    idNumber,
    coupon,
    sender,
    media,
    handphone: hp,
    regency,
    rcvd_time: rcvd_time ? dayjs(rcvd_time).format("DD/MM/YYYY HH:mm:ss") : "",
    message,
    storeReceipt,
    purchaseDate: purchase_date
      ? dayjs(purchase_date).format("DD/MM/YYYY")
      : null,
    purchaseTime: purchase_date
      ? dayjs(purchase_date).format("HH:mm:ss")
      : null,
    url: dataImgs,
    isValid: is_valid == 1 ? true:false,
    isInvalid: is_valid == 0 ? true:false,
    totalPoint
    // isValid: is_valid == 1 && is_valid_admin == 1 ? true : false,
    // isInvalid: is_valid == 0 ? true : is_valid_admin == 2 ? true : false,
  };

  let dataVariants = JSON.parse(JSON.stringify(dataDetail.variants)) || [];

  let master = {
    sizes: [],
    store: [],
    storeCity: [],
    rsa: [],
    alfaArea: [],
    productsByCat: [],
    invalidReason: [],
    districts: [],
    prizeSAP: [],
  } as IMaster;

  const store = (await masterStore()) as IMasterStore[];
  // const storeCity = await masterStoreCity() as IMasterStoreCity[]
  const allProducts = (await getAllProducts()) as string[];
  const invReason = (await masterInvReasonEntry()) as IInvReason[];

  master.store = store;
  master.storeCity = [];
  master.invalidReason = invReason;
  master.productsByCat = allProducts;

  interface IPagination {
    row: string | number;
    page: string | number;
    key: string;
    direction: string;
    column: string;
    limit: number | string;
    media: string;
    startDate: string;
    endDate: string;
    isValid: string | number;
    isValidAdmin: string | number;
    isApprovedAdmin: string | number;
    type: string;
  }

  const {
    row,
    page,
    key,
    direction,
    column,
    startDate,
    endDate,
    isValid,
    isValidAdmin,
    isApprovedAdmin,
    mode,
  } = ctx.query as any;

  const params: IPagination = {
    row: row ?? 10,
    page: page ?? 0,
    key: key ?? "",
    direction: direction ?? "",
    column: column ?? "",
    limit: "",
    media: "",
    startDate: startDate ?? "",
    endDate: endDate ?? "",
    isValid: isValid ?? "",
    isValidAdmin: isValidAdmin ?? "",
    isApprovedAdmin: isApprovedAdmin ?? "",
    type: "1",
  };

  return {
    props: {
      backFilter: params,
      form,
      master: JSON.parse(JSON.stringify(master)),
      formError: {
        error: false,
        errorField: "",
        errorMessage: "",
      },
      isLoading: false,
      modalAdd: false,
      modalReject: false,
      modalType: "",
      modalAddItem: "",
      modalCompare: false,
      dataTable: dataVariants,
      // totalAmount: form.purchaseAmountAdmin || 0,
      totalAmount: purchase_amount_admin || 0,
      editList: "",
      invalid_reason: "",
      isChecked: false,
      approval: Number(mode) ?? "0",
      entryCondition: {
        duplicateImg: [],
        isValid: "",
        isDuplicate: 0,
        replyId: 0,
        invalidReason: "",
        invalidId: invalidId,
      },
    },
  };
});

export default DataEntry;

DataEntry.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

// 1: view, 2: entry, 3: approve
