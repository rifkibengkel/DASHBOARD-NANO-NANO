import type { ReactElement } from 'react';
import React, { useCallback, useReducer } from "react";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
import Tabs from "antd/lib/tabs";
import useSWR, { SWRConfig } from "swr";
import { DemoState } from "@/interfaces/livechat.interface";
import DashboardLayout from "../../../components/layouts/Dashboard";
import dayjs from "dayjs";
import { getData } from "@api/livechat/demographics";
import { masterRole } from "../../api/master/index";
import { GetServerSideProps } from 'next';
import Demo from "@/pageComponents/Demographics/Demo"
import { withAuth } from '@/components/authHOC';
import dynamic from 'next/dynamic';
import { Button } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

const ModalFilter = dynamic(() => import('@/components/DataFilter'), { loading: () => <p></p> })

const { TabPane } = Tabs;

const Topics = (props: any, { fallback }: any) => {
  const [states, setStates] = useReducer((state: DemoState, newState: Partial<DemoState>) => ({ ...state, ...newState }), props)

  const { data: arrTopic, error: errorTopic, isValidating: isLoadingTopic } = useSWR(`/api/livechat/demographics?startDate=${states.filter.startDate}&endDate=${states.filter.endDate}`)
  
  const changeMedia = (data: any) => {
    setStates({ media: data });
  };

  const changeStatus = (data: any) => {
    setStates({ status: data });
  };

  const handleFilter = useCallback((data: any) => {
    setStates({
      data: {
        ...states.data,
        dataPerPage: 10,
        currentPage: 1,
      },
      filter: {
        ...states.filter,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      modalFilter: false
    })
  }, [states.filter, states.data])

  const handleOpenModal = useCallback(async (param: any) => {
    // if (param.name === "openModal" && param.id) {
    //     const response = await getDetail(param.id)
    //     setStates({
    //         // dataDetail: response.entries[0],
    //         [param.name]: param.value,
    //     });
    // } else {
        setStates({
            [param.name]: param.value,
        });
    // }
  }, [])

  const getDetail = async (data: any) => {
    let res = await fetch(`/api/livechat/${data}`)
    if (res.status !== 404) {
        let dataList = await res.json()
        return dataList
    } else {
        return alert("Error 404")
    }
  }

  return (
    <>
      <SWRConfig value={{ fallback }}>
        <PageHeader
          title="Agents Management"
          extra={[
            <Row key="1">
              <Col>
                <Button
                  onClick={() =>
                      handleOpenModal({
                          name: "modalFilter",
                          value: true,
                      })
                  }
                  className={'button'}
                  shape="round"
                >
                  Filter
                </Button>
              </Col>
            </Row>
          ]}
        />
      </SWRConfig>
      <Row>
        <Col span={24}>
          <Tabs defaultActiveKey="1" style={{ color: '#1890FF' }}>
            <TabPane tab="Data Topic" key="1">
              <Demo
                deMode="Topic"
                series={arrTopic ? arrTopic.seriesTopic : []}
                categories={arrTopic ? arrTopic.categoriesTopic : []}
                changeMedia={changeMedia}
                changeStatus={changeStatus}
              />
            </TabPane>
          </Tabs>
        </Col>
      </Row>
      <ModalFilter
        tgt={'topic'}
        header={"Filter Topic"}
        open={states.modalFilter}
        handleOpenModal={handleOpenModal}
        handleFilter={handleFilter}
        master={states.master}
        filter={states.filter}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx) => {
  interface IPagination {
    startDate: string;
    endDate: string;
  }

  const { startDate, endDate } = ctx.query as any

  const params: IPagination = {
    startDate: startDate ?? '',
    endDate: endDate ?? '',
  }

  const roleMaster = await masterRole();
  const data = await getData(params);

  let date = new Date()

  return {
      props: {
        fallback: {
          '/api/livechat/demographic': JSON.parse(JSON.stringify(data))
        },
          master: {
              role: JSON.parse(JSON.stringify(roleMaster))
          },
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
            startDate: startDate ?? params.startDate,
            endDate: endDate ?? params.endDate,
          },
      }
  }
})

export default Topics;

Topics.getLayout = function getLayout(page: ReactElement) {
  return (
      <DashboardLayout>{page}</DashboardLayout>
  )
}