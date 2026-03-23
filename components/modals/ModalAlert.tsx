import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

export function showDeleteConfirm(props: any) {
    confirm({
      title: 'Warning',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure delete this item?',
      centered: true,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        props.onOk()
      },
      onCancel() {},
    });
  }

export function showConfirm(props: any) {
    confirm({
      title: 'Warning',
      icon: <ExclamationCircleOutlined />,
      content: props.content ?? 'Are you sure to save this item?',
      centered: true,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        props.onOk()
      },
      onCancel() {},
    });
  }

  export function showRejectConfirm(props: any) {
    confirm({
      title: 'Warning',
      icon: <ExclamationCircleOutlined />,
      content: props.content ?? 'Are you sure you want to reject this?',
      centered: true,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        props.onOk()
      },
      onCancel() {},
    });
  }

  export function showApproveConfirm(props: any) {
    confirm({
      title: 'Warning',
      icon: <ExclamationCircleOutlined />,
      content: props.content ?? 'Are you sure you want to approve this?',
      centered: true,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        props.onOk()
      },
      onCancel() {},
    });
  }

  export function showReactivateConfirm(props: any) {
    confirm({
      title: 'Warning',
      icon: <ExclamationCircleOutlined />,
      content: props.content ?? 'Are you sure you want to reactivate this coupon?',
      centered: true,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        props.onOk()
      },
      onCancel() {},
    });
  }

  export function showReactivateConfirm2(props: any) {
    confirm({
      title: 'Warning',
      icon: <ExclamationCircleOutlined />,
      content: props.content ?? 'Are you sure you want to reactivate/activate this account?',
      centered: true,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        props.onOk()
      },
      onCancel() {},
    });
  }