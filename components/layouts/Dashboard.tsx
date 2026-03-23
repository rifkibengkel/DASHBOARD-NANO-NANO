import React, { useReducer, useEffect } from "react";
import Link from "next/link";
import Space from "antd/lib/space";
import Dropdown from "antd/lib/dropdown";
import Avatar from "antd/lib/avatar";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Layout from "antd/lib/layout";
import Menu from "antd/lib/menu";
import Image from "next/image";
import Logo from "../../public/img/redboxLogo.png";
import LogoCollapsed from "../../public/img/redboxLogo.png";
import CustomIcon from "../CustomIcon";
import type { MenuProps } from "antd";
// import { useState } from "react";
// import { ConfigProvider, theme } from "antd";
import {
  UserOutlined,
  DownOutlined,
  // LogoutOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import Styles from "../../styles/Test.module.css";
import useSWR from "swr";
import { useRouter } from "next/router";
// import { CLEAR_FILTER } from '../../services/sessions.type';

const { Header, Sider, Content } = Layout;

const submenuKeys = ["/entstat", "/regstat"];

let initialState = {
  collapsed: true,
  isMobile: false,
  openKeys: [],
  menu: [],
  session: {
    name: "",
    email: "",
    role: "",
  },
};

const Anchor = ({ children }: any) => {
  // const { defaultAlgorithm, darkAlgorithm } = theme;
  // const [isDarkMode, setIsDarkMode] = useState(false);
  let router = useRouter();
  const [states, setStates] = useReducer(
    (state: any, newState: Partial<any>) => ({ ...state, ...newState }),
    initialState
  );
  const url = `/api/menu/list`;
  const { data, error } = useSWR(url);

  const items: MenuProps["items"] = [
    {
      key: 99,
      label: <Link href="/api/auth/logout">Logout</Link>,
    },
  ];

  // const menu = (
  //     <Menu>
  //     <Menu.Item key="99">
  //         <Link href="/api/auth/logout">
  //             Logout
  //         </Link>
  //     </Menu.Item>
  // </Menu>
  // );

  const onOpenChange = (keys: any) => {
    const latestOpenKey = keys.find(
      (key: any) => states.openKeys.indexOf(key) === -1
    );
    if (submenuKeys.indexOf(latestOpenKey) === -1) {
      setStates({ openKeys: keys });
    } else {
      setStates({ openKeys: latestOpenKey ? [latestOpenKey] : [] });
    }
  };

  const toggle = () => {
    setStates({ collapsed: !states.collapsed });
  };

  useEffect(() => {
    const decData = async () => {
      setStates({
        menu: data.data,
        session: {
          name: data.session.fullname,
          role: data.session.role,
        },
      });
    };

    if (data) {
      decData();
    }
  }, [data]);

  let currentPath: any = router.asPath;
  let activeKey = currentPath;

  useEffect(() => {
    window.innerWidth <= 600
      ? setStates({ collapsed: true, isMobile: true })
      : setStates({ collapsed: false, isMobile: false });
  }, []);

  let menuItems =
    states.menu?.length > 0
      ? states.menu.map((item: any, index: number) => {
          if (item.subMenu2 && item.subMenu2?.length > 0) {
            let submenus = item.subMenu2.map((item: any, index: number) => ({
              key: item.path,
              label: <Link href={item.path}>{item.menu}</Link>,
            }));
            return {
              label: item.menu,
              key: item.menu,
              icon: <CustomIcon type={item.icon} />,
              children: submenus,
            };
          }
          return {
            label: <Link href={item.path}>{item.menu}</Link>,
            icon: <CustomIcon type={item.icon} />,
            key: item.path,
          };
        })
      : [];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        className={"sider"}
        trigger={null}
        collapsible
        collapsed={states.collapsed}
      >
        <div className={"logoSider"}>
          <Image
            width={states.collapsed ? 30 : 60}
            height={states.collapsed ? 25.25 : 50}
            alt="Promo Logo"
            src={states.collapsed ? LogoCollapsed : Logo}
          />
        </div>
        <Menu
          className={"sidebar"}
          mode="inline"
          defaultSelectedKeys={["0"]}
          openKeys={states.openKeys}
          onOpenChange={onOpenChange}
          selectedKeys={activeKey}
          items={menuItems}
        />
      </Sider>
      <Layout className={Styles.siteLayout}>
        <Header
          // className={Styles.siteLayoutBackground}
          // className="bg-header"
          style={{
            background: "transparent",
            paddingLeft: 0,
            paddingRight: 20,
            boxShadow: "0px 0px 0px #00000005",
          }}
        >
          <Row justify="space-between">
            <Space
              size={0}
              className="menu-bar"
              style={{ marginLeft: "-5px", marginTop: "2px" }}
            >
              {React.createElement(
                states.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: `${Styles.trigger} button-side`,
                  onClick: toggle,
                }
              )}
              {!states.isMobile || (states.isMobile && states.collapsed) ? (
                <h5
                  style={{
                    fontSize: "12px",
                    marginLeft: -10,
                    marginTop: "2px",
                  }}
                >
                  PETUALANG - NANO NANO{" "}
                  <b style={{ marginLeft: "4px" }}>DASHBOARD</b>
                  {/* (
                  {data?.promoName ? data?.promoName : ""}) */}
                </h5>
              ) : null}
            </Space>
            <Space>
              <Space></Space>
              <Row align="middle">
                <Dropdown menu={{ items }}>
                  <a
                    style={{ marginTop: -5 }}
                    className={"flexCenter"}
                    onClick={(e) => e.preventDefault()}
                  >
                    <Avatar
                      className="hiden-m"
                      size={32}
                      style={{
                        color: "rgb(121 121 121)",
                        backgroundColor: "rgb(120 120 120 / 27%)",
                      }}
                      icon={<UserOutlined style={{ fontSize: "18px" }} />}
                    />
                    <Col style={{ marginLeft: 10, marginRight: 15 }}>
                      <h5
                        style={{
                          color: "black",
                          fontWeight: "normal",
                          lineHeight: "normal",
                          marginBottom: 0,
                        }}
                      >
                        {states.session.name}
                      </h5>
                      <h5
                        className={"link"}
                        style={{
                          lineHeight: "normal",
                          fontWeight: "normal",
                          marginBottom: 0,
                        }}
                      >
                        {states.session.role}
                      </h5>
                    </Col>
                    <DownOutlined
                      style={{ color: "#118891", fontSize: "12px" }}
                    />
                  </a>
                </Dropdown>
              </Row>
            </Space>
          </Row>
        </Header>
        <Content className={"content"}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default React.memo(Anchor);
