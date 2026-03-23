import React, { useRef, useReducer } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
// import Input from "antd/lib/input"
// import Switch from "antd/lib/switch"
import Space from "antd/lib/space"
// import Select from "antd/lib/select"
import Upload from "antd/lib/upload"
import { showConfirm } from "@/components/modals/ModalAlert";

interface IState {
  id: string
  dtUrl: string
  dtName: string
  dtStatus: boolean
  dtType: string
  dtSort: string
  dtFilename: string
  dtFile: any
  isLoading: boolean
}

let initialState = {
  id: "",
  dtUrl: "",
  dtName: "",
  dtStatus: false,
  dtType: "",
  dtSort: "",
  dtFilename: "",
  dtFile: null,
  isLoading: false
}

const ModalParam = React.memo((props: any) => {
  const prevProps = useRef(props)
  const [states, setStates] = useReducer((state: IState, newState: Partial<IState>) => ({ ...state, ...newState }), initialState)

  const handleChangeInput = (e: any) => {
    setStates({
      [e.target.name]: e.target.value,
    });
  };
 
  const handleSubmit = async (data: any) => {
    let datas = {
      file: states.dtFile === null ? null : states.dtFile
    }
    props.handleSubmit(datas);
    setStates(initialState);
  }

  const close = () => {
    props.handleOpenModal({ name: "openUpload", type: "modalUpload", value: false });
    setStates(initialState)
  };

  const flProp = {
    onRemove: (e: any) => {
      setStates({
        dtFilename: "",
        dtFile: null,
      });
    },
    beforeUpload: (file: any) => {
      setStates({
        dtFile: file
      });
      return false;
    },
  };

    return (
      <Modal
        destroyOnClose
        title={props.header}
        centered
        visible={props.open}
        onCancel={close}
        className="modal"
        footer={
          <Space size={0}>
                    <Button onClick={() => showConfirm({onOk: (handleSubmit)})}>
                        Import
                    </Button>
                    <Button onClick={close} style={{ backgroundColor: "#252733", borderBottomRightRadius: 8 }}>
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
                  <Form.Item label="File Upload (.xlsx, .xls, .csv)">
                    {/* <Input
                      name="dtPicture"
                      value={states.dtPicture}
                      onChange={handleChangeInput}
                      placeholder="https://sdasdasdd.com/"
                    /> */}
                    <Upload {...flProp}>
                      <Button>Click to Upload</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Modal>
    );
  })

  ModalParam.displayName = "PSModal"
  export default ModalParam
