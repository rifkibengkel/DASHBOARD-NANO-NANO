import React, { useCallback } from "react";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Table from "antd/lib/table";
import PieChart from "./charts/PieChart";
import Column from "antd/lib/table/Column";
import { formatNumber } from "@/lib/clientHelper";
import { Card } from "antd";

const SummaryStatus = (props: any) => {
  let chartInvalidReason =
    props.chartInvalidReason === undefined ? [] : props.chartInvalidReason;
  let chartValidInvalid =
    props.chartValidInvalid === undefined ? [] : props.chartValidInvalid;
  let dataTable = props.dataTable === undefined ? [] : props.dataTable;
  if (dataTable !== "")
    dataTable.response.forEach((i: any, index: any) => {
      i.key = index;
    });

  // console.log(chartInvalidReason, "INV");

  const invReasonTotals =
    dataTable.totalInvs === undefined
      ? null
      : dataTable.totalInvs.map((i: any, idx: number) => (
          <Table.Summary.Cell index={idx + 10} key={idx}>
            {formatNumber(i)}
          </Table.Summary.Cell>
        ));

  const reasons = useCallback(props.reasons, [props.reasons]);

  const reasonsMap = reasons
    ? reasons.map((i: any, idx: number) => (
        <Column
          title={`${i.reason}`}
          dataIndex={`${i.alias}`}
          key={`${i.alias}`}
          render={(x) => formatNumber(x)}
        />
      ))
    : [];

  // origin
  const statusCol: any = (
    <>
      <Column title="Valid" dataIndex="valid" key="valid" />
      {/* <Column title="Pending" dataIndex="pending" key="pending" /> */}
      <Column title="Invalid" dataIndex="invalid" key="invalid" />
    </>
  );

  // const anaknyaStatusCol: any = (
  //   <>
  //     <Column title="Total Valid" dataIndex="valid" key="valid" render={(x) => formatNumber(x)} />
  //     <Column title="Belum Beruntung/Coba Lagi" dataIndex="unlucky" key="unlucky" render={(x) => formatNumber(x)} />
  //   </>
  // )

  // const statusCol: any = (
  //   <>
  //     <Column title="Valid">
  //       {anaknyaStatusCol}
  //     </Column>
  //     {/* <Column title="Pending" dataIndex="pending" key="pending" /> */}
  //     <Column title="Total Invalid" dataIndex="invalid" key="invalid" render={(x) => formatNumber(x)} />
  //   </>
  // )

  const invReasonCol: any = <>{reasonsMap}</>;

  return (
    <>
      <Row gutter={20}>
        <Col style={{ marginBottom: "15px" }} xs={24} xl={12}>
          <Card>
            <PieChart
              series={chartValidInvalid.series}
              categories={chartValidInvalid.categories}
              title={"Chart Status"}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card>
            <PieChart
              series={chartInvalidReason.series}
              categories={chartInvalidReason.categories}
              title={"Chart Rejected Reason"}
            />
          </Card>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div
            style={{
              display: "box",
              overflowX: "scroll",
              paddingBottom: "1em",
            }}
          >
            <Table
              style={{ overflowX: "scroll" }}
              bordered
              size="middle"
              pagination={false}
              dataSource={dataTable.response}
              summary={() => (
                <Table.Summary.Row style={{ fontWeight: "bolder" }}>
                  <Table.Summary.Cell index={0}>TOTAL</Table.Summary.Cell>
                  {/* <Table.Summary.Cell index={1}>
                    {dataTable.validMicrosite === undefined
                      ? null
                      : dataTable.validMicrosite}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    {dataTable.invalidMicrosite === undefined
                      ? null
                      : dataTable.invalidMicrosite}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {dataTable.validWa1 === undefined
                      ? null
                      : dataTable.validWa1}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    {dataTable.invalidWa1 === undefined
                      ? null
                      : dataTable.invalidWa1}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {dataTable.validWa2 === undefined
                      ? null
                      : dataTable.validWa2}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    {dataTable.invalidWa2 === undefined
                      ? null
                      : dataTable.invalidWa2}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {dataTable.validWa3 === undefined
                      ? null
                      : dataTable.validWa3}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    {dataTable.invalidWa3 === undefined
                      ? null
                      : dataTable.invalidWa3}
                  </Table.Summary.Cell> */}
                  <Table.Summary.Cell index={4}>
                    {dataTable.valid === undefined
                      ? null
                      : formatNumber(dataTable.valid || 0)}
                  </Table.Summary.Cell>
                  {/* <Table.Summary.Cell index={5}>
                    {dataTable.unlucky === undefined
                      ? null
                      : formatNumber(dataTable.unlucky || 0)}
                  </Table.Summary.Cell> */}
                  {/* <Table.Summary.Cell index={5}>
                    {dataTable.pending === undefined
                      ? null
                      : dataTable.pending}
                  </Table.Summary.Cell> */}
                  <Table.Summary.Cell index={6}>
                    {dataTable.invalid === undefined
                      ? null
                      : formatNumber(dataTable.invalid || 0)}
                  </Table.Summary.Cell>
                  {invReasonTotals}

                  {/* <Table.Summary.Cell index={7}>
                    {dataTable.wrongFormat === undefined
                      ? null
                      : dataTable.wrongFormat}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={8}>
                    {dataTable.wrongKTP === undefined
                      ? null
                      : dataTable.wrongKTP}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={9}>
                    {dataTable.underAge === undefined
                      ? null
                      : dataTable.underAge}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={10}>
                    {dataTable.wrongCoupon === undefined
                      ? null
                      : dataTable.wrongCoupon}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={11}>
                    {dataTable.duplicateCoupon === undefined
                      ? null
                      : dataTable.duplicateCoupon}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={12}>
                    {dataTable.notYetStart === undefined
                      ? null
                      : dataTable.notYetStart}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={13}>
                    {dataTable.overProgram === undefined
                      ? null
                      : dataTable.overProgram}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={14}>
                    {dataTable.differentFromPrev === undefined
                      ? null
                      : dataTable.differentFromPrev}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={15}>
                    {dataTable.blacklist === undefined
                      ? null
                      : dataTable.blacklist}
                  </Table.Summary.Cell> */}
                </Table.Summary.Row>
              )}
            >
              <Column
                title={props.type === "time" ? "Submit Time" : "Submit Date"}
                dataIndex="DATE"
                key="DATE"
              />
              <Column title="Status">{statusCol}</Column>
              <Column title="Invalid Reason">{invReasonCol}</Column>
            </Table>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default SummaryStatus;
