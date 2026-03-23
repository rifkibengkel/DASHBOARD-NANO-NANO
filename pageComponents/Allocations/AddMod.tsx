import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import DatePicker from "antd/lib/date-picker";
import { memo, useEffect, useReducer, useRef } from "react";
import { Select, Space } from "antd";
import dayjs from "dayjs";

interface MdlState {
  id: string | number;
  pickedDate: string;
  prizeName: string;
  quantity: number;
  region: string;
  data: string[];
  isLoading: boolean;
  przType: number;
  master: {
    prizes: any;
    region: any;
  };
}

let initialState = {
  id: "",
  pickedDate: "",
  prizeName: "",
  quantity: 0,
  region: "",
  data: [],
  isLoading: true,
  przType: 0,
  master: {
    prizes: [],
    region: [],
  },
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

const Modals = memo((props: any) => {
  const prevProps = useRef(props);
  const [states, setStates] = useReducer(
    (state: MdlState, newState: Partial<MdlState>) => ({
      ...state,
      ...newState,
    }),
    initialState
  );

  const handleChange = (name: any, value: any) => {
    setStates({
      [name]: value,
    });

    if (name === "prizeName") {
      let type = states.master.prizes
        .filter((x: any) => x.value === value)
        .map((x: any) => x.type);
      setStates({
        przType: type[0],
      });
    }
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

  const handleChangeSelect = (e: any, name: any) => {
    setStates({ [name]: e });
  };

  const handleChangeNumber = (e: any) => {
    setStates({
      [e.target.name]: Number(e.target.value.replace(/[^0-9.]+/g, "")),
    });
  };

  const handleSubmit = async (data: any) => {
    (await states.id) !== ""
      ? props.editAllocation(data)
      : props.addNewAllocation(data);
    setStates(initialState);
  };

  const close = () => {
    props.handleOpenModal({ name: "openModal", value: false });
    setStates({
      quantity: 0,
      prizeName: "",
      id: "",
    });
  };

  useEffect(() => {
    const { master } = props;
    if (master) {
      setStates({
        master,
      });
    }
  }, [props.master]);

  useEffect(() => {
    if (prevProps.current.data !== props.data || props.data.length > 0) {
      let datuy = props.data;
      setStates({
        id: datuy.id || "",
        isLoading: false,
      });
    }
  }, [props.data]);

  return (
    <Modal
      destroyOnClose
      title={props.header}
      centered
      className={"modal"}
      open={props.open}
      onCancel={close}
      footer={
        <Space size={0}>
          <Row gutter={10}>
            <Col span={12}>
              <Button
                style={{ width: "230px" }}
                className={"button"}
                shape="round"
                onClick={() =>
                  handleSubmit({
                    dateTarget: states.pickedDate,
                    region: states.region,
                    prizeId: states.prizeName,
                    quantity: states.quantity,
                    przType: states.przType,
                  })
                }
              >
                Save
              </Button>
            </Col>
            <Col span={12}>
              <Button
                style={{ width: "230px" }}
                className={"button-c"}
                shape="round"
                onClick={close}
                // style={{ backgroundColor: "#252733", borderBottomRightRadius: 8 }}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </Space>
      }
    >
      <Row>
        <Col span={24}>
          <Form layout="vertical">
            <Row>
              <Col span={24}>
                <Form.Item label="Picked Date">
                  <DatePicker
                    showToday={false}
                    allowClear={false}
                    disabledTime={disabledDateTime}
                    format="DD-MM-YYYY"
                    style={{ width: "100%" }}
                    onChange={(date) =>
                      handleChangeDate({
                        name: "pickedDate",
                        value: date,
                      })
                    }
                    defaultValue={
                      states.pickedDate === ""
                        ? undefined
                        : dayjs(states.pickedDate)
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* <Row>
              <Col span={24}>
                <Form.Item label="Store">
                  <Select
                    // name="prizeName"
                    options={states.master.stores}
                    filterOption={(input, option) =>
                      option?.props.label
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    showSearch
                    value={states.storeName}
                    onChange={(e, { value, text }: any) =>
                      handleChange("storeName", value)
                    }
                    placeholder="John Doe"
                  />
                </Form.Item>
              </Col>
            </Row> */}
            <Row>
              <Col span={24}>
                <Form.Item label="Prize">
                  <Select
                    // name="prizeName"
                    options={states.master.prizes}
                    value={states.prizeName}
                    onChange={(e, { value, text }: any) =>
                      handleChange("prizeName", value)
                    }
                    placeholder="John Doe"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Quantity">
                  <Input
                    name="quantity"
                    value={states.quantity}
                    onChange={handleChangeNumber}
                    placeholder="200"
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* <Row>
            <Col span={24}>
                    <Form.Item label="Select Region">
                      <Select
                        disabled={states.przType === 3 ? false : true}
                        // name="status"
                        value={states.region}
                        onChange={(e) => handleChangeSelect(e, 'region')}
                        options={states.master.region}
                        placeholder="Choose an option"
                      />
                    </Form.Item>
                  </Col>
            </Row> */}
          </Form>
        </Col>
      </Row>
      {/* <Row justify="center">
                <Col>
                    <Button onClick={close}>Cancel</Button>
                </Col>
                <Col>
                    <Button onClick={() => handleSubmit({
                        id: states.id,
                        fullname: states.fullname,
                        sender: states.sender,
                        id_number: states.id_number
                    })}>Save</Button>
                </Col>
            </Row> */}
    </Modal>
  );
});

Modals.displayName = "AllocationsModal";
export default Modals;
