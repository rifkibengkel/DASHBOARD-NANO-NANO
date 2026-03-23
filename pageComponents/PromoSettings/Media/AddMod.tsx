import React, { useRef, useReducer, useEffect } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Input from "antd/lib/input";
import Switch from "antd/lib/switch";
import Space from "antd/lib/space";

interface IState {
  mediaName: string;
  mediaCode: string;
  mediaActive: boolean;
  id: string;
  isLoading: boolean;
}

let initialState = {
  mediaName: "",
  mediaCode: "",
  mediaActive: true,
  id: "",
  isLoading: false,
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

  const handleSubmit = async (data: any) => {
    // console.log(data)
    (await states.id) ? props.handleEdit(data) : props.handleAdd(data);
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
      mediaActive: checked,
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
        id: data.idMedia,
        mediaName: data.mediaName,
        mediaCode: data.mediaCode,
        mediaActive: data.mediaActive === 1 ? true : false,
        isLoading: false,
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
            onClick={() =>
              handleSubmit({
                id: states.id,
                name: states.mediaName,
                code: states.mediaCode,
                sort: states.mediaCode ? states.mediaCode.toString()[0] : "",
                is_active: states.mediaActive === true ? 1 : 0,
              })
            }
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
          <Form layout="vertical">
            <Row>
              <Col span={24}>
                <Form.Item label="Media Name">
                  <Input
                    name="mediaName"
                    value={states.mediaName}
                    onChange={handleChangeInput}
                    placeholder="The Onion Router"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Media Code">
                  <Input
                    name="mediaCode"
                    value={states.mediaCode}
                    onChange={handleChangeInput}
                    placeholder="404"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Active">
                  <Switch
                    onChange={switchActive}
                    checked={states.mediaActive}
                    disabled={states.id !== "" ? false : true}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
});

ModalParam.displayName = "MediaModal";
export default ModalParam;
