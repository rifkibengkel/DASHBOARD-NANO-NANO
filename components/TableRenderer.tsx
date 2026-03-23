import dayjs from "dayjs";
import Tag from "antd/lib/tag";
import { formatNumber } from "@/lib/clientHelper";
import Table from "antd/lib/table";
import Card from "antd/lib/card";
import Image from "antd/lib/image";
import SearchBar from "@/components/SearchBar";
import Text from "antd/lib/typography/Text";
import { Rate } from 'antd';

interface tbc {
  array: any;
  addOn: any;
  loading: boolean;
  dataSource: any[];
  summary: {
    for: string;
    data: {
      totalInvalid: number;
      totalValid: number;
      totalPending: number;
      total: number;
    };
  };
  pagination: {
    currentPage: any;
    totalData: any;
    dataPerPage: any;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  activeFilter: any;
  filtering: (pagination: any, filters: any, sorter: any) => void;
  searching: (data: any) => void;
  title: string;
  override?: boolean;
}

const TableRenderer = (props: tbc) => {
  const handleSearch = (data: any) => {
    props.searching(data);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    props.filtering(pagination, filters, sorter);
  };

  const handleTotal = (total: number, range: [number, number]): JSX.Element => (
    <Text>
      Data of <Text strong>{range[0].toLocaleString()}</Text> -{" "}
      <Text strong>{range[1].toLocaleString()}</Text> from{" "}
      <Text strong>{total.toLocaleString()}</Text> Items
    </Text>
  );

  const mapRender = (item: any) => {
    switch (item.dataIndex) {
      case "receiveTime":
      case "rcvd_time":
      case "allocation_date":
      case "allocationDate":
      case "last_updated":
        return (x: string) => dayjs(x).format("DD/MM/YYYY HH:mm:ss");
      case "birthdate":
        return (x: string) => dayjs(x).format("DD/MM/YYYY");
      case 'remaining_points':
          return (x: any) => `${formatNumber(x || 0)}`;
      case "claimedAmount":
        return (x: any) => `Rp ${formatNumber(x || 0)} ,-`;
      case "created_at":
        return (x: string) =>
          x ? dayjs(x).format("DD/MM/YYYY HH:mm:ss") : "-";
      case "is_valid":
        return (x: number) =>
          x === 1 ? (
            <Tag color="success">VALID</Tag>
          ) : x === 0 ? (
            <Tag color="error">INVALID</Tag>
          ) : (
            "-"
          );
      case "is_valid_admin":
        return (x: number) =>
          x === 1 ? (
            <Tag color="success">VALID</Tag>
          ) : x === 0 ? (
            <Tag color="warning">UNPROCESSED</Tag>
          ) : (
            <Tag color="error">INVALID</Tag>
          );
      case "is_approved_admin":
        return (x: number) =>
          x === 1 ? (
            <Tag color="success">APPROVED</Tag>
          ) : x === 0 ? (
            <Tag color="warning">UNPROCESSED</Tag>
          ) : (
            <Tag color="error">REJECTED</Tag>
          );
      case "status":
        return (x: number) =>
          x === 0 ? (
            <Tag color="error">FAILED</Tag>
          ) : x === 1 ? (
            <Tag color="warning">PROCESSED</Tag>
          ) : x === 2 ? (
            <Tag color="success">SUCCESS</Tag>
          ) : x === 3 ? (
            <Tag color="success">PENGIRIMAN</Tag>
          ) : x === 4 ? (
            <Tag color="success">DITERIMA</Tag>
          ): (
            <Tag color="error">FAILED</Tag>
          );
      case "gpStatus":
        return (x: number) =>
          x === 1 ? (
            <Tag color="success">Active</Tag>
          ) : (
            <Tag color="error">Inactive</Tag>
          );
      case "statusPrizeDeposit":
        return (x: number) =>
          x === 0 ? (
            <Tag color="warning">UNPROCESSED</Tag>
          ) : x === 1 ? (
            <Tag color="warning">PROCESSED</Tag>
          ) : x === 2 ? (
            <Tag color="success">SUCCESS</Tag>
          ) : x === 3 ? (
            <Tag color="error">FAILED</Tag>
          ) : (
            <Tag color="warning">N/A</Tag>
          );
      case "is_approved":
        return (x: number) =>
          x === 1 ? (
            <Tag color="success">VERIFIED</Tag>
          ) : x === 0 ? (
            <Tag color="warning">UNVERIFIED</Tag>
          ) : (
            <Tag color="error">REJECTED</Tag>
          );
      case "picture":
      case "url_picture":
        return (x: string) => <Image src={x} width={200} />;
      case 'shipment_status':
          return (x: number) =>
              x === 0 || x === 1 ? <Tag color="warning">UNPROCESSED</Tag> : x === 2 ? <Tag color="success">PROCESSED/ON SHIPPING</Tag> : x === 3 ? <Tag color="success">DELIVERED</Tag> : x === 4 ? <Tag color="success">COMPLETED</Tag> : <Tag color="error">FAILED</Tag>;
      case "activationStatus":
        return (x: number) =>
          x === 1 ? (
            <Tag color="success">ACTIVE</Tag>
          ) : (
            <Tag color="error">INACTIVE</Tag>
          );
      case 'average_rate':
            return (x:number) => <Rate allowHalf defaultValue={0} value={x} disabled={true}/>
                    ;
          default:
        return null;
    }
  };

  const columns = props.array.map((item: any) => {
    return item.title?.toLowerCase()?.split(" ")?.includes("id")
      ? {}
      : {
          title: item.title,
          dataIndex: item.dataIndex,
          key: item.key,
          sorter: item.sorter,
          render: mapRender(item),
        };
  });

  columns.push(props.addOn);
  return (
    <Card
      className="custom-card"
      title={
        props.dateRange.startDate
          ? `${props.title} (${dayjs(props.dateRange.startDate).format(
              "DD MMMM YYYY"
            )} - ${dayjs(props.dateRange.endDate).format("DD MMMM YYYY")})`
          : `${props.title}`
      }
      extra={
        <SearchBar handleFilter={handleSearch} filter={props.activeFilter} />
      }
    >
      <Table
        style={{ overflowX: "scroll" }}
        loading={props.loading}
        dataSource={props.dataSource}
        columns={columns}
        size="middle"
        pagination={{
          showTotal: handleTotal,
          current: (props.pagination.currentPage as number) || 1,
          total: (props.pagination.totalData as number) || 0,
          pageSize: props.pagination.dataPerPage as number,
        }}
        onChange={handleTableChange}
        summary={() =>
          props.summary.for === "consumer_data" ? (
            <Table.Summary.Row style={{ fontWeight: "bolder" }}>
              <Table.Summary.Cell colSpan={columns.length - 1} index={0}>
                TOTAL
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                {props.summary.data.totalValid}
              </Table.Summary.Cell>
              {/* {
                                    <Table.Summary.Cell index={2}>
                                        {props.summary.data.totalPending}
                                    </Table.Summary.Cell>} */}
              <Table.Summary.Cell index={3}>
                {props.summary.data.totalInvalid}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                {props.summary.data.total}
              </Table.Summary.Cell>
            </Table.Summary.Row>
          ) : null
        }
      />
    </Card>
  );
};

export default TableRenderer;
