import type { ReactElement } from 'react';
import React, { useReducer, useEffect } from "react";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import Tabs from "antd/lib/tabs";
import useSWR from "swr";
import { DemoState } from "@/interfaces/dashboard.interface";
import DashboardLayout from "../../components/layouts/Dashboard";
import dayjs from "dayjs";
import { masterRole } from "../api/master/index";
import { GetServerSideProps } from 'next'
import { getData } from "../api/dashboard/distribution";
import { getData as getData2 } from "../api/dashboard/distributionProvince";
import Radio from "antd/lib/radio";
import Demo from "@/pageComponents/Demographics/Demo"
import Distribution from "@/pageComponents/Demographics/Distribution"
import DistributionProvince from "@/pageComponents/Demographics/DistributionProvince"
import { withAuth } from '@/components/authHOC';

const { TabPane } = Tabs;

const Demographics = (props: any) => {
  const [states, setStates] = useReducer((state: DemoState, newState: Partial<DemoState>) => ({ ...state, ...newState }), props)

  const { data: arrDemo, error: errorDemo, isValidating: isLoadingDemo } = useSWR(`/api/dashboard/demographics?type=${states.type}&media=${states.media}&status=${states.status}`)

  const { data: arrDist, error: errorDist, isValidating: isLoadingDist } = useSWR(`/api/dashboard/distribution?row=${states.data.dataPerPage}&page=${states.data.currentPage}&startDate=${states.filter.startDate}&media=${states.filter.media}&endDate=${states.filter.endDate}&key=${states.filter.key}&column=${states.filter.column}&type=1&direction=${states.filter.direction}&subtract=0`)

  const { data: arrDist2, error: errorDist2, isValidating: isLoadingDist2 } = useSWR(`/api/dashboard/distributionProvince?row=${states.data2.dataPerPage}&page=${states.data2.currentPage}&startDate=${states.filter2.startDate}&media=${states.filter2.media}&endDate=${states.filter2.endDate}&key=${states.filter2.key}&column=${states.filter2.column}&type=1&direction=${states.filter2.direction}&subtract=0`)

  const changeMedia = (data: any) => {
    setStates({ media: data });
  };

  const changeStatus = (data: any) => {
    setStates({ status: data });
  };

  const handleFilterDistribution = (data: any) => {
    setStates({
      data: {
        ...states.data,
        dataPerPage: data.rowsPerPage,
        currentPage: data.page
      },
      filter: {
        ...states.filter,
        column: data.column,
        direction: data.direction
      }
    })
  }

  const handleFilterDistribution2 = (data: any) => {
    setStates({
      data2: {
        ...states.data2,
        dataPerPage: data.rowsPerPage,
        currentPage: data.page
      },
      filter2: {
        ...states.filter2,
        column: data.column,
        direction: data.direction
      }
    })
  }

  useEffect(() => {
    if (arrDist) {
        setStates({
            isLoading: false,
            data: {
                ...states.data,
                // dataPerPage: arrDist.dataPerPage,
                // currentPage: arrDist.currentPage,
                // totalData: arrDist.totalData,
                // totalPage: arrDist.totalPage,
                list: arrDist,
                key: states.data.key ? states.data.key : ""
            }
        })
    }
}, [arrDist])

useEffect(() => {
  if (arrDist2) {
      setStates({
          isLoading: false,
          data2: {
              ...states.data2,
              // dataPerPage: arrDist.dataPerPage,
              // currentPage: arrDist.currentPage,
              // totalData: arrDist.totalData,
              // totalPage: arrDist.totalPage,
              list: arrDist2,
              key: states.data2.key ? states.data2.key : ""
          }
      })
  }
}, [arrDist2])

let mediaModes = arrDemo === undefined ? [] : arrDemo.mediaUsed.length === 0 ? [] : arrDemo.mediaUsed.map((item: any, i: any) => (
  <Radio.Button style={{ backgroundColor: '#282f37', color: 'white' }} key={i} value={item.code_media}>{item.name}</Radio.Button>
))

let statusModes = (
  <>
  <Radio.Button style={{ backgroundColor: '#282f37', color: 'white' }} key={2} value="1">Valid</Radio.Button>
  </>
)

const dataSos = states?.data.list

const dataSos2 = states?.data2.list

  return (
    <>
      <Row>
        <Col span={24}>
          <Tabs defaultActiveKey="1" style={{ color: '#1890FF', marginTop: '2.5em' }}>
            <TabPane tab="Data Gender" key="1">
              <Demo
                deMode="Gender"
                series={arrDemo ? arrDemo.seriesGender : []}
                categories={arrDemo ? arrDemo.categoriesGender : []}
                // data={dataGender.data}
                mediaSl={arrDemo ? arrDemo.media : ''}
                mediaUsed={mediaModes}
                statusUsed={statusModes}
                changeMedia={changeMedia}
                changeStatus={changeStatus}
              />
            </TabPane>
            <TabPane tab="Data Age" key="2">
              <Demo
                deMode="Age"
                series={arrDemo ? arrDemo.seriesAge : []}
                categories={arrDemo ? arrDemo.categoriesAge : []}
                // data={dataAge.data}
                mediaSl={arrDemo ? arrDemo.media : ''}
                mediaUsed={mediaModes}
                statusUsed={statusModes}
                changeMedia={changeMedia}
                changeStatus={changeStatus}
              />
            </TabPane>
            <TabPane tab="Data Variants (Special)" key="3">
              <Demo
                deMode="Variant"
                series={arrDemo ? arrDemo.seriesVariant : []}
                categories={arrDemo ? arrDemo.categoriesVariant : []}
                // data={dataAge.data}
                mediaSl={arrDemo ? arrDemo.media : ''}
                mediaUsed={mediaModes}
                statusUsed={statusModes}
                changeMedia={changeMedia}
                changeStatus={changeStatus}
              />
            </TabPane>
            <TabPane tab="Data Variants (Reguler)" key="4">
              <Demo
                deMode="Variant"
                series={arrDemo ? arrDemo.seriesVariant2 : []}
                categories={arrDemo ? arrDemo.categoriesVariant2 : []}
                // data={dataAge.data}
                mediaSl={arrDemo ? arrDemo.media : ''}
                mediaUsed={mediaModes}
                statusUsed={statusModes}
                changeMedia={changeMedia}
                changeStatus={changeStatus}
              />
            </TabPane>
            {/* <TabPane tab="Data Profession" key="3">
              <Profession
                // title={"Chart Age"}
                series={arrDemo ? arrDemo.seriesProfession : []}
                categories={arrDemo ? arrDemo.categoriesProfession : []}
                // data={dataAge.data}
                mediaSl={arrDemo ? arrDemo.media : ''}
                mediaUsed={arrDemo ? arrDemo.mediaUsed : []}
                changeMedia={changeMedia}
              />
            </TabPane> */}
            {/* <TabPane tab="Data Distribution (By Input)" key="4">
              <Distribution
                isLoading={isLoadingDist}
                apiDistribution={handleFilterDistribution}
                // filter={filter}
                data={dataSos}
                series={arrDist?.series || []}
                categories={arrDist?.categories || []}
                // handleOpenModal={handleOpenModal}
              />
            </TabPane> */}
            <TabPane tab="Data Distribution (By KTP)" key="5">
              <DistributionProvince
                isLoading={isLoadingDist2}
                apiDistribution={handleFilterDistribution2}
                // filter={filter}
                data={dataSos2}
                series={arrDist2?.series || []}
                categories={arrDist2?.categories || []}
                series2={arrDist2?.series2 || []}
                categories2={arrDist2?.categories2 || []}
                // handleOpenModal={handleOpenModal}
              />
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
  interface IPagination {
    row: string | number
    page: string | number
    key: string
    direction: string
    column: string
    limit: number | string
    startDate: string
    endDate: string
    type: string | number
    media: string
}

const params: IPagination = {
    row: 10,
    page: 0,
    key: "",
    direction: "",
    column: "",
    limit: "",
    startDate: '',
    endDate: '',
    type: '',
    media: ''
}

  const getList = await getData(params);

  const getList2 = await getData2(params);
  const roleMaster = await masterRole();

  const data = {
    dataPerPage: getList.dataPerPage,
    totalValid: getList.totalValid,
    totalPending: getList.totalPending,
    totalInvalid: getList.totalInvalid,
    totalSubmit: getList.totalSubmit,
    totalUniqueConsumen: getList.totalUniqueConsumen,
    currentPage: getList.currentPage,
    totalData: getList.totalData,
    totalPage: getList.totalPage,
    list: getList,
    key: ""
}

const data2 = {
  dataPerPage: getList2.dataPerPage,
  totalValid: getList2.totalValid,
  totalPending: getList2.totalPending,
  totalInvalid: getList2.totalInvalid,
  totalSubmit: getList2.totalSubmit,
  totalUniqueConsumen: getList2.totalUniqueConsumen,
  currentPage: getList2.currentPage,
  totalData: getList2.totalData,
  totalPage: getList2.totalPage,
  list: getList2,
  key: ""
}

  let date = new Date()
  return {
      props: {
          // fallback: {
          //     '/api/dashboard/entries': JSON.parse(JSON.stringify(data))
          // },
          master: {
              role: JSON.parse(JSON.stringify(roleMaster))
          },
          data: JSON.parse(JSON.stringify(data)),
          data2: JSON.parse(JSON.stringify(data2)),
          columns: [],
          isLoading: false,
          startDate: dayjs(date.setDate(date.getDate() - 365)).format("YYYY-MM-DD"),
          endDate: dayjs().format("YYYY-MM-DD"),
          monthYear: dayjs().format("YYYY-MM"),
          type: "all",
          media: "",
          status: '1',
          modalFilter: false,
          filter: {
            key: "",
            direction: "",
            column: "",
            media: ''
          },
          filter2: {
            key: "",
            direction: "",
            column: "",
            media: ''
          }
      }
  }
})

export default Demographics;

Demographics.getLayout = function getLayout(page: ReactElement) {
  return (
      <DashboardLayout>{page}</DashboardLayout>
  )
}