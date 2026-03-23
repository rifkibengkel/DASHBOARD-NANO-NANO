import React, { useReducer, useEffect } from "react";
import type { ReactElement } from "react";
import DashboardLayout from "@/components/layouts/Dashboard";
import { PageHeader } from "@ant-design/pro-layout";
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Input from "antd/lib/input";
import Form from "antd/lib/form";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import { IState } from "@/interfaces/promosettings.interface";
import { masterRole } from "../../api/master/index";
import { useRouter } from "next/router";
import { SWRConfig } from "swr";
import { GetServerSideProps } from "next";
import { useApp } from "@/context/AppContext";
import Notifications from "@/components/Notifications";
import { withAuth } from "@/components/authHOC";

const { Search } = Input;

const KTP = (props: any, { fallback }: any) => {
  const router = useRouter();
  const { statesContex, setSubmitNotif } = useApp();
  const [states, setStates] = useReducer(
    (state: IState, newState: Partial<IState>) => ({ ...state, ...newState }),
    props
  );

  const handleEnter = (data: any) => {
    setStates({ ktp: data.data });
    handleSearchKtp(data.data);
  };

  const handleSearchKtp = async (data: any) => {
    const res = await getSearchKtp(data);
    if (!res?.error && res.status !== 404) {
      const region = res.region;
      const date = res.date;
      setStates({
        regionCode: region.districtCode,
        province: region.province,
        regency: region.regency,
        district: region.district,
        age: date.age,
        gender: date.gender,
        lahir: date.lahir,
        ktpValid: res.isValid,
        ktp: data,
      });
    }
  };

  const handleChangeKtp = async (data: { name: string; data: string }) => {
    const value = data?.data?.toString()?.replace(/[^0-9]/g, "") || "";
    const name = data?.name?.toString() || "";
    if (value.length <= 16) {
      setStates({ [name]: value });
    }
    if (value.length < 16 && states.regionCode !== "") {
      setStates({
        regionCode: "",
        province: "",
        regency: "",
        age: "",
        gender: "",
        lahir: "",
        district: "",
        ktpValid: false,
      });
    }
    if (value?.length === 16) {
      await handleSearchKtp(value);
    }
  };

  const handleSubmit = async () => {
    const res = await addRegion({
      province: states?.province.toUpperCase() || "",
      regency: states?.regency.toUpperCase() || "",
      district: states?.district.toUpperCase() || "",
      code: states?.regionCode?.toUpperCase() || "",
    });
    await alert("success");
  };

  const handleChange = (data: any) => {
    if (states.submitDisabled) {
      setStates({ submitDisabled: false });
    }
    setStates({ [data.name]: data.data });
  };

  // useEffect(() => {
  //     if (arrayKTP) {
  //         setStates({
  //             isLoading: false,
  //             data: {
  //                 ...states.data,
  //                 list: arrayKTP,
  //                 key: states.data.key ? states.data.key : ""
  //             }
  //         })
  //     }
  //   }, [arrayKTP])

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
          title="KTP"
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
          title="KTP Details and Description"
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
            <Col style={{ marginTop: "3em" }} span="24">
              <Form layout="inline">
                <Form.Item>
                  <Input
                    value={states.ktp}
                    type="text"
                    placeholder="Code KTP"
                    onChange={(data: any) =>
                      handleChangeKtp({
                        data: data.target.value,
                        name: "ktp",
                      })
                    }
                  />
                </Form.Item>
                <Form.Item>
                  {/* <Button type="link" shape="circle" icon={<SearchOutlined />} /> */}
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col span="24">
              {/* <Card bordered={false}> */}
              <Form {...formItemLayout}>
                <Row>
                  <Col span="12" offset="4">
                    <Form.Item label="Age">
                      <Input placeholder="Age" value={states.age} readOnly />
                    </Form.Item>
                    <Form.Item label="Gender">
                      <Input
                        placeholder="Gender"
                        value={
                          states.gender === "M"
                            ? "MALE"
                            : states.gender === "F"
                            ? "FEMALE"
                            : ""
                        }
                        readOnly
                      />
                    </Form.Item>
                    <Form.Item label="Birthdate">
                      <Input
                        placeholder="Birthdate"
                        value={states.lahir}
                        readOnly
                      />
                    </Form.Item>
                    <Form.Item label="Province">
                      <Input
                        placeholder="province"
                        value={states.province}
                        disabled={states.inputDisabled}
                        onChange={(data) =>
                          handleChange({
                            data: data.target.value,
                            name: "province",
                          })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="City">
                      <Input
                        placeholder="City"
                        value={states.regency}
                        disabled={states.inputDisabled}
                        onChange={(data) =>
                          handleChange({
                            data: data.target.value,
                            name: "regency",
                          })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="District">
                      <Input
                        placeholder="District"
                        value={states.district}
                        disabled={states.inputDisabled}
                        onChange={(data) =>
                          handleChange({
                            data: data.target.value,
                            name: "district",
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span="12" offset="11">
                    <Button
                      className={"button-action-app"}
                      shape="round"
                      disabled={states?.ktp?.length === 16 ? false : true}
                      onClick={handleSubmit}
                      type="primary"
                    >
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Form>
              {/* </Card> */}
            </Col>
          </Row>
        </Card>
      </SWRConfig>
    </>
  );
};

const addRegion = async (data: {
  province: string;
  district: string;
  regency: string;
  code: string;
}) => {
  try {
    let res = await fetch("/api/promosettings/ktp/addRegion", {
      method: "POST",
      body: JSON.stringify({
        data: data,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.status >= 400) {
      throw new Error("error");
    }
    const content = await res.json();
    return content;
  } catch (error) {
    return alert("Failed to add region");
  }
};

const getSearchKtp = async (data: any) => {
  let res = await fetch(`/api/promosettings/ktp/${data}`);
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
        "/api/promosettings/ktp/list": JSON.parse(JSON.stringify(data)),
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
  };
});

export default KTP;

KTP.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
