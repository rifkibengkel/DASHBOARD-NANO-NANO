import React from "react";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Table from "antd/lib/table";
import BarChart from "./charts/BarChart";
import Column from "antd/lib/table/Column";
import Form from "antd/lib/form";
import Select from "antd/lib/select"
import { formatNumber } from "@/lib/clientHelper";
import Statistic from "antd/lib/statistic";
import Card from "antd/lib/card"
// import { getUser } from "../utils/Helper";

const SummaryData = (props: any) => {

  const handleChangeSelect = (e: any, name: any) => {
    props.setSurveyId(e)
  };

  let series = props.series === undefined ? [] : props.series;
  let categories = props.categories === undefined ? [] : props.categories;

  return (
    <>
      <Card style={{ marginTop: 30 }}>
      <Statistic
        title="Total Survey Submitted"
        value={props.totalSubmit !== undefined ?
          props.totalSubmit : '-'}
        loading={props.isLoading}
      // precision={2}
      />
      </Card>
      <Row>
        <Col span={24}>
          <Form>
            <Form.Item label="Choose Survey Question" name="surveyId">
              <Select
                value={''}
                onChange={(e) => {
                  handleChangeSelect(e, "surveyId")
                }}
                options={props.questions}
                placeholder="Choose an option"
                className={"select"}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <BarChart
            title={props.title}
            series={series}
            categories={categories}
          />
        </Col>
      </Row>
    </>
  );
};

export default SummaryData;
