import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import { memo, useEffect, useReducer, useRef } from "react";
import { Space } from "antd";

interface MdlState {
  id: string | number;
  fullname: string;
  sender: string;
  id_number: string;
  data: string[];
  isLoading: boolean;
}

let initialState = {
  id: "",
  fullname: "",
  sender: "",
  id_number: "",
  data: [],
  isLoading: true,
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

  const handleChange = (e: any) => {
    setStates({
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (data: any) => {
    (await states.id) !== "" ? props.editList(data) : props.addNewList(data);
    setStates(initialState);
  };

  const close = () => {
    props.handleOpenModal({ name: "modalAny", value: false });
    setStates(initialState);
  };

  useEffect(() => {
    if (prevProps.current.data !== props.data || props.data.length > 0) {
      let datuy = props.data;
      setStates({
        id: datuy.id || "",
        fullname: datuy.fullname,
        sender: datuy.sender,
        id_number: datuy.id_number,
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
          <Row>
            <Col span={12}>
              <Button
                style={{ width: "230px" }}
                className={"button"}
                shape="round"
                onClick={() =>
                  handleSubmit({
                    id: states.id,
                    name: states.fullname,
                    sender: states.sender,
                    idNumber: states.id_number,
                  })
                }
              >
                Save
              </Button>
            </Col>
            <Col span={12}>
              <Button
                style={{ width: "240px" }}
                className={"button-c"}
                shape="round"
                onClick={close}
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
                <Form.Item label="Fullname">
                  <Input
                    name="fullname"
                    value={states.fullname}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Sender">
                  <Input
                    name="sender"
                    value={states.sender}
                    onChange={handleChange}
                    placeholder="123412345"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="ID Number">
                  <Input
                    name="id_number"
                    value={states.id_number}
                    onChange={handleChange}
                    placeholder="3275050505050"
                  />
                </Form.Item>
              </Col>
            </Row>
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

Modals.displayName = "BlacklistModal";
export default Modals;
