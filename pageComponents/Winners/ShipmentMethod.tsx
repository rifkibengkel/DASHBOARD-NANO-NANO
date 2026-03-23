import React, { useReducer, useRef, useEffect, useState } from "react";
import Modal from "antd/lib/modal";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import Button from "antd/lib/button";
import { Select, Space } from "antd";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import { showConfirm } from "@/components/modals/ModalAlert";
import axios from "axios";

interface IState {
  districts: any[];
  shipping: number;
}

let initialState = {
  districts: [],
  shipping: 0,
};

const Shipment = React.memo((props: any) => {
  let timer: ReturnType<typeof setTimeout>;
  const [formData] = Form.useForm();
  const prevProps = useRef(props);
  const [inactive, setInactive] = useState(false);
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    initialState
  );

  // const handleChange = (e: any) => {
  //   setStates({reason: e.target.value});
  // };

  const handleChangeSelect = (e: any, { name, value }: any) => {
    setStates({ [name]: value });
  };

  const handleSubmit = async (data: any) => {
    setInactive(true);
    props.onSubmit(data);
  };

  const close = () => {
    props.handleOpenModal({ name: "modalShipment", value: false });
  };

  const timerTrigger = (t: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => getDistrictByKey(t.target.value as string), 1000);
  };

  const getDistrictByKey = async (text: string) => {
    if (text) {
      const resp = await axios.get(
        `${props.jotf}/api/auth/search-district/${text}`,
        {
          headers: {
            Authorization: props.jotfToken,
          },
        }
      );

      const districts = resp.data;
      let datas = [];
      for (let x = 0; x < districts?.length; x++) {
        datas.push({
          key: districts[x].id,
          name: "district_id",
          value: districts[x].id,
          label: districts[x].district_name,
        });
      }
      setStates({
        districts: datas,
      });
    }
  };

  const methods = [
    { key: 1, name: "shipping", value: 1, label: "SAP" },
    { key: 2, name: "shipping", value: 2, label: "Autan" },
  ];

  return (
    <Modal
      mask={false}
      destroyOnClose
      title="Choose Shipment"
      style={{ right: 400 }}
      open={props.open}
      onCancel={close}
      className={"modal"}
      footer={
        <Space size={0}>
          <Button
            onClick={() => showConfirm({ onOk: () => formData.submit() })}
            style={{ borderBottomLeftRadius: 8 }}
            disabled={inactive}
          >
            Submit
          </Button>
          <Button
            onClick={close}
            style={{ backgroundColor: "#252733", borderBottomRightRadius: 8 }}
          >
            Cancel
          </Button>
        </Space>
      }
    >
      <Form
        className={"form"}
        layout="vertical"
        form={formData}
        onFinish={handleSubmit}
      >
        <Row>
          {/* <Col span={24}>
            <Form.Item
              name="shipping"
              label="Choose Shipment Method"
              rules={[
                {
                  required: true,
                  message: "This field is required!",
                },
              ]}
            >
              <Select
                // className={"input"} 
                tabIndex={1}
                onChange={handleChangeSelect}
                options={methods}
                placeholder="Pick one"
                autoFocus
              />
            </Form.Item>
          </Col> */}
          <>
            <Col span={24}>
              <Form.Item
                name="address"
                label="Address 1"
                rules={[
                  {
                    required: states.shipping === 1 ? true : false,
                    message: "This field is required!",
                  },
                ]}
              >
                <Input.TextArea rows={2} tabIndex={1} name="address" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="address2"
                label="Address 2"
                // rules={[
                //   {
                //     required: states.shipping === 1 ? true : false,
                //     message: "This field is required!",
                //   },
                // ]}
              >
                <Input.TextArea rows={2} tabIndex={1} name="address2" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="address3"
                label="Address 3"
                // rules={[
                //   {
                //     required: states.shipping === 1 ? true : false,
                //     message: "This field is required!",
                //   },
                // ]}
              >
                <Input.TextArea rows={2} tabIndex={1} name="address3" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="address4"
                label="Address 4"
                // rules={[
                //   {
                //     required: states.shipping === 1 ? true : false,
                //     message: "This field is required!",
                //   },
                // ]}
              >
                <Input.TextArea rows={2} tabIndex={1} name="address4" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="kodepos"
                label="Postal Code"
                rules={[
                  {
                    required: states.shipping === 1 ? true : false,
                    message: "This field is required!",
                  },
                ]}
              >
                <Input tabIndex={2} type="number" name="kodepos" />
              </Form.Item>
            </Col>
            <Col span={24} style={{ width: "100%" }}>
              <Form.Item
                name="district_id"
                label="District"
                rules={[
                  {
                    required: states.shipping === 1 ? true : false,
                    message: "This field is required!",
                  },
                ]}
              >
                <Select
                  tabIndex={3}
                  showSearch
                  onKeyUp={(t) => timerTrigger(t)}
                  options={states.districts}
                  filterOption={(input, option) =>
                    option?.props.label
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  placeholder={
                    states.districts?.length > 0 ? "Pick one" : "Search here..."
                  }
                >
                  {states.districts?.length > 0
                    ? states.districts.map((item: any, idx: number) => (
                        <Select.Option key={item.key} value={item.value}>
                          {item.label}
                        </Select.Option>
                      ))
                    : null}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} style={{ width: "100%" }}>
              <Form.Item
                name="prizeId"
                label="Prize"
                rules={[
                  {
                    required: states.shipping === 1 ? true : false,
                    message: "This field is required!",
                  },
                ]}
              >
                <Select
                  tabIndex={4}
                  showSearch
                  options={props.prizeSAP}
                  filterOption={(input, option) =>
                    option?.props.label
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  placeholder={"----------- Select Prize -----------"}
                >
                  {props.prizeSAP?.length > 0
                    ? props.prizeSAP.map((item: any, idx: number) => (
                        <Select.Option key={item.key} value={item.value}>
                          {item.label}
                        </Select.Option>
                      ))
                    : null}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="quantity"
                label="Package Quantity"
                rules={[
                  {
                    required: states.shipping === 1 ? true : false,
                    message: "This field is required!",
                  },
                ]}
              >
                <Input tabIndex={5} type="number" name="quantity" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="receiver_name"
                label="Receiver Name"
                rules={[
                  {
                    required: states.shipping === 1 ? true : false,
                    message: "This field is required!",
                  },
                ]}
              >
                <Input tabIndex={6} name="receiver_name" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="receiver_phone"
                label="Receiver Phone Number"
                rules={[
                  {
                    required: states.shipping === 1 ? true : false,
                    message: "This field is required!",
                  },
                ]}
              >
                <Input tabIndex={7} type="number" name="receiver_phone" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="approver"
                label="Approver"
                rules={[
                  {
                    required: states.shipping === 1 ? true : false,
                    message: "This field is required!",
                  },
                ]}
              >
                <Input tabIndex={8} name="approver" />
              </Form.Item>
            </Col>
          </>
        </Row>
      </Form>
    </Modal>
  );
});

Shipment.displayName = "PickShipmentModal";
export default React.memo(Shipment);
