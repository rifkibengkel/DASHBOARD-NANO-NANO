import React, { useReducer, useEffect } from "react";
import type { ReactElement } from "react";
import DashboardLayout from "@/components/layouts/Dashboard";
import dynamic from "next/dynamic";
import Tabs from "antd/lib/tabs";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import Button from "antd/lib/button";
import useSWR from "swr";
import { useRouter } from "next/router";
import { masterRole } from "@/pages/api/master";
import { GetServerSideProps } from "next";
import dayjs from "dayjs";
import { StatState } from "@/interfaces/dashboard.interface";
import AreaChart from "@/components/charts/AreaChart";
import Table from "@/pageComponents/RegStat/Table";
import { withAuth } from "@/components/authHOC";
const ModalFilter = dynamic(() => import("@/components/DataFilter"), {
  loading: () => <p></p>,
});
const { TabPane } = Tabs;

const RegStatistics = (props: any) => {
  const router = useRouter();
  const [states, setStates] = useReducer(
    (state: StatState, newState: Partial<StatState>) => ({
      ...state,
      ...newState,
    }),
    props
  );

  const titleCtrl = (x: any) => {
    return x.charAt(0).toUpperCase() + x.slice(1);
  };

  const {
    data: arrayProfiles,
    error: errorProfiles,
    isValidating: isLoadingProfiles,
  } = useSWR(
    `/api/dashboard/profiles?subtract=0&type=${states.type}&startDate=${states.startDate}&endDate=${states.endDate}&monthYear=${states.monthYear}&condition=${router.query.type}`
  );

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

  const handleFilter = (data: any) => {
    setStates({
      startDate: data.startDate,
      endDate: data.endDate,
      type: "all",
      condition: router.query.type,
      modalFilter: false,
    });
  };

  const handleOpenModal = (data: any) => {
    setStates({
      [data.name]: data.value,
    });
  };

  return (
    <>
      <Row justify={"end"}>
        <Col>
          <Col>
            {router.query.type === "daily" || router.query.type === "hourly" ? (
              <Button
                className={"button"}
                shape="round"
                style={{ marginTop: "20px" }}
                onClick={() =>
                  handleOpenModal({
                    name: "modalFilter",
                    value: true,
                  })
                }
              >
                Filter
              </Button>
            ) : null}
          </Col>
        </Col>
      </Row>
      <Tabs defaultActiveKey="1" style={{ color: "#1890FF" }}>
        <TabPane tab="Summary Data" key="1">
          <Row justify="space-around">
            <Col xs={24} xl={24}>
              <AreaChart
                title={`${titleCtrl(router.query.type)} Entry Statistics`}
                // series={
                //   arrayProfiles !== undefined
                //     ? [
                //         {
                //           name: "Registration Total",
                //           data: arrayProfiles.seriesAll,
                //         },
                //       ]
                //     : [
                //         {
                //           name: "Registration Total",
                //           data: [0],
                //         },
                //       ]
                // }
                series={dataSeriesProfiles}
                categories={
                  arrayProfiles !== undefined ? arrayProfiles.categories : ""
                }
              />
            </Col>

            <Col xs={24} xl={24}>
              <Table
                isLoading={isLoadingProfiles}
                data={arrayProfiles ? arrayProfiles.data : []}
                total={arrayProfiles ? arrayProfiles.totalProfile : 0}
                totalMedia={arrayProfiles ? arrayProfiles.totalMedia : 0}
                medias={mediaSeriesActive}
              />
            </Col>
          </Row>
        </TabPane>
      </Tabs>
      <ModalFilter
        tgt={"entstat"}
        header={"Filter Statistics"}
        open={states.modalFilter}
        handleOpenModal={handleOpenModal}
        handleFilter={handleFilter}
        master={states.master}
        filter={{
          startDate: states.startDate,
          endDate: states.endDate,
        }}
        // filterType={router.query.type}
      />
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
        store: [],
      },
      columns: [],
      isLoading: false,
      startDate: dayjs(date.setDate(date.getDate() - 365)).format("YYYY-MM-DD"),
      endDate: dayjs().format("YYYY-MM-DD"),
      monthYear: dayjs().format("YYYY-MM"),
      type: "all",
      condition: ctx.query.type,
      media: "all",
    },
  };
});

export default RegStatistics;

RegStatistics.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
