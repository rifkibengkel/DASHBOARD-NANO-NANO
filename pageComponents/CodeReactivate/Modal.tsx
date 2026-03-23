import React, { useRef, useReducer, useEffect} from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
// import Form from "antd/lib/form";
import Col from "antd/lib/col";
// import Input from "antd/lib/input"
// import Switch from "antd/lib/switch"
// import Space from "antd/lib/space"
import dayjs from "dayjs";
import { showReactivateConfirm } from "@/components/modals/ModalAlert";

interface IState {
  coupon: string
  periodeId: string
  status: number
  use_date: string
  id: string
  isLoading: boolean
}

let initialState = {
  coupon: '',
  periodeId: "",
  status: 0,
  use_date: "",
  id: "",
  isLoading: false
}

const ModalDisplay = React.memo((props: any) => {
  const prevProps = useRef(props)
  const [states, setStates] = useReducer((state: IState, newState: Partial<IState>) => ({ ...state, ...newState }), initialState)

  const handleChangeInput = (e: any) => {
    setStates({
      [e.target.name]: e.target.value,
    });
  };
 
  const reactivateCd = async (data: any) => {
    props.reactivate(data)

    // await states.id?
    //   props.handleEdit(data) 
    //   :
    //   props.handleAdd(data);
    // setStates(initialState);
  }

  const close = () => {
    props.handleOpenModal({ name: "openModal", type: "modalClose", value: false });
    setStates(initialState)
  };

  useEffect(() => {
    if (prevProps.current.data !== props.data || props.data.length > 0 || props.data !== undefined) {
      let data = props.data
      setStates({
        id: data.id,
        periodeId: data.periodeId,
        status: data.status,
        use_date: data.use_date,
        coupon: data.coupon,
        isLoading: false
      })
    }
  }, [props.data])

  return (
      <Modal
        destroyOnClose
        title={props.header}
        centered
        open={props.open}
        onCancel={close}
        // className="modal"
        footer={
          // <Space size={0}>
          <>
          {states.status === 0 ? null: (<Button 
                    onClick={() => showReactivateConfirm({ onOk: (() => reactivateCd(states.coupon) )})}
                        
                    type="primary">
                        Reactivate
                    </Button>)}
                    <Button onClick={close}>
                        Close
                    </Button>
                    </>
                // </Space>
                
        }
      >
        <Row>
          <Col span={24}>
          <div>
               {/* <p>Periode: {states.periodeId}</p> */}
               <p>Status: {states.status === 1 ? ('Used') : ('Unused')}</p>
               <p>
                 Used Date:{" "}
                 {states.status === 1
                   ? dayjs.unix(+states.use_date).format("DD-MM-YYYY HH:mm:ss")
                   : "-"}
               </p>
             </div>
            {/* <Form layout="vertical">
              <Row>
                <Col span={24}>
                  <Form.Item label="Description">
                    <Input
                      name="gpDescription"
                      value={states.gpDescription}
                      onChange={handleChangeInput}
                      placeholder="thisIsDescription"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item label="Parameter">
                    <Input
                      name="gpParam"
                      value={states.gpParam}
                      onChange={handleChangeInput}
                      placeholder="blablaGO"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form> */}
          </Col>
        </Row>
      </Modal>
    );
  })

  ModalDisplay.displayName = "ModalCoupon"
  export default ModalDisplay
