import React, { useEffect, useReducer } from "react";
import { Modal, Button, Row, Form, Select, Input, Col, Space } from "antd";
import { showConfirm } from "../../components/modals/ModalAlert";

interface RejectNow {
  dataReject: []
  pickedRej: number | string
  key: string
}

let initState = {
  pickedRej: '',
  key: ''
 } as RejectNow

const QuickyReject = (props: any) => {
  const [states, setStates] = useReducer((state: RejectNow, newState: Partial<RejectNow>) => ({ ...state, ...newState }), props);
    
  const handleSubmit = () => {
    let { pickedRej } = states
    if (pickedRej === "") {
      alert("Please Fill All Field");
    } else {
      props.onSubmit(pickedRej);
      close();
    }
  };

  const handleChangeSelect = (name: any, value: any) => {
    setStates({
      [name]: value
    })
  };

  const close = () => {
    props.handleOpenModal({ name: "modalReject", value: false });
    setStates(initState);
  };

  useEffect(() => {
    const { dataReject } = props
    if (dataReject) {
        setStates({
            dataReject
        })
    }
}, [props.dataReject])

    return (
      <Modal
            destroyOnClose
            title={props.header}
            className={"modal"}
            onCancel={close}
            centered
            footer={
                <Space size={0}>

                    <Button
                        onClick={() => showConfirm({ onOk: (() => handleSubmit() )})}
                        style={{ borderBottomLeftRadius: 8 }}

                    >
                        Submit
                    </Button>
                    <Button
                        onClick={close}
                        style={{ backgroundColor: "#252733", borderBottomRightRadius: 8 }}

                    >Cancel</Button>
                </Space>
            }
            open={props.open}
        >
            <Form className={"form"} layout="vertical">
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Select Invalid Reason">
                            <Select
                                tabIndex={1}
                                className={"select"}
                                filterOption={(input, option: any) =>
                                    option?.props.label
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                id="rejRef"
                                value={states.pickedRej}
                                placeholder="- Select -"
                                options={states.dataReject}
                                showSearch
                                onChange={(e, { value, text }: any) =>
                                  handleChangeSelect("pickedRej", value)
                                }
                                onKeyDown={(event) => {
                                    // if (event.which === 8) {
                                    //     this.setState({
                                    //         variant: "",
                                    //     });
                                    // } else if (event.keyCode === 9) {
                                    //     event.preventDefault();
                                    //     this.handleChangeFocus("categoryRef");
                                    // } else if (event.key === "Enter") {
                                    //     event.preventDefault();
                                    // }
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
  }

export default React.memo(QuickyReject);
