import React, { useReducer, useRef, useEffect } from "react";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import Button from "antd/lib/button";
import Select from "antd/lib/select";
import { Space } from "antd";

interface IState {
  periode: string;
  master: {
    periodes: any[]
  }
  // media: string;
  // status: string;
  // is_approved: string;
  // arrMedia: string[]
}

let initialState = {
  periode: "",
  master: {
    periodes: []
  }
  // media: '',
  // status: '',
  // is_approved: '',
  // arrMedia: []
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

const Modals = React.memo((props: any) => {
  const prevProps = useRef(props)
  const [states, setStates] = useReducer((state: IState , newState: Partial<IState>) => ({ ...state, ...newState }), initialState)

  const handleSubmit = (data: any) => {
    if(states.periode === "") {
      alert("Fill target dates.")
    } else {
    let datas = {
      periode: states.periode
    };
    props.handleFilter(datas);
  }
  }

  const handleChangeSelect = (e: any, name: any) => {
    setStates({ [name]: e });
  };

  const close = () => {
    props.handleOpenModal({ name: "modalFilter", value: false });
  };

  const handleReset = () => {
    let datas = {
      startDate: "",
      endDate: "",
    };
    props.handleFilter(datas);
    setStates(initialState);
  }

  useEffect(() => {
    const {master} = props
    setStates({
        master
    })
}, [props.master])
  
  return (
    <Modal
      destroyOnClose
      title="Select Periode"
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
            <Col span={24}>
                        <Form.Item label="Periode" name="periode" initialValue={states.periode}>
                            <Select
                                value={states.periode}
                                onChange={(e) => {
                                    handleChangeSelect(e, "periode")
                                }}
                                options={states.master.periodes}
                                placeholder="Choose an option"
                                className={"select"}
                            />
                        </Form.Item>
                    </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      <Row justify="center">
        <Col>
          <Space>
            <Button 
              className={'button'}
                shape="round" onClick={handleSubmit}>
                  Apply
            </Button>
            <Button 
              className={'button'}
                shape="round" onClick={handleReset}>
                  Reset
            </Button>
          </Space>
        </Col>
      </Row>
    </Modal>
  );
})

Modals.displayName = "EntstatModal"
export default Modals
