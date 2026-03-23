import React, { useReducer, useRef, memo, useEffect } from "react";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import DatePicker from "antd/lib/date-picker";
import Button from "antd/lib/button";
import Select from "antd/lib/select";
import dayjs from "dayjs";
import { Space } from "antd";

interface IState {
  startDate: string;
  endDate: string;
  storeId: string;
  prize: string;
  status: string | number;
  isValidAdmin: string | number;
  isApprovedAdmin: string | number;
  media: string | number;
  isApproved: string | number;
  isHaveAtt: string;
  master: any;
}

let initialState = {
  startDate: "",
  endDate: "",
  storeId: "",
  prize: "",
  status: "",
  isValidAdmin: "",
  isApprovedAdmin: "",
  media: "",
  isApproved: "",
  isHaveAtt: "",
  master: [],
};

const range = (start: any, end: any) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

export const disabledDateTime = () => {
  return {
    disabledHours: () => range(0, 24).splice(4, 20),
    disabledMinutes: () => range(30, 60),
    disabledSeconds: () => [55, 56],
  };
};

const Filter = (props: any) => {
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    initialState
  );

  const handleSubmit = (data: any) => {
    if (states.startDate === "" || states.endDate === "") {
      alert("Fill all target dates.");
    } else {
      let datas = {
        startDate:
          states.startDate === null || states.startDate === ""
            ? ""
            : dayjs(states.startDate).format("YYYY-MM-DD"),
        endDate:
          states.endDate === null || states.endDate === ""
            ? ""
            : dayjs(states.endDate).format("YYYY-MM-DD"),
        prize: states.prize,
        isValid: states.status,
        isValidAdmin: states.isValidAdmin,
        isApprovedAdmin: states.isApprovedAdmin,
        isApproved: states.isApproved,
        media: states.media,
        storeId: states.storeId,
        isHaveAtt: states.isHaveAtt,
      };
      props.handleFilter(datas);
    }
  };

  const handleReset = () => {
    let datas = {
      startDate: "",
      endDate: "",
      isValid: "",
      isValidAdmin: "",
      isApprovedAdmin: "",
      media: "",
      isApproved: "",
      storeId: "",
    };
    props.handleFilter(datas);
    setStates(initialState);
  };

  const handleChangeDate = async (data: any) => {
    if (data.value !== "Invalid Date") {
      await setStates({
        [data.name]: data.value,
      });
    } else {
      await setStates({
        [data.name]: "",
      });
    }
  };

  // const handleChangeInput = (e) => {
  //   setState({
  //     [e.target.name]: e.target.value,
  //   });
  // };

  const handleChangeSelect = (e: any, name: any) => {
    setStates({ [name]: e });
  };

  const close = () => {
    props.handleOpenModal({ name: "modalFilter", value: false });
  };

  useEffect(() => {
    const { master } = props;
    setStates({
      master,
    });
  }, [props.master]);

  useEffect(() => {
    const {
      startDate,
      endDate,
      prizeId,
      isValid,
      isValidAdmin,
      isApprovedAdmin,
      isApproved,
      isHaveAtt,
    } = props.filter;
    setStates({
      startDate,
      endDate,
      prize: prizeId,
      status: isValid ? parseInt(isValid) : "",
      isValidAdmin: isValidAdmin ? parseInt(isValidAdmin) : "",
      isApprovedAdmin: isApprovedAdmin ? parseInt(isApprovedAdmin) : "",
      isApproved: isApproved ? parseInt(isApproved) : "",
      isHaveAtt,
    });
  }, [props.filter]);

  let optionsStatus = [
    { key: "1", name: "status", value: "", label: "All" },
    { key: "2", name: "status", value: 1, label: "Valid" },
    { key: "3", name: "status", value: 0, label: "Invalid" },
  ];

  let optionsStatusAdmin = [
    { key: "1", name: "is_valid_admin", value: "", label: "All" },
    { key: "2", name: "is_valid_admin", value: 3, label: "Unprocessed" },
    { key: "3", name: "is_valid_admin", value: 1, label: "Valid" },
    { key: "4", name: "is_valid_admin", value: 2, label: "Invalid" },
  ];

  let optionsApproveAdmin = [
    { key: "1", name: "is_approved_admin", value: "", label: "All" },
    { key: "2", name: "is_approved_admin", value: 3, label: "Unprocessed" },
    { key: "3", name: "is_approved_admin", value: 1, label: "Approved" },
    { key: "4", name: "is_approved_admin", value: 2, label: "Rejected" },
  ];

  const optionsStatusWinner = [
    {
      key: 0,
      label: "Unprocessed",
      name: "status",
      value: 4,
    },
    {
      key: 1,
      label: "Processed",
      name: "status",
      value: 1,
    },
    {
      key: 2,
      label: "Success",
      name: "status",
      value: 2,
    },
    {
      key: 3,
      label: "Failed",
      name: "status",
      value: 3,
    },
    {
      key: 4,
      label: "All",
      name: "status",
      value: "",
    },
  ];

  let optionsMedia = [
    { key: "1", name: "media", value: "", label: "All" },
    { key: "2", name: "media", value: 3, label: "WA" },
    { key: "3", name: "media", value: 5, label: "APPS" },
  ];

  const optionsApproveWinner = [
    {
      key: 0,
      label: "Unverified",
      name: "isApproved",
      value: 5,
    },
    {
      key: 1,
      label: "Verified",
      name: "isApproved",
      value: 1,
    },
    // {
    //   key: 2,
    //   label: "Rejected",
    //   name: "isApproved",
    //   value: 2
    // },
    {
      key: 3,
      label: "All",
      name: "isApproved",
      value: "",
    },
  ];

  return (
    <Modal
      destroyOnClose
      title={props.header}
      centered
      footer={null}
      open={props.open}
      onCancel={close}
      className={"modal"}
    >
      <Row>
        <Col span={24}>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Start Date">
                  <DatePicker
                    // showToday={false}
                    className={"input"}
                    allowClear={false}
                    disabledTime={disabledDateTime}
                    format="DD-MM-YYYY"
                    style={{ width: "100%" }}
                    name="startDate"
                    onChange={(date) =>
                      handleChangeDate({
                        name: "startDate",
                        value: date,
                      })
                    }
                    defaultValue={
                      states.startDate === ""
                        ? undefined
                        : dayjs(states.startDate)
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="End Date">
                  <DatePicker
                    // showToday={false}
                    className={"input"}
                    allowClear={false}
                    disabledTime={disabledDateTime}
                    format="DD-MM-YYYY"
                    style={{ width: "100%" }}
                    onChange={(date) =>
                      handleChangeDate({
                        name: "endDate",
                        value: date,
                      })
                    }
                    defaultValue={
                      states.endDate === "" ? undefined : dayjs(states.endDate)
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            {props.tgt === "entries" ? (
              <>
                <Row>
                  <Col span={24}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item label="Select Is Valid">
                          <Select
                            // name="status"
                            className={"select"}
                            value={states.status}
                            onChange={(e) => handleChangeSelect(e, "status")}
                            options={optionsStatus}
                            placeholder="Choose an option"
                          />
                        </Form.Item>
                      </Col>
                      {/* <Col span={24}>
                        <Form.Item label="Select Is Valid Admin">
                          <Select
                            // name="status"
                            className={"select"}
                            value={states.isValidAdmin}
                            onChange={(e) =>
                              handleChangeSelect(e, "isValidAdmin")
                            }
                            options={optionsStatusAdmin}
                            placeholder="Choose an option"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item label="Select Is Approved Admin">
                          <Select
                            // name="status"
                            className={"select"}
                            value={states.isApprovedAdmin}
                            onChange={(e) =>
                              handleChangeSelect(e, "isApprovedAdmin")
                            }
                            options={optionsApproveAdmin}
                            placeholder="Choose an option"
                          />
                        </Form.Item>
                      </Col> */}
                    </Row>
                  </Col>
                </Row>
                {/* <Row>
              <Col span={24}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Select Media">
                      <Select
                        // name="status"
                        className={"select"}
                        value={states.media}
                        onChange={(e) => handleChangeSelect(e, 'media')}
                        options={optionsMedia}
                        placeholder="Choose an option"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row> */}
              </>
            ) : props.tgt === "winner" ? (
              <>
                <Row>
                  <Col span={24}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          label="Prize"
                          name="prize"
                          initialValue={states.prize}
                        >
                          <Select
                            value={states.prize}
                            onChange={(e) => {
                              handleChangeSelect(e, "prize");
                            }}
                            options={states.master.prize}
                            placeholder="Choose an option"
                            className={"select"}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Status"
                          name="status"
                          initialValue={states.status}
                        >
                          <Select
                            value={states.status}
                            onChange={(e) => {
                              handleChangeSelect(e, "status");
                            }}
                            options={optionsStatusWinner}
                            placeholder="Choose an option"
                            className={"select"}
                          />
                        </Form.Item>
                      </Col>
                      {/* <Col span={12}>
                        <Form.Item label="Have Attachments" name="isHaveAtt" initialValue={states.isHaveAtt}>
                            <Select
                                value={states.isHaveAtt}
                                onChange={(e) => {
                                    handleChangeSelect(e,"isHaveAtt")
                                }}
                                options={[
                                    {key: 1, name: 'isHaveAtt', value: '1', label: 'Yes'},
                                    {key: 2, name: 'isHaveAtt', value: '2', label: 'No'},
                                ]}
                                placeholder="Choose an option"
                                className={"select"}
                            />
                        </Form.Item>
                    </Col> */}
                      <Col span={12}>
                        <Form.Item
                          label="Approval"
                          name="isApproved"
                          initialValue={states.isApproved}
                        >
                          <Select
                            value={states.isApproved}
                            onChange={(e) => {
                              handleChangeSelect(e, "isApproved");
                            }}
                            options={optionsApproveWinner}
                            placeholder="Choose an option"
                            className={"select"}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </>
            ) : null}
          </Form>
        </Col>
      </Row>

      <Row justify="center">
        <Col>
          <Space>
            <Button
              style={{ width: "230px" }}
              className={"button"}
              shape="round"
              onClick={handleSubmit}
            >
              Apply
            </Button>
            <Button
              style={{ width: "230px" }}
              className={"button-c"}
              shape="round"
              onClick={handleReset}
            >
              Reset
            </Button>
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};

Filter.displayName = "EntstatModal";
export default React.memo(Filter);
