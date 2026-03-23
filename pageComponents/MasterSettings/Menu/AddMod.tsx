import React, { useReducer, useEffect } from "react";

import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Input from "antd/lib/input";
import Row from "antd/lib/row";
import Select from "antd/lib/select";
import Space from "antd/lib/space";

import { modalState } from "../../../interfaces/menu.interface";

let initialState = {
  data: [],
  isLoading: true,
  oldId: "",
  master: {
    role: [],
  },
  form: {
    description: "",
    path: "",
    status: undefined,
    id: undefined,
  },
};

const Modals = (props: any) => {
  const [states, setStates] = useReducer(
    (state: modalState, newState: Partial<modalState>) => ({
      ...state,
      ...newState,
    }),
    initialState
  );

  const close = () => {
    props.handleOpenModal({ name: "openModal", value: false });
    setStates(initialState);
  };

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value } = e.currentTarget;
    setStates({
      form: {
        ...states.form,
        [name]: value,
      },
    });
  };

  const handleChangeSelect = (value: string, option: any) => {
    const name = option.name;
    setStates({
      form: {
        ...states.form,
        [name]: value,
      },
    });
  };

  const submit = () => {
    const { form, oldId } = states;
    props.submit({ ...form, id: oldId });
    setStates(initialState);
  };

  let optionStatus = [
    { key: "1", name: "status", value: "1", label: "Enable" },
    { key: "0", name: "status", value: "0", label: "Disable" },
  ];

  useEffect(() => {
    const { data, master } = props;

    setStates({
      master,
    });

    if (data && Object.keys(data).length != 0) {
      setStates({
        oldId: data.menu,
        form: {
          ...states.form,
          ...data,
          description: data.menu,
          header: data.menu_header,
          status:
            data.status == 1
              ? "Enable"
              : data.status == 2
              ? "Disable"
              : undefined,
        },
      });
    }
  }, [props.data]);

  return (
    <Modal
      destroyOnClose
      title={props.header}
      className={"modal"}
      onCancel={close}
      centered
      footer={
        <Row justify={"center"}>
          <Col>
            <Space size={0}>
              <Button
                shape="round"
                onClick={submit}
                style={{ marginRight: "7px" }}
                className="button"
              >
                Submit
              </Button>
              <Button
                shape="round"
                className="button-c"
                onClick={close}
                style={{ marginLeft: "7px" }}
              >
                Cancel
              </Button>
            </Space>
          </Col>
        </Row>
      }
      visible={props.open}
    >
      <Form className={"form"} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Menu Description">
              <Input
                name="description"
                value={states.form.description}
                onChange={handleChange}
                placeholder="Role Description"
                className={"input"}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Path">
              <Input
                name="path"
                value={states.form.path}
                onChange={handleChange}
                placeholder="Path"
                className={"input"}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Status"
              name="status"
              initialValue={states.form.status}
            >
              <Select
                value={states.form.status}
                onChange={handleChangeSelect}
                options={optionStatus}
                className={"select"}
                placeholder="Choose an option"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

// export default Modals;
export default React.memo(Modals);
