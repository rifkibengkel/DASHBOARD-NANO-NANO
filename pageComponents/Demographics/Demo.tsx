import React from "react";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Table from "antd/lib/table";
import Radio from "antd/lib/radio";

import PieChart from "../../components/charts/PieChart";

const { Column } = Table

const Age = (props: any) => {

  let mediaUsed = props.mediaUsed
  let media = props.mediaSl;
  let title = props.title;
  let categories = props.categories || [];
  let series = props.series || [];
  // let data = props.data === undefined || props.data === [] ? [] : props.data;
  // console.log(series, props.series)

  let dataTable = categories.map((item: any, i: any) => ({
    key: i, demo: item, value: series[i]
  }))

  const handleSizeChange = (e: any) => {
    props.changeMedia(e.target.value)
  }

  return (
    <React.Fragment>
    <Row>
      <Col>
      <Radio.Group value={media} onChange={handleSizeChange}>
        <Radio.Button style={{ backgroundColor: '#282f37', color: 'white' }} value="0">All</Radio.Button>
        {mediaUsed}
      </Radio.Group>
      </Col>
    </Row>
    <Row justify="space-between">
      <Col xs={24} xl={12}>
        <PieChart series={series} categories={categories} title={title} />
      </Col>
      <Col xs={24} xl={11}>
        <Table
          bordered
          size="middle"
          loading={props.isLoading}
          pagination={false}
          dataSource={dataTable}
          summary={() => (
            <Table.Summary.Row style={{ fontWeight: "bolder" }}>
              <Table.Summary.Cell index={0}>TOTAL</Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                {dataTable.map((item: any) => item.value).reduce((a: any, b: any) => Number(a) + Number(b), 0)}
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        >
          <Column title={props.deMode} dataIndex="demo" key="demo" />
          <Column title="TOTAL" dataIndex="value" key="value" />
        </Table>
      </Col>
    </Row>
    </React.Fragment>
  );
};

export default Age;
