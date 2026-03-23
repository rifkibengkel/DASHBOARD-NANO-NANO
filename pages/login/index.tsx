import type { ReactElement } from "react";
import React, { useCallback } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/navigation";
import { getLoginSession } from "@/lib/auth";
import { NextApiRequest } from "next";
import { Form, Input, Button, Row, Col } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Image from "next/image";
import Logo from "@/public/img/redboxLogo.png";
import { getMenu } from "@api/menu/list";
// import { getMasterPromo } from 'pages/api/master';

// const { Option } = Select
const Login = () => {
  const router = useRouter();
  const login = useCallback(async (values: FormData): Promise<void> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.status === 200) {
        router.push("/login/redirect");
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("An unexpected error happened occurred:", error);
        alert(error.message);
      }
    }
  }, []);

  return (
    <>
      <Row
        style={{
          height: "100vh",
          textAlign: "center",
          backgroundColor: "#fff",
          backgroundImage: `url(/img/bg@2x-min.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        justify="center"
        align="middle"
      >
        <div className={"custom-form-card"}>
          {/* <Col xs={14} sm={12} md={10} lg={8} xl={6} style={{borderRadius: '10px'}}> */}
          <Row justify="center" align="middle">
            <Col span={16} style={{ padding: "1em" }}>
              <Image
                // style={{minWidth: '20px', maxWidth: '300px', paddingBottom: '50px', paddingTop: '50px'}}
                // width={200}
                alt={"background.png"}
                src={Logo}
              />
            </Col>
          </Row>
          <div style={{ marginBottom: "15px" }}>
            <h4>
              NANO NANO <b>DASHBOARD</b>
            </h4>
          </div>
          <div className={"custom-form"}>
            <Form
              name="normal_login"
              className="login-form"
              initialValues={{
                remember: true,
              }}
              onFinish={login}
            >
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your Username!",
                  },
                ]}
              >
                <Input
                  style={{ borderRadius: "8px" }}
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your Password!",
                  },
                ]}
              >
                <Input.Password
                  style={{ borderRadius: "8px" }}
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Password"
                />
              </Form.Item>
              {/* <Form.Item
                name="promoId"
                rules={[
                  {
                    required: true,
                    message: "Please select promo!",
                  },
                ]}
              >
                <Select
                  // options={states.master.prizes}
                  // value={states.prizeName}
                  // onChange={(e, { value, text }: any) =>
                  //   handleChange("prizeName", value)
                  // }
                  className={'custom-select'}
                  // style={{borderRadius: '4px'}}
                  placeholder="-- Select Promo --"
                >
                  {props.master.length > 0 ? props.master.map((idx: any, key: number) =>
                    (<Option key={key} value={idx.value}>{idx.label}</Option>)
                  ) : []}
                </Select>
              </Form.Item> */}
              <Form.Item>
                <Button
                  // style={{backgroundColor: 'rgb(3, 67, 36)',color:'#ffffff'}}
                  htmlType={"submit"}
                  className={"custom-button"}
                  // className="login-form-button"
                  // loading={isLoading}
                >
                  Log In
                </Button>
              </Form.Item>
            </Form>
          </div>
          {/* </Col> */}
        </div>
      </Row>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getLoginSession(ctx.req as NextApiRequest);

  interface IMenu {
    menu_header: number;
    menu: string;
    path: string;
    level: number;
    sub: number;
    icon: string | null;
    m_insert: number;
    m_delete: number;
    m_update: number;
    m_view: number;
  }

  // const masterPromo = await getMasterPromo()

  if (session) {
    const menus = (await getMenu(session)) as IMenu[];

    var path = "";
    for (let index = 0; index < menus.length; index++) {
      const nextSub = menus[index + 1] ? menus[index + 1].sub : "";
      if (menus[index].sub == 0 && nextSub == 0) {
        path = `${menus[index].path}`;
        break;
      }

      if (menus[index].sub == 0 && menus[index + 1].sub == 1) {
        path = `${menus[index + 1].path}`;
        break;
      }
    }

    return {
      redirect: {
        destination: path,
        permanent: false,
      },
      props: { session },
    };
  }

  return {
    props: {
      // master: JSON.parse(JSON.stringify(masterPromo))
    },
  };
};

export default Login;

Login.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};
