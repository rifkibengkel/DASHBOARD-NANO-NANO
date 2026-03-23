import React, { useReducer, useEffect } from "react";

import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Form from "antd/lib/form";
import Col from "antd/lib/col";
import Input from "antd/lib/input";
import Row from "antd/lib/row";
import Select from "antd/lib/select";
import Space from "antd/lib/space";

// import { modalState } from "../../interfaces/entries.interface"

let initialState = {
    data: [],
    isLoading: true,
    oldId: "",
    role: [],
    master: {
        role: []
    },
    form: {
        username: "",
        name: "",
        role: undefined,
        password: "",
        id: undefined
    }
};

const Modals = (props: any) => {
    const [states, setStates] = useReducer((state: any, newState: Partial<any>) => ({ ...state, ...newState }), initialState);

    const close = () => {
        props.handleOpenModal({ name: "openModal", value: false });
        setStates(initialState)
    };

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        e.preventDefault()
        const { name, value } = e.currentTarget
        setStates({
          form: {
            ...states.form,
            [name]: value
          }
        })
      };

    const handleChangeSelect = (value: string, option: any) => {
        const name = option.name
        setStates({
            form: {
                ...states.form,
                [name]: value
            }
        });
    };

    const submit = () => {
        const { form, oldId } = states
        props.submit({ ...form, id: oldId })
        setStates(initialState)
    }

    useEffect(() => {
        const { data, master } = props

        setStates({
            master
        })

        if (data && Object.keys(data).length != 0) {
            setStates({
                oldId: data.username,
                form: {
                    ...states.form,
                    ...data
                }
            })
        }
    }, [props.data])

    return (
        <Modal
            destroyOnClose
            title={props.header}
            className={"modal"}
            onCancel={close}
            centered
            footer={
                <Space size={0}>

                    <Button
                        onClick={submit}
                        style={{ borderBottomLeftRadius: 8 }}

                    >
                        Submit
                    </Button>
                    <Button
                        onClick={close}
                        style={{ backgroundColor: "#252733", borderBottomRightRadius: 8 }}

                    >Cancel</Button>
                </Space>
            }
            open={props.open}
        >
            <Form className={"form"} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Product Category">
                            <Select
                                tabIndex={18}
                                filterOption={(input, option) =>
                                    option?.props.label
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                id="categoryRef"
                                // tabIndex="10"
                                // name="catVariant"
                                // value={catVariant}
                                placeholder="- Select -"
                                // options={optionsCategory}
                                showSearch
                                // onChange={(e, { value, text }) =>
                                //     this.handleChangeSelect("catVariant", e, value)
                                // }
                                onKeyDown={(event) => {
                                    // if (event.which === 8) {
                                    //     this.setState({
                                    //         variant: "",
                                    //     });
                                    // } else if (event.keyCode === 9) {
                                    //     event.preventDefault();
                                    //     this.handleChangeFocus("categoryRef");
                                    // } else if (event.key === "Enter") {
                                    //     event.preventDefault();
                                    // }
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Product">
                            <Select
                                tabIndex={19}
                                filterOption={(input, option) =>
                                    option?.props.label
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                id="categoryProductRef"
                                // value={catVariant}
                                placeholder="- Select -"
                                // options={optionsCategory}
                                showSearch
                                // onChange={(e, { value, text }) =>
                                //     this.handleChangeSelect("catVariant", e, value)
                                // }
                                onKeyDown={(event) => {
                                    // if (event.which === 8) {
                                    //     this.setState({
                                    //         variant: "",
                                    //     });
                                    // } else if (event.keyCode === 9) {
                                    //     event.preventDefault();
                                    //     this.handleChangeFocus("categoryRef");
                                    // } else if (event.key === "Enter") {
                                    //     event.preventDefault();
                                    // }
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Name">
                            <Input
                                name="name"
                                value={states.form.name}
                                onChange={handleChange}
                                placeholder="Name"
                                className={"input"}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Role" name="role" initialValue={states.form.role}>
                            <Select
                                value={states.form.role}
                                onChange={handleChangeSelect}
                                options={states.master.role}
                                placeholder="Choose an option"
                                className={"select"}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

// export default Modals;
export default React.memo(Modals);