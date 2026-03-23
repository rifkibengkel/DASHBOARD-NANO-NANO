import React from "react";

import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Input from "antd/lib/input";
import Row from "antd/lib/row";
import dayjs from "dayjs";

const Modals = (props: any) => {
    const close = () => {
        props.handleOpenModal({name: "openModal", value: false});
    };

    return (
        <Modal
            destroyOnClose
            title={props.header}
            className={"modal"}
            onCancel={close}
            centered
            footer={null}
            // footer={
            //     <Space size={0}>

            //         <Button
            //             onClick={submit}
            //             style={{ borderBottomLeftRadius: 8 }}

            //         >
            //             Submit
            //         </Button>
            //         <Button
            //             onClick={close}
            //             style={{ backgroundColor: "#252733", borderBottomRightRadius: 8 }}

            //         >Cancel</Button>
            //     </Space>
            // }
            open={props.open}
        >
            <Form className={"form"} layout="vertical">
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Received Date">
                            <Input
                                readOnly
                                value={dayjs(props.data?.rcvd_time).format("DD-MM-YYYY HH:mm:ss") || ""}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Name">
                            <Input readOnly value={props.data?.name || ""} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Sender">
                            <Input readOnly value={props.data?.sender || ""} />
                        </Form.Item>
                    </Col>
                    {/* <Col span={8}>
                    <Form.Item label="Media">
                        <Input
                        readOnly
                        value={props.data?.media || ""}
                        />
                    </Form.Item>
                    </Col> */}
                    <Col span={8}>
                        <Form.Item label="Handphone">
                            <Input readOnly value={props.data?.hp || ""} />
                        </Form.Item>
                    </Col>
                    {/* <Col span={8}>
                    <Form.Item label="No ID (KTP)">
                        <Input readOnly value={props.data?.idNumber || ""} />
                    </Form.Item>
                    </Col> */}
                    <Col span={8}>
                        <Form.Item label="Regency">
                            <Input readOnly value={props.data?.regency || ""} />
                        </Form.Item>
                    </Col>
                    {/* <Col span={8}>
                        <Form.Item label="Regency Cleansing">
                            <Input readOnly value={props.data?.city_cleansing || ""} />
                        </Form.Item>
                    </Col> */}
                    <Col span={12}>
                        <Form.Item label="Status">
                            <Input
                                readOnly
                                value={props.data?.is_valid === 0 ? "Invalid" : props.data?.is_valid === 1 ? "Valid" : "-" || ''}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Info">
                            <Input readOnly value={props.data?.is_valid === 0 ? props.data?.invalid_reason : props.data?.prize_name || ''} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Message">
                            <Input
                                readOnly
                                value={props.data?.message || ''}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

// export default Modals;
export default React.memo(Modals);