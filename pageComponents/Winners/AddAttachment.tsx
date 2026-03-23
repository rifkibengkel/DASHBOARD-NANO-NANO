import React from "react";
import Modal from "antd/lib/modal";
// import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
// import DatePicker from "antd/lib/date-picker";
import Button from "antd/lib/button";
// import Select from "antd/lib/select";
import Image from "antd/lib/image";
// import dayjs from "dayjs";
import { Space } from "antd";
import Table from "antd/lib/table";

const Attachments = React.memo((props: any) => {
  const close = () => {
    props.handleOpenModal({ name: "modalAttachments", value: false });
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "url",
      key: "url",
      render: (x: any) => {
        return <Image src={x} width={200} />
      }
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text: any, record: any) => {
        return <Button
        type="link" className={"link"}
        onClick={() =>
          props.selectAttachment({
            imgId: record.value
          })
        }
        >
        Choose
    </Button>
      }
    },
  ]

  return (
    <Modal
      destroyOnClose
      title="Select Attachment"
      centered
      footer={null}
      open={props.open}
      onCancel={close}
      className={"modal"}
    >
      <Row>
        <Col span={24}>
          <Table
            style={{ overflowX: 'scroll' }}
            dataSource={props.data}
            columns={columns}
            size="middle"
          />
        </Col>
      </Row>

      <Row justify="center">
        {/* <Col>
          <Button onClick={handleReset}>Reset</Button>
        </Col> */}
        <Col>
          <Space>
            <Button
              className={'button'}
              shape="round" onClick={close}>
              Cancel
            </Button>
          </Space>
        </Col>
      </Row>
    </Modal>
  );
})

Attachments.displayName = "AddAttModal"
export default React.memo(Attachments)
