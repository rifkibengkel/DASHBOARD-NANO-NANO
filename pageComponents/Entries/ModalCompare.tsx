import React, { useEffect, useReducer } from "react";
import {
  Modal,
  Button,
  Row,
  Form,
  Col,
  Space,
  Card,
  Image,
  Carousel,
} from "antd";

let initialState = {
  header: "",
  duplicateStruct: [],
  storeGenuineStruct: [],
  type: "",
  url: [],
  open: false,
};

const ModalCompare = (props: any) => {
  const [states, setStates] = useReducer(
    (state: any, newState: Partial<any>) => ({ ...state, ...newState }),
    initialState
  );

  const handleChangeFocus = (event: any) => {
    if (event === "categoryRef") {
      document.getElementById("categoryProductRef")?.focus();
    } else if (event === "categoryProductRef") {
      document.getElementById("qtyRef")?.focus();
    } else if (event === "qtyRef") {
      document.getElementById("priceRef")?.focus();
    } else if (event === "priceRef") {
      document.getElementById("totalRef")?.focus();
    } else if (event === "totalRef") {
      document.getElementById("submitRef")?.focus();
    } else if (event === "submitRef") {
      document.getElementById("cancelRef")?.focus();
    } else if (event === "cancelRef") {
      document.getElementById("categoryRef")?.focus();
    }
  };

  useEffect(() => {
    if (props.open) {
      document.getElementById("cancelRef")?.focus();
    }
  }, [props.open]);

  useEffect(() => {
    if (props) {
      setStates({
        header: props.header,
        duplicateStruct: props.duplicateStruct,
        storeGenuineStruct: props.storeGenuineStruct,
        type: props.type,
        url: props.url,
        open: props.open,
      });
    }
  }, [props]);

  const handleNotDuplicate = () => {
    props.handleCheckBox("e", { name: "isValid", value: true });
    close();
  };

  const close = () => {
    props.handleOpenModal({ name: "modalCompare", value: false });
  };

  const onChange = (currentSlide: number) => {
    console.log(currentSlide);
  };

  return (
    <Modal
      destroyOnClose={props.type != "compareStruct" ? true : false}
      title={props.header}
      className={"modal"}
      onCancel={props.type != "compareStruct" ? undefined : close}
      centered
      closable={props.type != "compareStruct" ? false : true}
      footer={
        <Space size={0}>
          {props.type != "compareStruct" ? (
            <>
              <Button
                onClick={handleNotDuplicate}
                // style={{ width: "95%" }}
                className={"button-c"}
                shape="round"
                id={"submitRef"}
                onKeyDown={(event) => {
                  if (event.key === "Tab") {
                    event.preventDefault();
                    handleChangeFocus("submitRef");
                  }
                }}
              >
                Not Duplicate
              </Button>
              <Button
                // style={{ width: "95%" }}
                className={"button-c"}
                shape="round"
                onClick={close}
                id={"cancelRef"}
                onKeyDown={(event) => {
                  if (event.key === "Tab") {
                    event.preventDefault();
                    handleChangeFocus("cancelRef");
                  }
                }}
              >
                Duplicate
              </Button>
            </>
          ) : (
            <Button
              className={"button-c"}
              shape="round"
              onClick={close}
              id={"cancelRef"}
              onKeyDown={(event) => {
                if (event.key === "Tab") {
                  event.preventDefault();
                  handleChangeFocus("cancelRef");
                }
              }}
            >
              Close
            </Button>
          )}
        </Space>
      }
      open={props.open}
    >
      <Form className={"form"} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Card
              className={"card-profile"}
              title={
                props.type == "compareStruct"
                  ? "Genuine Store Struct"
                  : "Struct Photo"
              }
            >
              <Carousel afterChange={onChange}>
                {states.type == "compareStruct"
                  ? states.storeGenuineStruct.map((item: any, idx: number) => (
                      <Image key={"genui" + idx} src={item.url} sizes="50" />
                    ))
                  : states.url.map((item: any, idx: number) => (
                      <Image key={"url" + idx} src={item.src} sizes="50" />
                    ))}
              </Carousel>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              className={"card-profile"}
              title={
                props.type == "compareStruct"
                  ? "Consumen Struct Photo"
                  : "Indicate Duplicate Struct Photo"
              }
            >
              <Carousel afterChange={onChange}>
                {states.type == "compareStruct"
                  ? states.url.map((item: any, idx: number) => (
                      <Image key={"ur" + idx} src={item.url} sizes="50" />
                    ))
                  : states.duplicateStruct.map((item: any, idx: number) => (
                      <Image key={"dup" + idx} src={item.url} sizes="50" />
                    ))}
              </Carousel>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default React.memo(ModalCompare);
