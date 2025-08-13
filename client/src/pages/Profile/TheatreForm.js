import { Form, Input, message, Modal } from "antd";
import React, { useEffect } from "react";
import Button from "../../components/Button";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { AddTheatre, UpdateTheatre } from "../../apicalls/theatres";

function TheatreForm({
  showTheatreFormModal,
  setShowTheatreFormModal,
  formType,
  setFormType,
  selectedTheatre,
  setSelectedTheatre,
  getData,
}) {
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  // Populate form when editing
  useEffect(() => {
    if (selectedTheatre) {
      form.setFieldsValue(selectedTheatre);
    } else {
      form.resetFields();
    }
  }, [selectedTheatre, form]);

  const onFinish = async (values) => {
    // Set user email as required by schema
    values.email = user.email;

    try {
      dispatch(ShowLoading());
      let response = null;

      if (formType === "add") {
        response = await AddTheatre(values);
      } else {
        values.theatreId = selectedTheatre._id;
        response = await UpdateTheatre(values);
      }

      if (response.success) {
        message.success(response.message);
        setShowTheatreFormModal(false);
        setSelectedTheatre(null);
        form.resetFields();
        getData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message || "Something went wrong");
    } finally {
      dispatch(HideLoading());
    }
  };

  const closeModal = () => {
    setShowTheatreFormModal(false);
    setSelectedTheatre(null);
    form.resetFields();
  };

  return (
    <Modal
      open={showTheatreFormModal}
      title={formType === "add" ? "Add Theatre" : "Edit Theatre"}
      onCancel={closeModal}
      footer={null}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={selectedTheatre || {}}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter Theatre name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Please enter address" }]}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          initialValue={user.email}
          rules={[{ required: true, message: "Email is required" }]}
        >
          <Input disabled />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button
            title="Cancel"
            variant="outlined"
            type="button"
            onClick={closeModal}
          />
          <Button type="submit" title="Save" />
        </div>
      </Form>
    </Modal>
  );
}

export default TheatreForm;
