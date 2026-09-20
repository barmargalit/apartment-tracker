"use client";

import { useEffect } from "react";
import { DatePicker, Form, Input, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { Resident } from "@apartment-tracker/types";
import { useResidentsStore } from "@/store/residentsStore";

interface Props {
  open: boolean;
  resident?: Resident | null;
  onClose: () => void;
}

interface FormValues {
  name: string;
  birth_date: Dayjs;
}

export default function ResidentModal({ open, resident, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const { createResident, updateResident } = useResidentsStore();
  const isEdit = !!resident;

  useEffect(() => {
    if (!open) return;
    if (resident) {
      form.setFieldsValue({
        name: resident.name,
        birth_date: dayjs(resident.birth_date),
      });
    } else {
      form.resetFields();
    }
  }, [open, resident]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      name: values.name,
      birth_date: values.birth_date.format("YYYY-MM-DD"),
    };
    if (isEdit) {
      await updateResident(resident.id, payload);
    } else {
      await createResident(payload);
    }
    onClose();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Edit Resident" : "New Resident"}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Save"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: "Required" }]}>
          <Input placeholder="Full name" />
        </Form.Item>
        <Form.Item name="birth_date" label="Birth Date" rules={[{ required: true, message: "Required" }]}>
          <DatePicker format="DD/MM/YY" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
