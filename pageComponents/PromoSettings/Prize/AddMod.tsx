import React, { useRef, useReducer, useEffect } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Input from "antd/lib/input";
import Switch from "antd/lib/switch";
import Space from "antd/lib/space";
import dayjs from "dayjs";
import TimePicker from "antd/lib/time-picker";

interface IState {
  prizeId: number;
  start_time: string;
  end_time: string;
  interval: string;
  limit: string;
  enabled: number;
  isLoading: boolean;
  purchase_min: string;
  purchase_max: string;
}

let initialState = {
  prizeId: 0,
  start_time: "",
  end_time: "",
  interval: "",
  limit: "",
  enabled: 0,
  isLoading: false,
  purchase_min: "",
  purchase_max: "",
};

const ModalParam = React.memo((props: any) => {
  const prevProps = useRef(props);
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    initialState
  );
  const handleChangeInput = (e: any) => {
    setStates({
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (data: any) => {
    let datas = {
      id: props.data.id,
      startTime: states.start_time ? states.start_time : props.data.start_time,
      endTime: states.end_time ? states.end_time : props.data.end_time,
      enabled: states.enabled,
      limit: states.limit ? states.limit : props.data.limit,
      interval: states.interval ? states.interval : props.data.interval,
      purchase_min: states.purchase_min
        ? states.purchase_min
        : props.data.purchase_min,
      purchase_max: states.purchase_max
        ? states.purchase_max
        : props.data.purchase_max,
    };
    props.modifyPrizeSetting(datas);
    close();
  };

  useEffect(() => {
    setStates({
      ...states,
      enabled: props.data.enabled,
    });
  }, [props.data]);

  const close = () => {
    props.handleOpenModal({
      name: "openModal",
      type: "modalClose",
      value: false,
    });
    setStates(initialState);
  };

  const handleChange = (data: any) => {
    if (data.name === "startTime" || data.name === "endTime") {
      setStates({ [data.name]: dayjs(data.value).format("HH:mm:ss") });
    } else {
      setStates({ [data.name]: data.value });
    }
  };

  const data =
    !props.data || typeof props.data !== "object"
      ? []
      : Object.keys(props.data).map((key) => [key, props.data[key]]);
  const formItem = data.map((i, index) =>
    i[0] === "enabled" ? (
      <Form.Item
        label="Status"
        key={index}
        hidden={i[0] === "id" || i[0] === "key" ? true : false}
      >
        <Switch
          defaultChecked={i[1] === 1 ? true : false}
          onChange={(value) =>
            handleChange({
              name: i[0],
              value: value ? 1 : 0,
            })
          }
        />
      </Form.Item>
    ) : i[0] === "start_time" || i[0] === "end_time" ? (
      <Form.Item
        label={i[0].toUpperCase()}
        key={index}
        hidden={i[0] === "id" || i[0] === "key" ? true : false}
      >
        <TimePicker
          format="HH:mm:ss"
          style={{ width: "100%" }}
          onChange={(value) =>
            handleChange({
              name: i[0],
              value: value,
            })
          }
          placeholder={i[1]}
        />
      </Form.Item>
    ) : (
      <Form.Item
        label={i[0].toUpperCase()}
        key={index}
        hidden={i[0] === "id" || i[0] === "key" ? true : false}
      >
        <Input
          type={
            typeof i[1] === "number"
              ? "number"
              : i[0] === "start_time" || i[0] === "end_time"
              ? "time"
              : "text"
          }
          disabled={i[0] === "name" ? true : false}
          defaultValue={i[1]}
          style={{ width: "100%" }}
          onChange={(value) =>
            handleChange({
              name: i[0],
              value: value.target.value,
            })
          }
        />
      </Form.Item>
    )
  );

  return (
    <Modal
      destroyOnClose
      title={props.header}
      centered
      open={props.open}
      onCancel={close}
      className="modal"
      footer={
        <Space size={0}>
          <Button
            style={{ width: "230px" }}
            className={"button"}
            shape="round"
            onClick={handleSubmit}
          >
            Save
          </Button>
          <Button
            onClick={close}
            style={{ width: "230px" }}
            className={"button-c"}
            shape="round"
          >
            Cancel
          </Button>
        </Space>
      }
    >
      <Row>
        <Col span={24}>
          <Form layout="vertical">{formItem}</Form>
        </Col>
      </Row>
    </Modal>
  );
});

ModalParam.displayName = "PrizeTable";
export default ModalParam;
