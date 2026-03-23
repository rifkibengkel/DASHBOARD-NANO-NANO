import React, { useReducer, useRef, useEffect } from "react";
import Modal from "antd/lib/modal";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import Button from "antd/lib/button";
import { Form, Input, Select, Space } from "antd";
// import Table from "antd/lib/table";

interface IState {
  reason: any[],
  loading: boolean
}

let initialState = {
  reason: [],
  loading: false
};

const Attachments = React.memo((props: any) => {
  const [formData] = Form.useForm()
  const prevProps = useRef(props)
  const [states, setStates] = useReducer((state: IState, newState: Partial<IState>) => ({ ...state, ...newState }), initialState)

  // const handleChange = (e: any) => {
  //   setStates({reason: e.target.value});
  // };

  const handleChangeSelect = (e: any, { name, value }: any) => {
    setStates({ [name]: value });
  };

  const handleSubmit = async () => {
    setStates({loading: true})
    const reason = formData.getFieldValue("reject_reason");
    let datas = {
      id: props.data.winnerId,
      reason: reason
    }
    await props.onSubmit(datas)
  }

  const close = () => {
    setStates({loading: false})
    props.handleOpenModal({ name: "modalReject", value: false });
    formData.resetFields();
  };

  return (
    <Modal
      destroyOnClose
      title={props.title}
      centered
      open={props.open}
      onCancel={close}
      className={"modal"}
      footer={
        <Space size={0}>
          <Button
            loading={states.loading}
            onClick={formData.submit}
            style={{borderBottomLeftRadius: 8}}
          >
            Submit
          </Button>
          <Button
            onClick={close}
            style={{backgroundColor: "#252733", borderBottomRightRadius: 8}}
          >
            Cancel
          </Button>
        </Space>
      }
    >
      <Form className={"form"} layout="vertical" form={formData} onFinish={handleSubmit}>
        <Row>
          {
            props.isClient ?
              <>
                <Col span={24}>
                  <Form.Item
                    name="reject_reason"
                    rules={[
                      {
                        required: props.isClient ? true : false,
                        message: "This field is required!",
                      },
                    ]}
                  >
                    <Input.TextArea 
                      cols={4} 
                      rows={4} 
                      value={states.reason}
                      autoFocus
                    />
                  </Form.Item>
                </Col>
              </>
            : 
              <Col span={24}>
                <Form.Item
                    name="reject_reason"
                    rules={[
                      {
                        required: !props.isClient ? true : false,
                        message: "This field is required!",
                      },
                    ]}
                  >
                    <Select
                      style={{width: 450}}
                      onChange={handleChangeSelect}
                      value={states.reason}
                      options={props.reasons}
                      placeholder="Pick one"
                    />
                  </Form.Item>
              </Col>
          }
        </Row>
      </Form>
    </Modal>
    );
  })
  
  Attachments.displayName = "AddAttModal"
  export default React.memo(Attachments)
  