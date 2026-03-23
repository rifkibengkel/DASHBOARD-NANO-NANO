import React, { useRef, useReducer, useEffect} from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Input from "antd/lib/input"
import Switch from "antd/lib/switch"
import Space from "antd/lib/space"

interface IState {
  gpDescription: string
  gpParam: string
  gpStatus: boolean
  id: string
  isLoading: boolean
}

let initialState = {
  gpDescription: "",
  gpParam: "",
  gpStatus: true,
  id: "",
  isLoading: false
}

const ModalParam = React.memo((props: any) => {
  const prevProps = useRef(props)
  const [states, setStates] = useReducer((state: IState, newState: Partial<IState>) => ({ ...state, ...newState }), initialState)

  const handleChangeInput = (e: any) => {
    setStates({
      [e.target.name]: e.target.value,
    });
  };
 
  const handleSubmit = async (data: any) => {
    // console.log(data)
    await states.id?
      props.handleEdit(data) 
      :
      props.handleAdd(data);
    setStates(initialState);
  }

  const close = () => {
    props.handleOpenModal({ name: "openModal", type: "modalClose", value: false });
    setStates(initialState)
  };

  const switchActive = (checked: any) => {
    setStates({
      gpStatus: checked
    })
  }

//   componentDidUpdate(prevProps, prevState)
//   {
//     if (this.props.data !== undefined)
//     {
//       if (prevProps.data !== this.props.data)
//       {
//         let data = this.props.data;
//         this.setState({
//           id: data.id,
//           gpDescription: data.gpDescription,
//           gpParam: data.gpParam,
//           gpStatus: data.gpStatus === 1 ? true : false
//         })
//       }
//     }
//   }

  useEffect(() => {
    if (prevProps.current.data !== props.data || props.data !== undefined) {
      let data = props.data
      setStates({
        id: data.id,
        gpDescription: data.gpDescription,
        gpParam: data.gpParam,
        gpStatus: data.gpStatus === 1 ? true : false,
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
        className="modal"
        footer={
          <Space size={0}>
                    <Button onClick={() => handleSubmit({
                        id: states.id,
                        description: states.gpDescription,
                        parameter: states.gpParam,
                        status: states.gpStatus === true ? 1 : 0
                    })}>
                        Save
                    </Button>
                    <Button onClick={close} style={{ backgroundColor: "#252733", borderBottomRightRadius: 8 }}>
                        Cancel
                    </Button>
                </Space>
        }
      >
        <Row>
          <Col span={24}>
            <Form layout="vertical">
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
              <Row>
                <Col span={24}>
                  <Form.Item label="Status">
                    <Switch
                      onChange={switchActive}
                      checked={states.gpStatus}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Modal>
    );
  })

  ModalParam.displayName = "KTPModal"
  export default ModalParam
