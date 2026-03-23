import React, { useReducer, useEffect } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import { Empty, Image, Input, Select, Space, Upload } from "antd";
import { DeleteOutlined, InboxOutlined, PlusOutlined } from "@ant-design/icons";
import Dragger from "antd/lib/upload/Dragger";
import Form from "antd/lib/form/Form";
import FormItem from "antd/lib/form/FormItem";
import { showConfirm } from "@/components/modals/ModalAlert";

let initialState = {
  data: [],
  img: [],
  isEdit: false,
  isChange: false,
  userId: 0,
  entriesId: 0,
  status: 0,
  voucher: null,
  isApprove: 0,
  masterVoucher: [],
  isComplete: false,
  winnerId: null,
  hp: "",
  voucherId: null,
  voucherType: 0,
  topupType: 0,
};

const Modals = (props: any) => {
  const [states, setStates] = useReducer(
    (state: any, newState: Partial<any>) => ({ ...state, ...newState }),
    initialState
  );

  useEffect(() => {
    const { data, master } = props;
    if (data?.entriesId && data?.entriesId > 0) {
      setStates({
        entriesId: data.entriesId,
      });
    }
    if (data?.winnerId && data?.winnerId > 0) {
      setStates({
        winnerId: data.winnerId,
      });
    }
    if (data?.topupType) {
      setStates({
        topupType: data?.topupType,
      });
    }
    if (data?.status && data?.status > 0) {
      setStates({
        status: data.status,
      });
    }
    if (data?.voucher) {
      setStates({
        voucher: data.voucher,
      });
    }
    if (data?.userId && data?.userId > 0) {
      setStates({
        userId: data.userId,
      });
    }
    if (data?.img && data?.img?.length > 0) {
      setStates({
        data: data.img,
      });
    }

    if (master?.voucher && master?.voucher?.length > 0) {
      setStates({
        masterVoucher: master.voucher,
      });
    }
  }, [props.data, props.master]);

  const close = () => {
    props.handleOpenModal({ name: "openImage", value: false });
    setStates(initialState);
  };

  const approve = () => {
    setStates({
      isApprove: states.isApprove === 1 ? 0 : 1,
    });
  };

  const handleApprove = () => {
    if (states.topupType === 3) {
      handleTopup();
      close();
      return;
    }
    approve();
  };

  const handleTopup = () => {
    props.topup({
      id: states.winnerId,
      hp: states.hp,
      voucherId: states.voucherId,
      status: states.topupType === 3 ? 2 : 0,
    });
    close();
  };
  const handleChange = (name: string, value: string) => {
    if (name === "hp") {
      value = value.replace(/[^0-9]/g, "");
    }
    setStates({
      [name]: value,
    });
  };

  const handleDeleteImage = (id: any) => {
    props.deleteImage(id);
    let imgData = states?.data;
    let imgDataId = imgData?.map((v: any) => v.id);
    const index = imgDataId.indexOf(id);
    if (index > -1) {
      // only splice imgData when item is found
      imgData.splice(index, 1); // 2nd parameter means remove one item only
    }
    setStates({
      data: imgData,
    });
  };

  const handleChangeVoucher = (value: any) => {
    const arrValue = value.split(",");
    const id = arrValue[0];
    const type = arrValue[1];
    setStates({
      voucherId: id,
      voucherType: type,
    });
  };

  const uploadImage = (v: any) => {
    const file = v?.file;
    const data = {
      pickedId: states.winnerId,
      fileName: file.name,
      selectedFile: file.originFileObj,
      isLoading: true,
      userId: states.userId,
    };
    if (file?.status === "done") {
      props.upload(data);
    }
  };
  return (
    <Modal
      destroyOnClose
      title={props.header}
      className={"modal"}
      onCancel={close}
      centered
      footer={
        null
        // <Space size={1}>
        //     <Button
        //         onClick={states.isApprove === 1 ? handleTopup : handleApprove}
        //         disabled={(states?.data?.length < 2 || states.status > 0) ? true : false}
        //     >
        //         {states.isApprove === 1 ? "Submit" : "Approve"}
        //     </Button>
        //     {states.isApprove === 1 ? (
        //         <Button
        //             onClick={approve}
        //         >
        //             Back
        //         </Button>
        //     ) : null}
        // </Space>
      }
      width={1000}
      open={props.open}
    >
      {states.isApprove === 1 ? (
        <Form>
          <Row gutter={16}>
            <Col span={10}>
              <FormItem label="Voucher">
                <Select
                  // name="status"
                  className={"select"}
                  // value={states.status}
                  onChange={(e) => handleChangeVoucher(e)}
                  options={states.masterVoucher}
                  placeholder="Choose an option"
                />
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem label="Account Number">
                <Input
                  value={states.hp}
                  name="hp"
                  onChange={(v) => {
                    handleChange("hp", v.target.value);
                  }}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
      ) : !states.data || states.data.length < 1 ? (
        states.status > 0 ? (
          <Empty />
        ) : (
          <Dragger
            name="file"
            multiple={false}
            onChange={(v) => uploadImage(v)}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Dragger>
        )
      ) : (
        <Image.PreviewGroup>
          <Row gutter={24}>
            {states.data.map((v: any, idx: any) => (
              <Col
                span={8}
                key={`image${idx}`}
                style={{ marginBottom: 20 }}
                className="imagelist-container"
              >
                <Space>
                  <Image
                    width={300}
                    height={200}
                    src={v.url}
                    alt=""
                    style={{
                      objectFit: "cover",
                    }}
                  />
                  {/* <Button type="primary" shape="circle" /> */}
                </Space>
                <Button
                  icon={<DeleteOutlined />}
                  type="link"
                  danger
                  disabled={states.status > 0 ? true : false}
                  onClick={() =>
                    showConfirm({
                      onOk: () => handleDeleteImage(v.id),
                      content: "Apakah anda yakin untuk menghapus gambar ini?",
                    })
                  }
                />
              </Col>
            ))}
            <Col span={8} className="imagelist-container">
              <Upload
                listType="picture-card"
                showUploadList={false}
                className="avatar-uploader"
                onChange={(v) => uploadImage(v)}
              >
                {states.status > 0 ? null : (
                  <Col>
                    <PlusOutlined
                      width="100%"
                      height="100%"
                      title="Add Image"
                    />
                    <p className="ant-upload-text">
                      Click this area to add image
                    </p>
                  </Col>
                )}
              </Upload>
            </Col>
          </Row>
        </Image.PreviewGroup>
      )}
    </Modal>
  );
};
export default React.memo(Modals);
