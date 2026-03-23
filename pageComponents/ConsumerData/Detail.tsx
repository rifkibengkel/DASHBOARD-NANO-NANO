import React, { useReducer, useEffect } from "react";

import Modal from "antd/lib/modal";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import dayjs from "dayjs";
import { Divider, Select, Space, Table } from "antd";
import Text from "antd/lib/typography/Text";

let initialState = {
  data: [],
  img: [],
  isEdit: false,
  isEditRek: false,
  isEditTrf: false,
  isChange: false,
  vouchers: [],
  cashPrize: false,
  form: {
    hp: "",
    proccesDate: "",
    reason: "",
    reference: "",
    status: null,
    winnerId: null,
  },
};

const Modals = (props: any) => {
  const [states, setStates] = useReducer(
    (state: any, newState: Partial<any>) => ({ ...state, ...newState }),
    initialState
  );

  const close = () => {
    props.handleOpenModal({ name: "openModal", value: false });
    setStates(initialState);
  };

  useEffect(() => {
    const { data } = props;
    if (data && Object.keys(data).length != 0) {
      setStates({
        data: data,
      });
    }
  }, [props.data]);

  let columns: any = [
    {
      title: "Proccessed Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: any) => <>{dayjs(text).format("DD MMM YYYY HH:mm:ss")}</>,
    },
    // {
    //   title: "Desc",
    //   dataIndex: "name",
    //   key: "name",
    // },
    {
      title: "Trx Type",
      dataIndex: "trxType",
      key: "trxType",
    },
    {
      title: "Coupon",
      dataIndex: "coupon",
      key: "coupon",
    },
    {
      title: "Point",
      dataIndex: "point",
      key: "point",
    },
  ];

  const dataSource = states?.data ? states?.data : [];

  dataSource?.forEach((i: any, index: number) => {
    i.key = index;
  });

  return (
    <Modal
      destroyOnClose
      title={props.header}
      className={"modal"}
      onCancel={close}
      centered
      width={800}
      open={props.open}
      footer={false}
    >
      <Row>
        <Divider>Transaction</Divider>
        <Col span={24}>
          <Table
            style={{ overflowX: "scroll" }}
            dataSource={states?.data || []}
            columns={columns}
            key="transaction"
            pagination={false}
          />
        </Col>
      </Row>
    </Modal>
  );
};

// export default Modals;
export default React.memo(Modals);
