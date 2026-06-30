"use client";

import { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import type { Prospect, SafeSpace } from "@apartment-tracker/types";
import { useProspectsStore } from "@/store/prospectsStore";

interface Props {
  open: boolean;
  prospect?: Prospect | null;
  onClose: () => void;
}

interface FormValues {
  street: string;
  city: string;
  square_meters: number;
  balcony_square_meters?: number | null;
  rooms: number;
  parking: boolean;
  safe_space: SafeSpace;
  contractor?: string | null;
  comment?: string | null;
}

const SAFE_SPACE_OPTIONS = [
  { value: "Room", label: "Room" },
  { value: "Floor", label: "Floor" },
  { value: "Building", label: "Building" },
  { value: "None", label: "None" },
];

export default function ProspectModal({ open, prospect, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const { createProspect, updateProspect } = useProspectsStore();
  const isEdit = !!prospect;

  useEffect(() => {
    if (open) {
      if (prospect) {
        form.setFieldsValue({
          street: prospect.street,
          city: prospect.city,
          square_meters: prospect.square_meters,
          balcony_square_meters: prospect.balcony_square_meters,
          rooms: prospect.rooms,
          parking: prospect.parking,
          safe_space: prospect.safe_space,
          contractor: prospect.contractor,
          comment: prospect.comment,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ parking: false, safe_space: "None" as SafeSpace });
      }
    }
  }, [open, prospect]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      balcony_square_meters: values.balcony_square_meters ?? null,
      comment: values.comment ?? null,
    };
    if (isEdit) {
      await updateProspect(prospect.id, payload);
    } else {
      await createProspect(payload);
    }
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Edit Prospect" : "New Prospect"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item name="street" label="Street" rules={[{ required: true, message: "Required" }]} style={{ flex: 2 }}>
            <Input />
          </Form.Item>
          <Form.Item name="city" label="City" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item name="square_meters" label="m²" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
            <InputNumber min={1} precision={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="balcony_square_meters" label="Balcony m²" style={{ flex: 1 }}>
            <InputNumber min={0} precision={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="rooms" label="Rooms" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
            <InputNumber min={1} step={0.5} precision={1} style={{ width: "100%" }} />
          </Form.Item>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item name="safe_space" label="Safe Space" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
            <Select options={SAFE_SPACE_OPTIONS} />
          </Form.Item>
          <Form.Item name="parking" label="Parking" valuePropName="checked" style={{ flex: 1 }}>
            <Switch />
          </Form.Item>
        </div>

        <Form.Item name="contractor" label="Contractor">
          <Input />
        </Form.Item>

        <Form.Item name="comment" label="Comment">
          <Input.TextArea maxLength={200} showCount autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
