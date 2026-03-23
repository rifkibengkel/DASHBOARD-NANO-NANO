import React, { useReducer, useRef, useEffect } from "react";
import Modal from "antd/lib/modal";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import Button from "antd/lib/button";
import { Form, Input, Select, Space } from "antd";
import DatePicker from "antd/lib/date-picker";
import dayjs from "dayjs";
// import Table from "antd/lib/table";

interface IState {
  dateTgt: string,
  loading: boolean
}

let initialState = {
  dateTgt: '',
  loading: false
};

const range = (start: any, end: any) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

export const disabledDateTime = () => {
  return {
    disabledHours: () => range(0, 24).splice(4, 20),
    disabledMinutes: () => range(30, 60),
    disabledSeconds: () => [55, 56],
  };
}

const Revereter = React.memo((props: any) => {
  const [formData] = Form.useForm()
  const prevProps = useRef(props)
  const [states, setStates] = useReducer((state: IState, newState: Partial<IState>) => ({ ...state, ...newState }), initialState)

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
  }

  const handleSubmit = () => {
    setStates({ loading: true })
    const dateTgt = formData.getFieldValue("dateTgt");
    let datas = {
      id: props.data.winnerId,
      dateTgt: dayjs(dateTgt).format("YYYY-MM-DD")
    }
    props.onSubmit(datas)
  }

  const close = () => {
    props.handleOpenModal({ name: "openRevert", value: false });
    setStates({ loading: false })
    formData.resetFields();
  };

  return (
    <Modal
      destroyOnClose
      title="Select Allocation Date Target"
      centered
      open={props.open}
      onCancel={close}
      className={"modal"}
      footer={
        <Space size={0}>
          <Button
            loading={states.loading}
            onClick={formData.submit}
            style={{ borderBottomLeftRadius: 8 }}
          >
            Submit
          </Button>
          <Button
            onClick={close}
            style={{ backgroundColor: "#252733", borderBottomRightRadius: 8 }}
          >
            Cancel
          </Button>
        </Space>
      }
    >
      <Form className={"form"} layout="vertical" form={formData} onFinish={handleSubmit}>
        <Row>
          <Col span={24}>
            <Form.Item label="Allocation Target" name="dateTgt" initialValue={states.dateTgt === "" ? undefined : dayjs(states.dateTgt)}>
              <DatePicker
                // showToday={false}
                className={"input"}
                allowClear={false}
                disabledTime={disabledDateTime}
                disabledDate={(current) => {
                  let customDate = dayjs().add(1, 'day').format("YYYY-MM-DD");
                  return current && current < dayjs(customDate, "YYYY-MM-DD");
                }} 
                format="DD-MM-YYYY"
                style={{ width: "100%" }}
                name="dateTgt"
                // onChange={(date) =>
                //   handleChangeDate({
                //     name: "dateTgt",
                //     value: date,
                //   })
                // }
                // defaultValue={states.dateTgt === "" ? undefined : dayjs(states.dateTgt)}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
})

Revereter.displayName = "RevertoModal"
export default React.memo(Revereter)
