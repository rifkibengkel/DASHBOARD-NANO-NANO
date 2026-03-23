import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Card from "antd/lib/card";
import Skeleton from "antd/lib/skeleton";
import Statistic from "antd/lib/statistic";
import AreaChart from "@/components/charts/AreaChart";
import PieChart from "@/components/charts/PieChart";
import { useReducer } from "react";
import type { ReactElement } from "react";
import { GetServerSideProps } from "next";
import DashboardLayout from "@/components/layouts/Dashboard";
import { InitState } from "@/interfaces/dashboard.interface";
import dayjs from "dayjs";
import { masterRole } from "@api/master";
import useSWR from "swr";
import { withAuth } from "@/components/authHOC";

const Dashboard = (props: any) => {
  const [states, setStates] = useReducer(
    (state: InitState, newState: Partial<InitState>) => ({
      ...state,
      ...newState,
    }),
    props
  );

  const {
    data: arrayEntries,
    error: errorEntries,
    isValidating: isLoadingEntries,
  } = useSWR(
    `/api/dashboard/entries?subtract=0&type=${states.filter1.type}&startDate=${states.filter1.startDate}&endDate=${states.filter1.endDate}&monthYear=${states.filter1.monthYear}&condition=${states.filter1.condition}`
  );

  const {
    data: arrayProfiles,
    error: errorProfiles,
    isValidating: isLoadingProfiles,
  } = useSWR(
    `/api/dashboard/profiles?subtract=0&type=${states.filter2.type}&startDate=${states.filter2.startDate}&endDate=${states.filter2.endDate}&monthYear=${states.filter2.monthYear}&condition=${states.filter2.condition}`
  );

  const {
    data: arrayDemo,
    error: errorDemo,
    isValidating: isLoadingDemo,
  } = useSWR(`/api/dashboard/demographics?type=chart&media=`);

  const {
    data: arrDist,
    error: errorDist,
    isValidating: isLoadingDist,
  } = useSWR(
    `/api/dashboard/distribution?row=10&page=1&startDate=&media=&endDate=&key=&column=&type=1&direction=&subtract=0`
  );

  let summarySeriesActive =
    arrayEntries === undefined
      ? []
      : arrayEntries.summarySeriesActive === undefined ||
        arrayEntries.summarySeriesActive.length < 1
      ? []
      : arrayEntries.summarySeriesActive;
  let dataSeriesEntries = summarySeriesActive.map((item: any, i: any) => {
    if (
      arrayEntries.summarySeriesActive !== undefined ||
      arrayEntries.summarySeriesActive.length > 0
    ) {
      return {
        name: `Entries by ${item.name}`,
        data: arrayEntries[`${item.graph}`],
      };
    } else {
      return {
        name: `Entries by ${item.name}`,
        data: [0],
      };
    }
  });

  let mediaSeriesActive =
    arrayProfiles === undefined
      ? []
      : arrayProfiles.mediaSeriesActive === undefined ||
        arrayProfiles.mediaSeriesActive.length < 1
      ? []
      : arrayProfiles.mediaSeriesActive;

  let dataSeriesProfiles = mediaSeriesActive.map((item: any, i: any) => {
    if (
      arrayProfiles.mediaSeriesActive !== undefined ||
      arrayProfiles.mediaSeriesActive.length > 0
    ) {
      return {
        name: `Profiles by ${item.name}`,
        data: arrayProfiles[`${item.graph}`],
      };
    } else {
      return {
        name: `Profiles by ${item.name}`,
        data: [0],
      };
    }
  });

  const entriesTabList = [
    // {
    //   key: 'hourly',
    //   tab: 'Hourly',
    // },
    {
      key: "daily",
      tab: "Daily",
    },
    {
      key: "weekly",
      tab: "Weekly",
    },
    {
      key: "monthly",
      tab: "Monthly",
    },
  ];

  const tabList = [
    {
      key: "daily",
      tab: "Daily",
    },
    {
      key: "weekly",
      tab: "Weekly",
    },
    {
      key: "monthly",
      tab: "Monthly",
    },
  ];

  let date = new Date();
  return (
    <>
      <h4 style={{ marginTop: 10 }}>Periode Promo: </h4>
      <h2 style={{ marginBottom: 33 }}>
        {`
           ${
             arrayEntries === undefined
               ? "N/A"
               : dayjs(arrayEntries?.periode?.startDate).format(
                   "D MMMM YYYY HH:mm"
                 )
           }
            - 
            ${
              arrayEntries === undefined
                ? "N/A"
                : dayjs(arrayEntries?.periode?.endDate).format(
                    "D MMMM YYYY HH:mm"
                  )
            }`}
      </h2>

      <Skeleton active loading={false}>
        <Row gutter={20} justify="center" style={{ marginBottom: "0px" }}>
          <Col xs={24} xl={8} md={8}>
            <Card>
              <Statistic
                title="User Registered"
                value={
                  arrayProfiles !== undefined ? arrayProfiles.totalProfile : "-"
                }
                loading={isLoadingProfiles}
                // precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} xl={8} md={8}>
            <Card>
              <Statistic
                title="Unique Consumer (Valid Only)"
                value={arrDist !== undefined ? arrDist.totalUniqueValid : "-"}
                loading={isLoadingDist}
                // precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} xl={8} md={8}>
            <Card>
              <Statistic
                title="Total Entries"
                value={
                  arrayEntries !== undefined ? arrayEntries.totalEntries : "-"
                }
                loading={isLoadingEntries}
                // precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} xl={12} md={12}>
            <Card>
              <Statistic
                title="Total Valid"
                value={
                  arrayEntries !== undefined
                    ? Number(arrayEntries.totalValid) +
                      Number(arrayEntries.totalUnlucky)
                    : "-"
                }
                loading={isLoadingEntries}
                // precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} xl={12} md={12}>
            <Card>
              <Statistic
                title="Total Invalid"
                value={
                  arrayEntries !== undefined ? arrayEntries.totalInvalid : "-"
                }
                loading={isLoadingEntries}
                // precision={2}
              />
            </Card>
          </Col>

          {/* <Col xs={24} xl={8}>
                        <Card>
                            <Statistic
                                title="Coupon Used Percentage"
                                value={arrayDemo !== undefined ? arrayDemo.couponPercentage : 0}
                                suffix="%"
                                precision={5}
                            />
                        </Card>
                    </Col> */}

          {/* <Col xs={24} xl={8}>
                        <Card>
                            <Statistic
                                title="User Registered (Whatsapp)"
                                value={arrayProfiles !== undefined ?
                                    arrayProfiles.totalWA : '-'}
                                loading={isLoadingProfiles}
                            // precision={2}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} xl={8}>
                        <Card>
                            <Statistic
                                title="User Registered (Mobile App)"
                                value={arrayProfiles !== undefined ?
                                    arrayProfiles.totalAPPS : '-'}
                                loading={isLoadingProfiles}
                            // precision={2}
                            />
                        </Card>
                    </Col> */}

          {/* <Col xs={24} xl={8}>
                        <Card>
                            <Statistic
                                title="Total Valid (Whatsapp)"
                                value={arrayEntries !== undefined ?
                                    Number(arrayEntries.totalValidWa) : '-'}
                                loading={isLoadingEntries}
                            // precision={2}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} xl={8}>
                        <Card>
                            <Statistic
                                title="Total Valid (Mobile App)"
                                value={arrayEntries !== undefined ?
                                    Number(arrayEntries.totalValidApp) : '-'}
                                loading={isLoadingEntries}
                            // precision={2}
                            />
                        </Card>
                    </Col> */}

          {/* <Col xs={24} xl={6}>
                        <Card>
                            <Statistic
                                title="Current E-Voucher Winner"
                                value={arrayEntries !== undefined ?
                                    arrayEntries.current100 + '/' + arrayEntries.max100  : '-'}
                                loading={isLoadingEntries}
                            // precision={2}
                            />
                        </Card>
                    </Col> */}
          {/* <Col xs={24} xl={8} >
                        <Card>
                            <Statistic
                                title="Total Invalid (Whatsapp)"
                                value={arrayEntries !== undefined ?
                                    arrayEntries.totalInvalidWa : '-'}
                                loading={isLoadingEntries}
                            // precision={2}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} xl={8} >
                        <Card>
                            <Statistic
                                title="Total Invalid (Mobile App)"
                                value={arrayEntries !== undefined ?
                                    arrayEntries.totalInvalidApp : '-'}
                                loading={isLoadingEntries}
                            // precision={2}
                            />
                        </Card>
                    </Col> */}
        </Row>
      </Skeleton>
      <Row gutter={20} justify="center" style={{ marginBottom: "0px" }}>
        <Col xs={24} md={16} sm={16} className="mobile-chart-bottom">
          <Card
            // hoverable
            // loading={isLoading}
            size={"small"}
            // title="Entries"
            tabList={entriesTabList}
            activeTabKey={states.key1}
            onTabChange={(key) =>
              setStates(
                key === "daily"
                  ? {
                      key1: key,
                      filter1: {
                        startDate: dayjs(
                          date.setDate(date.getDate() - 365)
                        ).format("YYYY-MM-DD"),
                        endDate: dayjs().format("YYYY-MM-DD"),
                        type: "chart",
                        monthYear: "",
                        media: "",
                        condition: key,
                      },
                    }
                  : {
                      key1: key,
                      filter1: {
                        startDate: dayjs(
                          date.setDate(date.getDate() - 365)
                        ).format("YYYY-MM-DD"),
                        endDate: dayjs().format("YYYY-MM-DD"),
                        media: "",
                        monthYear: dayjs().format("YYYY-MM"),
                        type: "chart",
                        condition: key,
                      },
                    }
              )
            }
          >
            <Skeleton active loading={isLoadingEntries}>
              <AreaChart
                title={"Incoming Entries Statistic"}
                series={dataSeriesEntries}
                categories={
                  arrayEntries !== undefined ? arrayEntries.categories : []
                }
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} md={8} sm={8}>
          <Card hoverable size={"small"}>
            <Skeleton active loading={isLoadingDemo}>
              <PieChart
                series={arrayDemo !== undefined ? arrayDemo.seriesAge : []}
                categories={
                  arrayDemo !== undefined ? arrayDemo.categoriesAge : []
                }
                title={"Profiles by Age"}
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>
      <Row gutter={20} justify="center">
        <Col xs={24} md={8} sm={8} className="mobile-chart-bottom">
          <Card hoverable size={"small"}>
            <Skeleton active loading={isLoadingDemo}>
              <PieChart
                series={arrayDemo !== undefined ? arrayDemo.seriesGender : []}
                categories={
                  arrayDemo !== undefined ? arrayDemo.categoriesGender : []
                }
                title={"Profiles by Gender"}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} md={16} sm={16}>
          <Card
            // hoverable
            size={"small"}
            tabList={tabList}
            activeTabKey={states.key2}
            onTabChange={(key) =>
              setStates({
                key2: key,
                filter2: {
                  startDate: dayjs(date.setDate(date.getDate() - 365)).format(
                    "YYYY-MM-DD"
                  ),
                  endDate: dayjs().format("YYYY-MM-DD"),
                  type: "chart",
                  condition: key,
                  media: "",
                  monthYear: "",
                },
              })
            }
          >
            <Skeleton active loading={isLoadingProfiles}>
              <AreaChart
                title={"Total Profiles Registered"}
                series={dataSeriesProfiles}
                categories={
                  arrayProfiles !== undefined ? arrayProfiles.categories : []
                }
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>
      {/* <Row gutter={20} style={{ marginBottom: "15px" }}>
        <Col xs={24} md={8} sm={10} className="mobile-chart-bottom">
          <Card hoverable size={"small"}>
            <Skeleton active loading={isLoadingDemo}>
              <PieChart
                series={arrayDemo !== undefined ? arrayDemo.seriesGender : []}
                categories={
                  arrayDemo !== undefined ? arrayDemo.categoriesGender : []
                }
                title={"Profiles by Gender"}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} md={16} sm={14}>
          <Card
            // hoverable
            size={"small"}
            tabList={tabList}
            activeTabKey={states.key2}
            onTabChange={(key) =>
              setStates({
                key2: key,
                filter2: {
                  startDate: dayjs(date.setDate(date.getDate() - 365)).format(
                    "YYYY-MM-DD"
                  ),
                  endDate: dayjs().format("YYYY-MM-DD"),
                  type: "chart",
                  condition: key,
                  media: "",
                  monthYear: "",
                },
              })
            }
          >
            <Skeleton active loading={isLoadingProfiles}>
              <AreaChart
                title={"Total Profiles Registered"}
                series={dataSeriesProfiles}
                categories={
                  arrayProfiles !== undefined ? arrayProfiles.categories : []
                }
              />
            </Skeleton>
          </Card>
        </Col>
      </Row> */}
      {/* <Row justify="center">
                <Col xs={24} xl={10}>
                    <Card
                        hoverable
                        size={"small"}
                        style={{ margin: '10px 10px' }}
                    >
                        <Skeleton active
                            loading={isLoadingDemo}
                        >
                            <PieChart
                                series={
                                    arrayDemo !== undefined
                                        ? arrayDemo.seriesProfession
                                        : []
                                }
                                categories={
                                    arrayDemo !== undefined
                                        ? arrayDemo.categoriesProfession
                                        : []
                                }
                                title={"Profiles by Profession"}
                            />
                        </Skeleton>
                    </Card>
                </Col>
                </Row> */}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
  const roleMaster = await masterRole();

  let date = new Date();
  return {
    props: {
      // fallback: {
      //     '/api/dashboard/entries': JSON.parse(JSON.stringify(data))
      // },
      master: {
        role: JSON.parse(JSON.stringify(roleMaster)),
      },
      columns: [],
      isLoading: false,
      key1: "daily",
      key2: "daily",
      filter1: {
        startDate: "",
        endDate: "",
        monthYear: dayjs().format("YYYY-MM"),
        type: "chart",
        condition: "daily",
        media: "all",
      },
      filter2: {
        startDate: dayjs(date.setDate(date.getDate() - 365)).format(
          "YYYY-MM-DD"
        ),
        endDate: dayjs().format("YYYY-MM-DD"),
        monthYear: dayjs().format("YYYY-MM"),
        type: "chart",
        condition: "daily",
        media: "all",
      },
    },
  };
});

export default Dashboard;

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
