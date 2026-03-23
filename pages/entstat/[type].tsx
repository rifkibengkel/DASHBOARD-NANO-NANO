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
import { getInvalidReasonSummary, masterRole } from "@/pages/api/master";
import { GetServerSideProps } from "next";

import dayjs from "dayjs";
import { StatState } from "@/interfaces/dashboard.interface";
import { withAuth } from "@/components/authHOC";
const { TabPane } = Tabs;

const SummaryData = dynamic(() => import("@/components/SummaryData"), {
  loading: () => <p>Loading...</p>,
});
const SummaryStatus = dynamic(() => import("@/components/SummaryStatus"), {
  loading: () => <p>Loading...</p>,
});
const ModalFilter = dynamic(() => import("@/components/DataFilter"), {
  loading: () => <p></p>,
});

const EntryStatistics = (props: any) => {
  const router = useRouter();
  const [states, setStates] = useReducer(
    (state: StatState, newState: Partial<StatState>) => ({
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
    `/api/dashboard/entries?subtract=0&type=${states.type}&startDate=${states.startDate}&endDate=${states.endDate}&monthYear=${states.monthYear}&condition=${router.query.type}`
  );
  const {
    data: arrayEntriesStat,
    error: errorEntriesStat,
    isValidating: isLoadingEntriesStat,
  } = useSWR(
    `/api/dashboard/entriesStatus?subtract=0&type=${states.type}&startDate=${states.startDate}&endDate=${states.endDate}&monthYear=${states.monthYear}&condition=${router.query.type}`
  );
  // console.log(arrayEntriesStat, "111111111111111");

  const dynamicRoute = useRouter().asPath;
  useEffect(() => setStates(props), [dynamicRoute]);

  const titleCtrl = (x: any) => {
    return x.charAt(0).toUpperCase() + x.slice(1);
  };

  const handleOpenModal = (data: any) => {
    setStates({
      [data.name]: data.value,
    });
  };

  const handleFilter = (data: any) => {
    setStates({
      startDate: data.startDate,
      endDate: data.endDate,
      type: "all",
      condition: router.query.type,
      modalFilter: false,
    });
  };

  let mediaUsed = arrayEntries ? arrayEntries.mediaUsed : 0;
  let columnsUsed = arrayEntries ? arrayEntries.columnsUsed : [];

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

  return (
    <>
      <Row justify={"end"}>
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
      </Row>
      <Row>
        <Col span={24}>
          <Tabs defaultActiveKey="1" style={{ color: "#1890FF" }}>
            <TabPane tab="Summary Data" key="1">
              <SummaryData
                isLoading={isLoadingEntries}
                title={`${titleCtrl(router.query.type)} Entry Statistics ${
                  router.query.type === "hourly"
                    ? `(${dayjs(states.endDate).format("DD MMMM YYYY")})`
                    : ""
                }`}
                mediaUsed={mediaUsed}
                columnsUsed={columnsUsed}
                series={dataSeriesEntries}
                categories={
                  arrayEntries !== undefined ? arrayEntries.categories : ""
                }
                dataTable={arrayEntries !== undefined ? arrayEntries.data : ""}
                total={arrayEntries !== undefined ? arrayEntries.total : ""}
              />
            </TabPane>
            <TabPane tab="Summary Status" key="2">
              <SummaryStatus
                chartInvalidReason={
                  arrayEntriesStat ? arrayEntriesStat.chart.invalidReason : ""
                }
                chartValidInvalid={
                  arrayEntriesStat ? arrayEntriesStat.chart.validInvalid : ""
                }
                dataTable={arrayEntriesStat ? arrayEntriesStat.data : ""}
                reasons={states.master.entriesRsn}
              />
            </TabPane>
          </Tabs>
        </Col>
      </Row>
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
  const getInvalidRsnSum = await getInvalidReasonSummary();

  let date = new Date();
  return {
    props: {
      // fallback: {
      //     '/api/dashboard/entries': JSON.parse(JSON.stringify(data))
      // },
      master: {
        role: JSON.parse(JSON.stringify(roleMaster)),
        entriesRsn: JSON.parse(JSON.stringify(getInvalidRsnSum)),
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
      modalFilter: false,
    },
  };
});

export default EntryStatistics;

EntryStatistics.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
