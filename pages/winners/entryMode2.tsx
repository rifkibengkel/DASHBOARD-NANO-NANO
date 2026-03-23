import React, { useEffect, useReducer, useState } from "react";
import type { ReactElement, FocusEvent } from 'react'
import { getLoginSession } from '@/lib/auth';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextApiRequest } from 'next'
import Error from 'next/error'
import { PageHeader } from '@ant-design/pro-layout'
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import Space from "antd/lib/space";
import Affix from "antd/lib/affix";
import Divider from "antd/lib/divider";
import Notifications from "@/components/Notifications"
import dynamic from "next/dynamic";

import DashboardLayout from "../../components/layouts/Dashboard";
import { showApproveConfirm, showConfirm, showRejectConfirm } from "../../components/modals/ModalAlert";
import { IDataEntry2, IInvReason, IMaster } from "../../interfaces/entries.interface";
import Viewerjs from "../../components/Viewer";
import { detailWnr, detailWnr2 } from "@api/winners/list";
import { changePrizeIfAvail, getProgramId, masterDistrictCity, rejReasonKTP } from "@api/master";
import { setShipMethod } from "./entry";
import axios from "axios";

// const { Option } = Select

const jotf = process.env.JOTF

const jotfToken = process.env.SAP

const ModalAttachment = dynamic(() => import("../../pageComponents/Winners/AddAttachment"), { loading: () => <p>Loading...</p>, ssr: false });

const ModalRejects = dynamic(() => import("../../pageComponents/Winners/OnReject"), { loading: () => <p>Loading...</p>, ssr: false });

const ModalShipment = dynamic(() => import("../../pageComponents/Winners/ShipmentMethod"), { loading: () => <p>Loading...</p>, ssr: false });

const DataEntry = (props: any) => {
    const router = useRouter()
    const { query } = router
    const [states, setStates] = useReducer((state: IDataEntry2, newState: Partial<IDataEntry2>) => ({ ...state, ...newState }), props);
    const [container, setContainer] = useState()
    const [isClient, setIsClient] = useState(false)


    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        setStates({
            isChecked: false
        })
        e.preventDefault()
        const { name, value } = e.currentTarget
        setStates({
            form: {
                ...states.form,
                [name]: value
            }
        })
    };

    const handleOpenModal = async (param: any) => {
        setStates({
            [param.name]: param.value,
        });
    }

    const setAttachment = async (data: any) => {
        const datas = {
            imgId: data.imgId,
            entryId: states.form.entryId
        }
        const respo = await setTheAttachment(datas)
        if (respo?.ok) {
            Notifications('success', 'Attachment Updated', 'Success')
            router.reload()
        }
    }

    const formatNumber = (number: number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    useEffect(() => {
        const { data, isClient } = props
        setIsClient(isClient);
        if (data) {
            setStates({
                master: {
                    ...states.master,
                    rsa: data.rsaByStore
                }
            })

            router.push({
                pathname: router.pathname,
                query: { entries: router.query.entries }
            }, undefined, { shallow: true }
            )
        }
    }, [props.data])

    useEffect(() => {
        const { form } = props
        if (form) {
            setStates({
                form: form
            })
        }
    }, [props.form])

    useEffect(() => {
        setContainer(document.getElementById("containerImage") as any)
    }, [])

    if (props.error) {
        return <Error statusCode={400} />
    }

    const saveData = async () => {
        let {
            form
        } = states;

        let datas = {
            id: form.entryId,
            grosirName: form.dName,
            grosirHp: form.dHp,
            grosirAddress: form.dAddress
        }

        let encryp = Buffer.from(JSON.stringify(datas)).toString('base64')
        let response: any = await updateGrosir(encryp)
        if (response.status !== 200) {
            alert(response.error);
        } else {
            Notifications('success', "Data Updated.", '')
            backToEntries()
        }
    }

    const approveData = async () => {
        let {
            form,
            approveMode
        } = states;

        let datas = {
            id: form.entryId,
            grosirName: form.dName,
            grosirHp: form.dHp,
            grosirAddress: form.dAddress,
            promoId: form.promoId,
            approve: approveMode ? 1 : 0,
        }
        let encryp = Buffer.from(JSON.stringify(datas)).toString('base64')
        let response: any = await approveThis(encryp)

        if (response.status !== 200) {
            alert(response.error);
        } else {
            Notifications('success', "Data Updated.", '')
            backToEntries()
        }
    }

    const rejectData = async (reason: any, isClient: any) => {
        let {
            form,
        } = states;

        let datas = {
            id: form.entryId,
            grosirName: form.dName,
            grosirHp: form.dHp,
            grosirAddress: form.dAddress,
            reject: reason,
            isClient
        }

        let encryp = Buffer.from(JSON.stringify(datas)).toString('base64')
        let response: any = await rejectThis(encryp)

        if (response.status !== 200) {
            alert(response.error);
        } else {
            Notifications('success', "Data Rejected.", '')
            backToEntries()
        }
    }

    const setShippingMethod = async (vals: any) => {
        let {
            form,
        } = states;

        let datas = {
            promoId: form.promoId,
            winnerId: form.entryId,
            shippingId: vals.shipping,
            courierName: vals.courierName ? vals.courierName : '',
            courierPhone: vals.courierPhone ? vals.courierPhone : '',
            
            address: vals.address,
            kodepos: vals.kodepos,
            district_id: vals.district_id,
            master_program_id: form.promoId,
            master_prize_id: vals.prizeId,
            quantity: vals.quantity,
            receiver_name: vals.receiver_name,
            receiver_phone: vals.receiver_phone,
            approver: vals.approver
        }

        let encryp = Buffer.from(JSON.stringify(datas)).toString('base64')
        let response: any = await setShipMethod(encryp)

        if (response.status !== 200) {
            Notifications('error', response.message, '')
        } else {
            Notifications('success', "Data Saved for Shipping.", '')
            backToEntries()
        }
    }

    const backToEntries = () => {
        router.push(`/winners/${states.backFilter.typeUser}?page=${states.backFilter.page}&row=${states.backFilter.row}&column=${states.backFilter.column}&direction=${states.backFilter.direction}&startDate=${states.backFilter.startDate}&endDate=${states.backFilter.endDate}&prize=${states.backFilter.prize}&key=${states.backFilter.key}&status=${states.backFilter.status}&isHaveAtt=${states.backFilter.isHaveAtt}`)
    }
    return (
        <>
            <PageHeader
                title="Data Entry"
                extra={[
                    !query.type ?
                        <Space key={'space1'}>
                            {/* <Button
                                className={'button4'}
                                shape="round"
                                disabled={states.approveMode ? true : false}
                                onClick={() =>
                                    handleOpenModal({
                                        value: true,
                                        name: "modalAttachments",
                                    })
                                }
                            >
                                Set Attachment
                            </Button> */}
                            <Button
                                key="ReturnToWin"
                                id={"returnRef"}
                                onClick={backToEntries}
                                className={'button4'}
                                shape="round"
                            >
                                Return to Winners
                            </Button>
                            {states.approveMode && !states.approve2Mode ? <>
                                <Button key="ButtonInvalid"
                                    style={{ backgroundColor: "grey" }}
                                    onClick={() => handleOpenModal({
                                        name: 'modalReject',
                                        value: true
                                    })}
                                    className={'button3'}
                                    shape="round"
                                    id={"invalidButRef"}
                                >
                                    Reject
                                </Button>
                                <Button key="Buttonvalid"
                                    // loading={states.stopper}
                                    onClick={() => showApproveConfirm({ onOk: (() => approveData()) })}
                                    className={'button'}
                                    shape="round"
                                    id={"validRef"}
                                >
                                    Approve
                                </Button> </> : null
                            }
                            {states.approve2Mode ? <>
                                <Button key="ButtonSelectShipmt"
                                    onClick={() => handleOpenModal({
                                        name: 'modalShipment',
                                        value: true
                                    })}
                                    className={'button'}
                                    shape="round"
                                    id={"shipButRef"}
                                >
                                    Choose Shipment Method
                                </Button> </> : null
                            }
                        </Space> : null,

                ]}
            />
            <Row gutter={20}>
                <Col xl={14}>
                    <Card title="Entry">
                        <Form className={"form"} layout="vertical">
                            <Row gutter={16}>
                                {/* <Col span={12}>
                                    <Form.Item label="Name">
                                        <Input
                                            tabIndex={1}
                                            name="name"
                                            value={states.form.name}
                                            placeholder="Name"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="ID Number (from Consumer Input)">
                                        <Input
                                            tabIndex={2}
                                            name="idNumber"
                                            value={states.form.idNumber}
                                            placeholder="ID Number"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Handphone">
                                        <Input
                                            tabIndex={3}
                                            name="handphone"
                                            value={states.form.handphone}
                                            placeholder="Handphone"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Sender">
                                        <Input
                                            tabIndex={4}
                                            name="sender"
                                            value={states.form.sender}
                                            placeholder="Sender"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Regency">
                                        <Input
                                            tabIndex={5}
                                            name="regency"
                                            value={states.form.regency}
                                            placeholder="Regency"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Received Date">
                                        <Input
                                            tabIndex={6}
                                            name="rcvd_time"
                                            value={states.form.rcvd_time}
                                            placeholder="Received Date"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item label="Prize Name">
                                        <Input
                                            tabIndex={6}
                                            name="prizeName"
                                            value={states.form.prizeName}
                                            placeholder="Prize Name"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Prize Amount">
                                        <Input
                                            tabIndex={6}
                                            name="prizeAmount"
                                            value={formatNumber(Number(states.form.prizeAmount ? states.form.prizeAmount : 0))}
                                            placeholder="Nominal"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="User Type">
                                        <Input
                                            tabIndex={6}
                                            name="user_type"
                                            value={states.form.user_type ? states.form.user_type : 'N/A'}
                                            placeholder="User Type"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col> */}
                                {/* <Col span={12}>
                                    <Form.Item label="Store Input">
                                        <Input
                                            tabIndex={6}
                                            name="storeInput"
                                            value={states.form.storeInput}
                                            placeholder="Store Input"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Purchase Date Input">
                                        <Input
                                            tabIndex={6}
                                            name="purchaseDateInput"
                                            value={states.form.purchaseDateRl}
                                            placeholder="Purchase Date Input"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col> */}
                                {/* <Divider /> */}
                                <Col span={24}>
                                    <Form.Item label="Message">
                                        <Input.TextArea
                                            rows={5}
                                            tabIndex={6}
                                            name="message"
                                            value={states.form.message}
                                            placeholder="Message"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                {/* <Col span={24}>
                                    <Form.Item label="Grosir HP">
                                        <Input
                                            tabIndex={6}
                                            name="grosirHp"
                                            value={states.form.grosirHp}
                                            placeholder="Grosir HP"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="Grosir Address">
                                        <Input
                                            tabIndex={6}
                                            name="grosirAddress"
                                            value={states.form.grosirAddress}
                                            placeholder="address"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col> */}

                                <Divider />

                                <Col span={12}>
                                    <Form.Item
                                        label="Name (from KTP/Image provided)"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'This field is required!',
                                            },
                                        ]}
                                        initialValue={states.form.dName}
                                    >
                                        <Input
                                            tabIndex={16}
                                            name="dName"
                                            onChange={handleChange}
                                            value={states.form.dName}
                                            // placeholder="Jon Snow"
                                            className={"input"}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Phone Number (from KTP/Image provided)"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'This field is required!',
                                            },
                                        ]}
                                        initialValue={states.form.dHp}
                                    >
                                        <Input
                                            tabIndex={16}
                                            name="dHp"
                                            onChange={handleChange}
                                            value={states.form.dHp}
                                            // placeholder="1234928147013"
                                            className={"input"}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        label="Address (from Image/KTP provided)"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'This field is required!',
                                            },
                                        ]}
                                        initialValue={states.form.dAddress}
                                    >
                                        <Input
                                            tabIndex={16}
                                            name="dAddress"
                                            onChange={handleChange}
                                            value={states.form.dAddress}
                                            // placeholder="Jalan 1"
                                            className={"input"}
                                        />
                                    </Form.Item>
                                </Col>
                                {/* <Col span={12}>
                                    <Form.Item
                                        label="Prize (change this if Topup failed)"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'This field is required!',
                                            },
                                        ]}
                                        // name="prizeType"
                                        // initialValue={states.form.prizeType}
                                    >
                                        <Select
                                            tabIndex={17}
                                            className={"select"}
                                            placeholder="- Select -"
                                            // value={states.form.prizeType}
                                            id={"rejRef"}
                                            onChange={(e, {value, text}: any) =>
                                                setStates({
                                                    form: {
                                                        ...states.form,
                                                        prizeType: value,
                                                    }
                                                })
                                            }
                                            options={states.master.prizeChange}
                                            onKeyDown={(event) => {
                                                if (event.key === "Tab") {
                                                    event.preventDefault();
                                                    document.getElementById("checkRef")?.focus();
                                                }
                                            }}
                                        /> */}
                                        {/* stateless style */}
                                        {/* <Select
                                            tabIndex={10}
                                            className={"select"}
                                            filterOption={(input, option) =>
                                                option?.props.label
                                                    .toLowerCase()
                                                    .indexOf(input.toLowerCase()) >= 0
                                            }
                                            showSearch
                                            placeholder="- Select -"
                                            onKeyDown={(event) => {
                                                if (event.key === "Backspace") {
                                                    setStates({
                                                        form: {
                                                            ...states.form,
                                                            prizeType: undefined,
                                                        },
                                                    });
                                                } else if (event.key === "Enter") {
                                                    event.preventDefault();
                                                }
                                            }}
                                        >
                                            {states.master.prizeChange.length > 0 ? states.master.prizeChange.map((item: any, idx: number) => (
                                                <Option key={idx} value={item.value}>{item.label}</Option>
                                            )) : null}
                                        </Select>
                                    </Form.Item>
                                </Col> */}
                                {/* <Col span={24} style={{ paddingTop: "2em" }}> */}
                                    {/* <Form.Item label="Invalid Reason" hidden={!states.form.isInvalid ? true : false}>
                                        <Select
                                            tabIndex={19}
                                            className={"select"}
                                            placeholder="Pick a Reason"
                                            value={states.entryCondition.invalidId}
                                            id={"rejRef"}
                                            onChange={(e, {value, text}: any) =>
                                                setStates({
                                                    entryCondition: {
                                                        ...states.entryCondition,
                                                        invalidId: value,
                                                    }
                                                })
                                            }
                                            options={states.master.invalidReason}
                                            onKeyDown={(event) => {
                                                if (event.key === "Tab") {
                                                    event.preventDefault();
                                                    document.getElementById("checkRef")?.focus();
                                                }
                                            }}
                                        />
                                    </Form.Item> */}
                                {/* </Col> */}
                                {!states.approveMode ? (
                                    <>
                                        {/* <Col span={24} style={{ marginBottom: "2em" }}>
                                            <Checkbox id={"validRef"}
                                                checked={states.form.isValid}
                                            >
                                                VALID
                                            </Checkbox>
                                        </Col> */}
                                        <Col span={24} style={{ marginTop: "2em" }}>
                                            <Form.Item>
                                                <Button key="ButtonSave"
                                                    id={"saveRef"}
                                                    // onClick={saveData}
                                                    onClick={() => showConfirm({onOk: (() => saveData())})}
                                                    htmlType={"submit"}
                                                    className={'button-dataEntry'}
                                                    shape="round"
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Tab") {
                                                            event.preventDefault();
                                                            document.getElementById("purchaseDateRef")?.focus();
                                                        }
                                                    }}
                                                >
                                                    Save
                                                </Button>
                                            </Form.Item>
                                        </Col>
                                        {/* <Col span={24}>
                                            <Form.Item> */}
                                                {/* <Button key="ButtonSave"
                                                    id={"saveRef"}
                                                    loading={states.isLoading}
                                                    style={!(states.isChecked && states.form.isValid) ? { backgroundColor: "grey" } : {}}
                                                    disabled={!(states.isChecked && states.form.isValid)}
                                                    onClick={() => showConfirm({ onOk: (() => submitData()) })}
                                                    htmlType={"submit"}
                                                    className={'button-dataEntry'}
                                                    shape="round"
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Tab") {
                                                            event.preventDefault();
                                                            document.getElementById("purchaseDateRef")?.focus();
                                                        }
                                                    }}
                                                >
                                                    Save
                                                </Button> */}
                                            {/* </Form.Item>
                                        </Col> */}
                                    </>
                                ) : null}
                            </Row>
                        </Form>
                    </Card>
                </Col>
                <Col xl={10}>
                    <Row>
                        <Col span={24}>
                            <Affix offsetTop={10}>
                                <Card className={"card-profile-data-entry"} title="Struct Photo">
                                    <div
                                        id="containerImage"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                        }}
                                    >
                                        <Viewerjs
                                            url={states.form.url}
                                            container={container}
                                        />
                                    </div>
                                </Card>
                            </Affix>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <ModalAttachment
                open={states.modalAttachments}
                handleOpenModal={handleOpenModal}
                data={states.master.images}
                // entrId={states.form.entryId}
                selectAttachment={setAttachment}
            />
            <ModalRejects
                reasons={states.master.invalidReason}
                open={states.modalReject}
                handleOpenModal={handleOpenModal}
                onSubmit={rejectData}
                isClient={isClient}
            />
            <ModalShipment
                jotf={states.jotf}
                jotfToken={states.jotfToken}
                reasons={states.master.invalidReason}
                prizeSAP={states.master.prizeSAP}
                open={states.modalShipment}
                handleOpenModal={handleOpenModal}
                onSubmit={setShippingMethod}
            />
        </>
    )
}

const setTheAttachment = async (data: any) => {
    let res = await fetch(`/api/winners/setAttachment`, {
        method: 'POST',
        body: JSON.stringify({
            id: data.entryId,
            attId: data.imgId
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    })
    if (res.status !== 404) {
        return res
    } else {
        return alert("Error 404")
    }
}

const updateGrosir = async (data: any) => {
    let res: any = await fetch(`/api/winners/gsUpdate`, {
        method: 'POST',
        body: JSON.stringify({
            data: data
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (res.status !== 404) {
        let dataList = await res.json()
        return dataList
    } else {
        return alert("Error 404")
    }
}

const saveThis = async (data: any) => {
    let res: any = await fetch(`/api/winners/ktpSave`, {
        method: 'POST',
        body: JSON.stringify({
            data: data
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (res.status !== 404) {
        let dataList = await res.json()
        return dataList
    } else {
        return alert("Error 404")
    }
}

const approveThis = async (data: any) => {
    let res: any = await fetch(`/api/winners/gsApprove`, {
        method: 'POST',
        body: JSON.stringify({
            data: data
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (res.status !== 404) {
        let dataList = await res.json()
        return dataList
    } else {
        return alert("Error 404")
    }
}

const rejectThis = async (data: any) => {
    let res: any = await fetch(`/api/winners/gsReject`, {
        method: 'POST',
        body: JSON.stringify({
            data: data
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (res.status !== 404) {
        let dataList = await res.json()
        return dataList
    } else {
        return alert("Error 404")
    }
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getLoginSession(ctx.req as NextApiRequest)

    if (!session) {
        return {
            redirect: {
                destination: "/login",
                permanent: false
            }
        }
    }

    //  every API in this sector are from SAP

    const programId: any = await getProgramId()

    const masterPrizeSAP = await axios.get(`${jotf}/api/auth/master-prize/all/${programId[0].value}`, 
    {
        headers: {
            'Authorization': jotfToken as any
          }
    }).then(res => res.data.data)

    //  end of the road

    let entryId: any = ctx.query.entries

    let appMode: any = ctx.query.aprv

    let approveMode = appMode ? Buffer.from(appMode, 'base64').toString('ascii') : 0

    const dataDetail: any = await detailWnr2(entryId)

    const {
        message, dStore, dHp, dAddress, grosirName, grosirHp, grosirAddress, promoId, categoryId
    } = dataDetail.entries[0]

    const urls = JSON.parse(JSON.stringify(dataDetail.url))

    let form = {
        entryId,
        promoId,
        dName: categoryId == 1 ? dStore : grosirName === "" ? dStore : grosirName,
        dHp: categoryId == 1 ? dHp : grosirHp === "" ? dHp : grosirHp,
        dAddress: categoryId == 1 ? dAddress : grosirAddress === "" ? dAddress : grosirAddress,
        isValid: false,
        isInvalid: false,
        url: urls,
        message
    }

    let dataVariants: any = []

    let master = {
        store: [],
        storeCity: [],
        rsa: [],
        alfaArea: [],
        productsByCat: [],
        productsCat: [],
        invalidReason: [],
        images: [],
        prizeChange: [],
        districts: [],
        prizeSAP: [],
        sizes: []
    } as IMaster

    // master.images = JSON.parse(JSON.stringify(dataDetail.images)) || []

    master.invalidReason = await rejReasonKTP() as any
    master.districts = await masterDistrictCity() as string[]
    // master.prizeChange = prizeType ? await changePrizeIfAvail(prizeType) as any : []

    master.prizeSAP = masterPrizeSAP ? masterPrizeSAP as any : []

    interface RgPagination {
        row: string | number;
        page: string | number;
        key: string;
        direction: string;
        column: string;
        limit: number | string;
        media: string;
        startDate: string;
        endDate: string;
        isHaveAtt: number | string
        status: string;
        prize: string;
        type: string;
        typeUser: string
    }

    const { typeUser, row, page, key, startDate, endDate, column, direction, status, prize, isHaveAtt } = ctx.query as any

    const params: RgPagination = {
        row: row ?? 10,
        page: page ?? 0,
        key: key ?? "",
        direction: direction ?? "",
        column: column ?? "",
        limit: "",
        media: '',
        startDate: startDate ?? '',
        endDate: endDate ?? '',
        isHaveAtt: isHaveAtt ?? '',
        status: status ?? '',
        prize: prize ?? '',
        type: '',
        typeUser
    };

    let isClient = false;
    if (session.accessId == 9) {
        isClient = true;
    }

    return {
        props: {
            backFilter: params,
            form,
            master: JSON.parse(JSON.stringify(master)),
            formError: {
                error: false,
                errorField: "",
                errorMessage: ""
            },
            approveMode: approveMode === '1' || approveMode === '2' ? true : false,
            approve2Mode: approveMode === '2' ? true : false,
            isLoading: false,
            modalAdd: false,
            modalReject: false,
            modalShipment: false,
            modalAttachments: false,
            modalType: '',
            modalAddItem: '',
            modalCompare: false,
            dataTable: dataVariants,
            // totalAmount: purchaseAmountAdmin || 0,
            editList: "",
            invalid_reason: '',
            isChecked: false,
            jotf: jotf,
            jotfToken: jotfToken,
            entryCondition: {
                duplicateImg: [],
                isValid: "",
                isDuplicate: 0,
                replyId: 0,
                invalidReason: ""
            },
            isClient
        }
    }
}

export default DataEntry;

DataEntry.getLayout = function getLayout(page: ReactElement) {
    return (
        <DashboardLayout>{page}</DashboardLayout>
    )
}