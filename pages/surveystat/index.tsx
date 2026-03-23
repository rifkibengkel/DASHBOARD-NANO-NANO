import React, { useReducer, useEffect } from "react";
import type { ReactElement } from 'react'
import DashboardLayout from "@/components/layouts/Dashboard";
import dynamic from "next/dynamic";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import useSWR from "swr";
import { useRouter } from "next/router";
import { masterRole } from "@/pages/api/master";
import { GetServerSideProps } from 'next';
import { getData } from "@api/dashboard/survey/list";
import { StatState } from "@/interfaces/dashboard.interface";
import { withAuth } from "@/components/authHOC";
import { PageHeader } from '@ant-design/pro-layout'
import Button from "antd/lib/button";

const SummaryData = dynamic(() => import("@/components/SummaryDataV2"), { loading: () => <p>Loading...</p> });

const SurveyStatistics = (props: any) => {
  const [states, setStates] = useReducer((state: StatState, newState: Partial<StatState>) => ({ ...state, ...newState }), props)
  const { data: arrayEntries, error: errorEntries, isValidating: isLoadingEntries } = useSWR(`/api/dashboard/survey/${states.surveyId}`)
  const dynamicRoute = useRouter().asPath;
  useEffect(() => setStates(props), [dynamicRoute]);

  const expSurvey = async () => {
    exportSurvey()
}
  
  let mediaUsed = arrayEntries ? arrayEntries.mediaUsed : 0
  let columnsUsed = arrayEntries ? arrayEntries.columnsUsed : []

  return (
    <>
    <PageHeader
                    title="Survey Statistics"
                    extra={[
                        // states.access.m_insert == 1 ?
                        <Row key="1">
                            <Col style={{ marginRight: '1em' }}>
                                <Button
                                    onClick={expSurvey}
                                    className={'button'}
                                    shape="round"
                                >
                                    Export
                                </Button>
                            </Col>
                        </Row>
                        //  : null
                    ]}
                />
      <Row>
        <Col span={24}>
          <SummaryData
            setSurveyId={(e: any) => setStates({surveyId: e})}
            questions={states.master.questions}
            isLoading={isLoadingEntries}
            title={`Survey Statistics`}
            mediaUsed={mediaUsed}
            totalSubmit={arrayEntries?.totalSubmit}
            columnsUsed={columnsUsed}
            series={[
              {
                  name: `Answer Submitted`,
                  data: arrayEntries !== undefined
                  ? arrayEntries.series
                  : [0]
              }
          ]}
            categories={
              arrayEntries !== undefined
                ? arrayEntries.categories
                : ['Answer']
            }
          />
        </Col>
      </Row>
    </>
  );
}

const exportSurvey = async () => {
  await window.open(`/api/dashboard/survey/export`)
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
  const roleMaster = await masterRole();

  const surveyQuestion = await getData()

  return {
    props: {
      // fallback: {
      //     '/api/dashboard/entries': JSON.parse(JSON.stringify(data))
      // },
      master: {
        role: JSON.parse(JSON.stringify(roleMaster)),
        questions: JSON.parse(JSON.stringify(surveyQuestion)),
      },
      columns: [],
      isLoading: false,
      surveyId: 0
    }
  }
})

export default SurveyStatistics;

SurveyStatistics.getLayout = function getLayout(page: ReactElement) {
  return (
    <DashboardLayout>{page}</DashboardLayout>
  )
}