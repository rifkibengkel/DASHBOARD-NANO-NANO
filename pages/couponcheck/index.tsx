import React, { useReducer, useEffect } from "react";
import type { ReactElement } from "react";
import DashboardLayout from "../../components/layouts/Dashboard";
import { PageHeader } from '@ant-design/pro-layout'
import Card from "antd/lib/card";
import Input from "antd/lib/input";
import Form from "antd/lib/form";
import Row from "antd/lib/row";
import Modal from "antd/lib/modal";
// import Col from 'antd/lib/col'
// import Table from 'antd/lib/table';
import { IState } from "../../interfaces/promosettings.interface";
// import { getData } from "../../api/promosettings/ktp/list";
import { masterRole } from "../api/master/index";
import { useRouter } from "next/router";
import{ SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { useApp } from "../../context/AppContext";
import Notifications from "../../components/Notifications";
import dayjs from "dayjs";
import { withAuth } from "@/components/authHOC";
// import ButtonGroup from "antd/lib/button/button-group";

const { Search } = Input;

const CouponCheck = (props: any, { fallback }: any) => {
  const router = useRouter();
  const { statesContex, setSubmitNotif } = useApp();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const handleEnter = (data: any) => {
    setStates({ coupon: data.data });
    handleSearch(data.data);
  };

  const handleSearch = async (data: any) => {
    const res = await getSearch(data);
    const cp = res.data
    if (res.status !== 404) {
      if (cp) {
        Modal.info({
          className: "modal",
          title: "Coupon Availability",
          content: (
            <div>
              {/* <p>Periode: {cp.periodeId}</p> */}
              <p>Status: {cp.status === 1 ? ('Used') : ('Unused')}</p>
              <p>
                Used Date:{" "}
                {cp.status === 1
                  ? dayjs(cp.use_date).format("DD-MM-YYYY HH:mm:ss")
                  : "-"}
              </p>
            </div>
          ),
          onOk() {},
        });
      } else {
        Modal.info({
          className: "modal",
          title: "Coupon Availability",
          content: (
            <div>
              <p>No Coupon Detected</p>
            </div>
          ),
          onOk() {},
        });
      }
      // setStates({
      //     regionCode: region.districtCode,
      //     province: region.province,
      //     regency: region.regency,
      //     district: region.district,
      //     age: date.age,
      //     gender: date.gender,
      //     lahir: date.lahir,
      //     ktp: data
      // })
    }
  };

  const handleChange = (data: any) => {
    if (states.submitDisabled) {
      setStates({ submitDisabled: false });
    }
    setStates({ [data.name]: data.data });
  };

  useEffect(() => {
    const { type, message, description } = statesContex.submitNotif;
    Notifications(type, message, description);
    setSubmitNotif({ type: "", message: "", description: "" });
  }, []);

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="Coupon Check"
          // extra={[
          //     states.access.m_insert == 1 ?
          //     <Button key="1"
          //     onClick={() => handleOpenModal({
          //       name: 'openModal',
          //       type: 'modalAdd',
          //       value: true
          //     })}
          //         className={'button'}
          //         shape="round"
          //     >
          //         Add
          //     </Button> : null
          // ]}
        />
        <Card
          className="custom-card"
          title="Check Coupon Availability"
          // extra={
          //   <Search
          //     name="key"
          //     placeholder="input search text"
          //     // value={states.data.key}
          //     // onSearch={onSearch}
          //     // onChange={handleChange}
          //   />
          // }
        >
          <Row>
            <Form layout="inline">
              <Form.Item>
                <Input
                  placeholder="Input Coupon here..."
                  onPressEnter={(data: any) =>
                    handleEnter({
                      data: data.target.value,
                      name: "coupon",
                    })
                  }
                />
              </Form.Item>
              <Form.Item>
                {/* <Button type="link" shape="circle" icon={<SearchOutlined />} /> */}
              </Form.Item>
            </Form>
          </Row>
          {/* <Row>
                <Col span="24">
                        <Form {...formItemLayout} >
                            <Row>
                                <Col span="12" offset="4">
                                    <Form.Item label="Age">
                                        <Input placeholder="Age" value={states.age} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="Gender">
                                        <Input placeholder="Gender" value={states.gender === "M" ? "MALE" : states.gender === "F" ? "FEMALE" : ""} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="Birthdate">
                                        <Input placeholder="Birthdate" value={states.lahir} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="Province">
                                        <Input placeholder="province" value={states.province} disabled={states.inputDisabled} onChange={(data) => handleChange({
                                            data: data.target.value,
                                            name: "province"
                                        })} />
                                    </Form.Item>
                                    <Form.Item label="City">
                                        <Input placeholder="City" value={states.regency} disabled={states.inputDisabled} onChange={(data) => handleChange({
                                            data: data.target.value,
                                            name: "regency"
                                        })} />
                                    </Form.Item>
                                    <Form.Item label="District">
                                        <Input placeholder="District" value={states.district} disabled={states.inputDisabled} onChange={(data) => handleChange({
                                            data: data.target.value,
                                            name: "district"
                                        })} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                </Col>
            </Row> */}
        </Card>
      </SWRConfig>
    </>
  );
};

const getSearch = async (data: any) => {
  let res = await fetch(`/api/couponcheck/${data}`);
  if (res.status !== 404) {
    let dataList = await res.json();
    return dataList;
  } else {
    return alert("Error 404");
  }
};

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
  const roleMaster = await masterRole();

  const data = {
    // list: getList
  };

  return {
    props: {
      fallback: {
        "/api/couponcheck": JSON.parse(JSON.stringify(data)),
      },
      data: JSON.parse(JSON.stringify(data)),
      master: {
        role: JSON.parse(JSON.stringify(roleMaster)),
      },
      columns: [],
      isLoading: false,
      openModal: false,
      modalType: "",
      dataModal: {},
      editData: "",
    },
  }
})

export default CouponCheck;

CouponCheck.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
