import React, { useEffect, useReducer, useState } from "react";
import type { ReactElement, FocusEvent } from 'react'
import { useRouter } from 'next/router';
import dayjs from "dayjs";
import { GetServerSideProps } from 'next'
import Error from 'next/error'
import { PageHeader } from '@ant-design/pro-layout'
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Checkbox from "antd/lib/checkbox";
import Form from "antd/lib/form";
import Select from "antd/lib/select";
import Input from "antd/lib/input";
import Space from "antd/lib/space";
import Divider from "antd/lib/divider";
import Affix from "antd/lib/affix";
import Notifications from "@/components/Notifications"
import dynamic from "next/dynamic";

// import { Select } from "antd"

import DashboardLayout from "../../components/layouts/Dashboard";
import { showApproveConfirm, showConfirm, showRejectConfirm } from "../../components/modals/ModalAlert";
import { IDataEntry, IInvReason, IMaster } from "../../interfaces/entries.interface";
import Viewerjs from "../../components/Viewer";
import { detailWnr } from "@api/winners/list";
import { changePrizeIfAvail, eVoucherPick, getProgramId, masterDistrictCity, masterInvReasonEntry2 } from "@api/master";
// import axios from "axios";
import { withAuth } from "@/components/authHOC";
// import { formatNumber } from "@/lib/clientHelper";

// const { Option } = Select

const jotf = process.env.JOTF

const jotfToken = process.env.SAP

const ModalAttachment = dynamic(() => import("../../pageComponents/Winners/AddAttachment"), { loading: () => <p>Loading...</p>, ssr: false });

const ModalRejects = dynamic(() => import("../../pageComponents/Winners/OnReject"), { loading: () => <p>Loading...</p>, ssr: false });

const ModalShipment = dynamic(() => import("../../pageComponents/Winners/ShipmentMethod"), { loading: () => <p>Loading...</p>, ssr: false });

const DataEntry = (props: any) => {
    const router = useRouter()
    const { query } = router
    const [states, setStates] = useReducer((state: IDataEntry, newState: Partial<IDataEntry>) => ({ ...state, ...newState }), props);
    const [container, setContainer] = useState()


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

    const handleChangeSelect = (name: any, value: any) => {
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

    useEffect(() => {
        const { data } = props
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

    const checkData = async () => {
        let {
            approveMode,
            form
        } = states;

        let datas = {
            id: form.entryId,
            ktpNumber: form.ktpNumber,
            ktpName: form.ktpName,
            coupon: form.coupon,
            approve: approveMode ? 1 : 0
        }

        let encryp = Buffer.from(JSON.stringify(datas)).toString('base64')
        let response: any = await checkThis(encryp)
        if (response) {
            setStates({
                form: {
                    ...states.form,
                    isValid: response.data.is_valid === 1 ? true : false,
                },
                invalid_reason: response.data.is_valid === 1 ? 'Passed' : response.message,
                isChecked: true
            })
        }
    }

    const submitData = async () => {
        let {
            approveMode,
            form
        } = states;

        let datas = {
            id: form.entryId,
            ktpNumber: form.ktpNumber,
            ktpName: form.ktpName,
            coupon: form.coupon,
            prizeType: form.prizeType,
            account_number: form.account_number,
            approve: approveMode ? 1 : 0
        }

        setStates({
            isLoading: true
        })
        let encryp = Buffer.from(JSON.stringify(datas)).toString('base64')
        let response: any = await saveThis(encryp)
        if (response.status !== 200) {
            alert(response.error);
            setStates({
                isLoading: false
            })
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

        if(form.prizeId == '' || form.prizeId == null) {
            Notifications('error', "Fill E-Voucher Prize First.", '')
            return
        }

        let accNum = form.account_number as string

        let datas = {
            id: form.entryId,
            prizeId: form.prizeId,
            ktpNumber: form.ktpNumber,
            ktpName: form.ktpName,
            // coupon: form.coupon,
            // prizeType: form.prizeType,
            account_number: accNum.replace(/[^0-9]+/g, ""),
            approve: approveMode ? 1 : 0,
            // promoId: form.promoId,
            // userType: form.user_type
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

    const rejectData = async (reason: any) => {
        let {
            form,
        } = states;

        let datas = {
            id: form.entryId,
            ktpNumber: form.ktpNumber,
            ktpName: form.ktpName,
            coupon: form.coupon,
            reject: reason,
            promoId: form.promoId
        }

        setStates({
            isLoading: true
        })
        let encryp = Buffer.from(JSON.stringify(datas)).toString('base64')
        let response: any = await rejectThis(encryp)

        if (response.status !== 200) {
            alert(response.error);
            setStates({
                isLoading: false
            })
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
            address2: vals.address2,
            address3: vals.address3,
            address4: vals.address4,
            kodepos: vals.kodepos,
            district_id: vals.district_id,
            master_program_id: form.promoId,
            master_prize_id: vals.prizeId,
            quantity: vals.quantity,
            receiver_name: vals.receiver_name,
            receiver_phone: vals.receiver_phone,
            approver: vals.approver
        }
        setStates({
            isLoading: true
        })
        let encryp = Buffer.from(JSON.stringify(datas)).toString('base64')
        let response: any = await setShipMethod(encryp)

        if (response.status !== 200) {
            alert(response.error);
            setStates({
                isLoading: false
            })
        } else {
            Notifications('success', "Data Saved for Shipping.", '')
            backToEntries()
        }
    }

    const backToEntries = () => {
        router.push(`/winners/${states.backFilter.prize}?page=${states.backFilter.page}&row=${states.backFilter.row}&column=${states.backFilter.column}&direction=${states.backFilter.direction}&startDate=${states.backFilter.startDate}&endDate=${states.backFilter.endDate}&prize=${states.backFilter.prize}&key=${states.backFilter.key}&status=${states.backFilter.status}&isHaveAtt=${states.backFilter.isHaveAtt}&prizeId=${states.backFilter.prizeId}`)
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
                            {states.approveMode? <>
                                <Button key="ButtonInvalid"
                                    loading={states.isLoading}
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
                                    loading={states.isLoading}
                                    // loading={states.stopper}
                                    onClick={() => showApproveConfirm({ onOk: (() => approveData()) })}
                                    // onClick={() => handleOpenModal({
                                    //     name: 'modalShipment',
                                    //     value: true
                                    // })}
                                    className={'button'}
                                    shape="round"
                                    id={"validRef"}
                                >
                                    Approve
                                </Button> </> : null
                            }
                            {/* {states.approve2Mode ? <>
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
                            } */}
                        </Space> : null,

                ]}
            />
            <Row gutter={20}>
                <Col xl={14}>
                    <Card title="Entry">
                        <Form className={"form"} layout="vertical">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Name">
                                        <Input
                                            tabIndex={101}
                                            name="name"
                                            value={states.form.name}
                                            placeholder="Name"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Email">
                                        <Input
                                            tabIndex={3}
                                            name="email"
                                            value={states.form.email}
                                            onChange={handleChange}
                                            placeholder="Email"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="No Whatsapp">
                                        <Input
                                            tabIndex={104}
                                            name="sender"
                                            value={states.form.sender}
                                            placeholder="Sender"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Media">
                                        <Input
                                            tabIndex={4}
                                            name="media"
                                            value={states.form.media}
                                            placeholder="Media"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="ID Number (KTP)">
                                        <Input
                                            tabIndex={102}
                                            name="idNumber"
                                            value={states.form.idNumber}
                                            placeholder="ID Number"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="City">
                                        <Input
                                            tabIndex={5}
                                            name="regency"
                                            value={states.form.regency}
                                            onChange={handleChange}
                                            placeholder="City"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="Received Date">
                                        <Input
                                            tabIndex={106}
                                            name="rcvd_time"
                                            value={states.form.rcvd_time}
                                            placeholder="Received Date"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                {/* <Col span={12}>
                                    <Form.Item
                                        label="Coupon/Code (from Image provided)"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'This field is required!',
                                            },
                                        ]}
                                        initialValue={states.form.coupon}
                                    >
                                        <Input
                                            tabIndex={112}
                                            name="coupon"
                                            onChange={handleChange}
                                            value={states.form.coupon}
                                            placeholder="SDOIU123"
                                            className={"input"}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col> */}
                                <Divider />
                                <Col span={12}>
                                    <Form.Item
                                        label="Fullname (from KTP/Image provided)"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'This field is required!',
                                            },
                                        ]}
                                        initialValue={states.form.ktpName}
                                    >
                                        <Input
                                            tabIndex={110}
                                            name="ktpName"
                                            // readOnly
                                            onChange={handleChange}
                                            value={states.form.ktpName}
                                            placeholder="Jon Snow"
                                            className={"input"}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="No KTP/ID Number (from KTP/Image provided)"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'This field is required!',
                                            },
                                        ]}
                                        initialValue={states.form.ktpNumber}
                                    >
                                        <Input
                                            // readOnly
                                            tabIndex={111}
                                            name="ktpNumber"
                                            onChange={handleChange}
                                            value={states.form.ktpNumber}
                                            placeholder="1234928147013"
                                            className={"input"}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                <Form.Item label="Select E-Voucher Prize">
                            <Select
                                tabIndex={19}
                                className={"select"}
                                filterOption={(input, option: any) =>
                                    option?.props.label
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                value={states.form.prizeId}
                                placeholder="- Select -"
                                options={states.master.prizeChange}
                                showSearch
                                onChange={(e, { value, text }: any) =>
                                  handleChangeSelect('prizeId', value)
                                }
                                // onKeyDown={(event) => {
                                //     if (event.key === "Backspace") {
                                //         setStates({
                                //           ...form,
                                          
                                //         });
                                //     }
                                // }}
                            />
                        </Form.Item>
                                </Col>
                                {/* <Col span={24}>
                                    <Form.Item
                                        label="HP/Account Number (change this if Topup failed / prize changed)"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'This field is required!',
                                            },
                                        ]}
                                        // name="prizeType"
                                        // initialValue={states.form.prizeType}
                                    >
                                        <Input
                                            readOnly
                                            tabIndex={114}
                                            name="account_number"
                                            // onChange={handleChange}
                                            value={states.form.account_number}
                                            placeholder="SDOIU123"
                                            className={"input"}
                                        />
                                    </Form.Item>
                                </Col> */}
                                {/* <Col span={24}>
                                    <Form.Item label="Invalid Reason" hidden={!states.form.isInvalid ? true : false}>
                                        <Select
                                            tabIndex={115}
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
                                    </Form.Item>
                                </Col> */}
                                {!states.approveMode ? (
                                    <>
                                        <Col span={24} style={{ marginBottom: "2em" }}>
                                            <Checkbox id={"validRef"}
                                                checked={states.form.isValid}
                                            >
                                                VALID
                                            </Checkbox>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item label="Invalid Reason">
                                                <Input
                                                    value={states.invalid_reason}
                                                    className={"input"}
                                                    readOnly
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24} style={{ marginTop: "2em" }}>
                                            <Form.Item>
                                                <Button key="ButtonSave"
                                                    id={"saveRef"}
                                                    onClick={checkData}
                                                    // onClick={() => showConfirm({onOk: (() => submitData())})}
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
                                                    Check
                                                </Button>
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item>
                                                <Button key="ButtonSave"
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
                                                </Button>
                                            </Form.Item>
                                        </Col>
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
                entrId={states.form.entryId}
                selectAttachment={setAttachment}
            />
            <ModalRejects
                title={"Fill Reject Reason"}
                reasons={states.master.invalidReason}
                open={states.modalReject}
                handleOpenModal={handleOpenModal}
                onSubmit={rejectData}
            />
            <ModalShipment
                jotf={states.jotf}
                jotfToken={states.jotfToken}
                reasons={states.master.invalidReason}
                prizeSAP={states.master.prizeSAP}
                open={states.modalShipment}
                handleOpenModal={handleOpenModal}
                onSubmit={setShippingMethod}
                districts={states.master.districts}
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

const checkThis = async (data: any) => {
    let res: any = await fetch(`/api/winners/ktpCheck`, {
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

// const approveThisKTP = async (data: any) => {
//     let res: any = await fetch(`/api/winners/ktpUpdate`, {
//         method: 'POST',
//         body: JSON.stringify({
//             data: data
//         }),
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//     if (res.status !== 404) {
//         let dataList = await res.json()
//         return dataList
//     } else {
//         return alert("Error 404")
//     }
// }

const approveThis = async (data: any) => {
    let res: any = await fetch(`/api/winners/approve`, {
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
    let res: any = await fetch(`/api/winners/reject`, {
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

export const setShipMethod = async (data: any) => {
    let res: any = await fetch(`/api/winners/setShip`, {
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

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {

    // const programId: any = await getProgramId()

    // const masterPrizeSAP = await axios.get(`${jotf}/api/auth/master-prize/all/${programId[0].value}`, 
    // {
    //     headers: {
    //         'Authorization': jotfToken as any
    //       }
    // }).then(res => res.data.data)

    let entryId: any = ctx.query.entries

    let appMode: any = ctx.query.aprv

    let approveMode = appMode ? Buffer.from(appMode, 'base64').toString('ascii') : 0

    const dataDetail: any = await detailWnr(entryId)

    const {
        account_number, name, coupon, prizeType, idNumber, hp, sender, regency, rcvd_time, message, purchase_date, storeId, purchaseNoInput, purchaseDateInput, purchaseAmountAdmin, ktp_name_admin, ktp_number_admin, ktp_number, prize_name, amount, media, email
    } = dataDetail.entries[0]

    const urls = JSON.parse(JSON.stringify(dataDetail.url))

    let form = {
        entryId,
        name,
        idNumber,
        email,
        media,
        prizeName: prize_name,
        prizeAmount: amount,
        ktpNumber: ktp_number_admin ? ktp_number_admin : ktp_number,
        ktpName: ktp_name_admin ? ktp_name_admin : name,
        handphone: hp,
        prizeType,
        sender,
        regency,
        coupon,
        rcvd_time: rcvd_time ? dayjs(rcvd_time).format("DD/MM/YYYY HH:mm:ss") : '',
        message,
        purchaseDate: purchaseDateInput ? dayjs(purchaseDateInput).format("DD/MM/YYYY") : null,
        purchaseTime: purchaseDateInput ? dayjs(purchaseDateInput).format("HH:mm:ss") : null,
        storeProvince: "",
        purchaseDateRl: dayjs(purchase_date).format("DD/MM/YYYY"),
        storeName: storeId,
        storeReceipt: purchaseNoInput,
        totalAmount: purchaseAmountAdmin,
        account_number,
        isValid: false,
        isInvalid: false,
        url: urls.length > 0 ? urls : [{src: ""}],
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

    master.invalidReason = await masterInvReasonEntry2() as any
    master.districts = await masterDistrictCity() as string[]
    master.prizeChange = await eVoucherPick() as any

    // master.prizeSAP = masterPrizeSAP ? masterPrizeSAP as any : []

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
        prizeId: string
        type: string;
        // typeUser: string
    }

    const { row, page, key, startDate, endDate, column, direction, status, prize, prizeId, isHaveAtt } = ctx.query as any

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
        prizeId: prizeId ?? '',
        type: '',
        // typeUser
    };

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
            isLoading: false,
            modalAdd: false,
            modalReject: false,
            modalShipment: false,
            modalAttachments: false,
            modalType: '',
            modalAddItem: '',
            modalCompare: false,
            dataTable: dataVariants,
            totalAmount: purchaseAmountAdmin || 0,
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
            }
        }
    }
})

export default DataEntry;

DataEntry.getLayout = function getLayout(page: ReactElement) {
    return (
        <DashboardLayout>{page}</DashboardLayout>
    )
}