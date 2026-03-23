import React, { useRef, useReducer, useEffect } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Input from "antd/lib/input";
import Switch from "antd/lib/switch";
import Space from "antd/lib/space";
import { showConfirm } from "@/components/modals/ModalAlert";

interface IState {
  gpName: string;
  gpDescription: string;
  gpParam: string;
  gpStatus: boolean;
  id: string;
  isLoading: boolean;
}

let initialState = {
  gpName: "",
  gpDescription: "",
  gpParam: "",
  gpStatus: true,
  id: "",
  isLoading: false,
};

const ModalParam = React.memo((props: any) => {
  const [formModal] = Form.useForm();
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

  const handleSubmit = async (data: any) => {
    props.handleAdd(data);
    setStates(initialState);
  };

  const handleSubmitUpdate = async (data: any) => {
    props.handleEdit({
      id: data.id,
      name: data.gpName,
      description: data.gpDescription,
      parameter: data.gpParam,
      status: data.gpStatus,
      userId: data.userId,
    });
    setStates(initialState);
  };

  const close = () => {
    props.handleOpenModal({
      name: "openModal",
      type: "modalClose",
      value: false,
    });
    setStates(initialState);
  };

  const switchActive = (checked: any) => {
    setStates({
      gpStatus: checked,
    });
  };

  //   componentDidUpdate(prevProps, prevState)
  //   {
  //     if (this.props.data !== undefined)
  //     {
  //       if (prevProps.data !== this.props.data)
  //       {
  //         let data = this.props.data;
  //         this.setState({
  //           id: data.id,
  //           gpDescription: data.gpDescription,
  //           gpParam: data.gpParam,
  //           gpStatus: data.gpStatus === 1 ? true : false
  //         })
  //       }
  //     }
  //   }

  useEffect(() => {
    if (prevProps.current.data !== props.data || props.data !== undefined) {
      let data = props.data;
      setStates({
        id: data.id,
        gpName: data.gpName,
        gpDescription: data.gpDescription,
        gpParam: data.gpParam,
        gpStatus: data.gpStatus === 1 ? true : false,
        isLoading: false,
      });
      formModal.setFieldsValue({
        id: data.id,
        gpName: data.gpName,
        gpDescription: data.gpDescription,
        gpParam: data.gpParam,
        gpStatus: data.gpStatus === 1 ? true : false,
      });
    }
  }, [props.data]);

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
            onClick={() => showConfirm({ onOk: () => formModal.submit() })}
          >
            Save
          </Button>
          <Button
            style={{ width: "230px" }}
            className={"button-c"}
            shape="round"
            onClick={close}
          >
            Cancel
          </Button>
        </Space>
      }
    >
      <Row>
        <Col span={24}>
          <Form
            layout="vertical"
            form={formModal}
            onFinish={states.id ? handleSubmitUpdate : handleSubmit}
          >
            <Form.Item hidden name="id" label="id">
              <Input name="id" placeholder="id" />
            </Form.Item>
            <Row>
              <Col span={24}>
                <Form.Item name="gpName" label="Name">
                  <Input name="gpName" placeholder="thisIsName" />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item name="gpDescription" label="Description">
                  <Input name="gpDescription" placeholder="thisIsDescription" />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item name="gpParam" label="Parameter">
                  <Input name="gpParam" placeholder="blablaGO" />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  name="gpStatus"
                  valuePropName="checked"
                  label="Status"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
});

ModalParam.displayName = "GPModal";
export default ModalParam;
