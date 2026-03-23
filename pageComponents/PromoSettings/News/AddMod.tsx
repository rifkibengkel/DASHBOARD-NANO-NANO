import React, { useRef, useReducer, useEffect } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Input from "antd/lib/input";
// import Switch from "antd/lib/switch"
import Space from "antd/lib/space";
// import Select from "antd/lib/select"
import Upload from "antd/lib/upload";
import dynamic from "next/dynamic";
// import Compressor from 'compressorjs';

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface IState {
  id: string;
  dtTitle: string;
  dtContent: string;
  dtPicture: string;
  dtFile: any;
  isLoading: boolean;
}

let initialState = {
  id: "",
  dtTitle: "",
  dtContent: "",
  dtPicture: "",
  dtFile: null,
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
    let datas = {
      id: !states.id ? 0 : data.id,
      title: data.title,
      content: data.content,
      file: states.dtFile === null ? null : states.dtFile,
    };
    props.handleAdd(datas);
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

  const handleChangeSelect = (e: any, name: any) => {
    setStates({ [name]: e });
  };

  const handleChangeMD = (e: any, name: any) => {
    setStates({
      [name]: e,
    });
  };

  // const switchActive = (checked: any) => {
  //   setStates({
  //     dtStatus: checked
  //   })
  // }

  useEffect(() => {
    if (prevProps.current.data !== props.data || props.data !== undefined) {
      let data = props.data;
      setStates({
        id: data.id,
        dtTitle: data.dtTitle,
        dtContent: data.dtContent,
        dtPicture: data.dtPicture,
        isLoading: false,
      });
    }
  }, [props.data]);

  // let optionsStatus = [
  //   { key: "1", name: "dtStatus", value: "0", label: "Inactive" },
  //   { key: "2", name: "dtStatus", value: "1", label: "Active" },
  //   ];

  // let optionsType = [
  //   { key: "1", name: "dtType", value: 1, label: "Konsumen" },
  //   { key: "2", name: "dtType", value: 2, label: "Toko" },
  // ];

  // let optionsCat = [
  //   { key: "1", name: "dtCategory", value: 1, label: "Redeem" },
  //   { key: "2", name: "dtCategory", value: 2, label: "Tukar Point" },
  // ];

  const imgProp = {
    onRemove: (e: any) => {
      setStates({
        // data: [],
        dtPicture: "",
        dtFile: null,
      });
    },
    beforeUpload: (file: any) => {
      setStates({
        dtFile: file,
      });
      // new Compressor(file, {
      //   quality: 0.8,
      //   success: (res) => {
      //     setStates({
      //     dtFile: res
      //     });
      //   }
      // })
      return false;
    },
  };

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
                title: states.dtTitle,
                content: states.dtContent,
                picture: states.dtPicture,
              })
            }
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
          <Form layout="vertical">
            <Row>
              <Col span={24}>
                <Form.Item label="Title">
                  <Input
                    name="dtTitle"
                    value={states.dtTitle}
                    onChange={handleChangeInput}
                    placeholder="Ini Judul"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Content">
                  {/* <Input.TextArea
                      rows={4}
                      name="dtContent"
                      value={states.dtContent}
                      onChange={handleChangeInput}
                      placeholder="Ini Konten"
                    /> */}
                  <MDEditor
                    height={400}
                    value={states.dtContent}
                    onChange={(e) => handleChangeMD(e, "dtContent")}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Image URL">
                  {/* <Input
                      name="dtPicture"
                      value={states.dtPicture}
                      onChange={handleChangeInput}
                      placeholder="https://sdasdasdd.com/"
                    /> */}
                  <Upload {...imgProp}>
                    <Button>Click to Upload</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            {/* <Row>
                <Col span={24}>
                  <Form.Item label="Sort">
                    <Input
                      name="dtSort"
                      value={states.dtSort}
                      type={"number"}
                      onChange={handleChangeInput}
                      placeholder="1"
                    />
                  </Form.Item>
                </Col>
              </Row> */}
            {/* <Row>
                <Col span={24}>
                  <Form.Item label="Category">
                    <Select
                      value={states.dtCategory}
                      onChange={(e) => handleChangeSelect(e, 'dtCategory')}
                      options={optionsCat}
                      placeholder="Choose an option"
                    />
                  </Form.Item>
                </Col>
              </Row> */}
            {/* <Row>
                <Col span={24}>
                  <Form.Item label="Select Status">
                      <Select
                        // name="status"
                        value={states.dtStatus}
                        onChange={(e) => handleChangeSelect(e, 'status')}
                        options={optionsStatus}
                        placeholder="Choose an option"
                      />
                    </Form.Item>
                </Col>
              </Row> */}
            {/* <Row>
                <Col span={24}>
                  <Form.Item label="Status">
                    <Switch
                      onChange={switchActive}
                      checked={states.dtStatus}
                    />
                  </Form.Item>
                </Col>
              </Row> */}
          </Form>
        </Col>
      </Row>
    </Modal>
  );
});

ModalParam.displayName = "PSModal";
export default ModalParam;
