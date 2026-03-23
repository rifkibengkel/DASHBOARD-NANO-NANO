import React, { useRef, useReducer, useEffect } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Input from "antd/lib/input";
import Select from "antd/lib/select";
import Space from "antd/lib/space";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface IState {
  title: string;
  content: string;
  type: string;
  id: string;
  isLoading: boolean;
}

let initialState = {
  title: "",
  content: "",
  type: "",
  id: "",
  isLoading: false,
};

const ModalFAQ = React.memo((props: any) => {
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

  const handleChangeMD = (e: any, name: any) => {
    setStates({
      [name]: e,
    });
  };

  const handleChangeSelect = (e: any, name: any) => {
    setStates({ [name]: e });
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

  // const switchActive = (checked: any) => {
  //   setStates({
  //     gpStatus: checked
  //   })
  // }

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
        title: data.title,
        content: data.content,
        type: data.type,
        isLoading: false,
      });
    }
  }, [props.data]);

  let optionsType = [
    { key: "1", name: "type", value: 1, label: "Konsumen" },
    { key: "2", name: "type", value: 2, label: "Toko" },
    // { key: "4", name: "status", value: "2", label: "Unprocessed" }
  ];
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
                title: Buffer.from(states.title).toString("base64"),
                content: Buffer.from(states.content).toString("base64"),
                type: states.type,
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
                <Form.Item label="Title">
                  <Input
                    name="title"
                    value={states.title}
                    onChange={handleChangeInput}
                    placeholder="thisIsTitle"
                  />
                  {/* <MDEditor height={100} value={states.title} onChange={(e) => handleChangeMD(e, 'title')} /> */}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Content">
                  {/* <Input.TextArea
                      rows={20}
                      name="content"
                      value={states.content}
                      onChange={handleChangeInput}
                      placeholder="blablaGO"
                    /> */}
                  <MDEditor
                    height={400}
                    value={states.content}
                    onChange={(e) => handleChangeMD(e, "content")}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Type">
                  <Select
                    // name="status"
                    value={states.type}
                    onChange={(e) => handleChangeSelect(e, "type")}
                    options={optionsType}
                    placeholder="Choose an option"
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

ModalFAQ.displayName = "FAQModal";
export default ModalFAQ;
