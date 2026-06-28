"use client";

import { useEffect } from "react";
import { DatePicker, Form, Input, Modal, Switch } from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { Residence } from "@apartment-tracker/types";
import { useResidencesStore } from "@/store/residencesStore";

interface Props {
  open: boolean;
  residence?: Residence | null;
  onClose: () => void;
}

interface FormValues {
  city: string;
  street: string;
  current: boolean;
  start_date: Dayjs;
  end_date?: Dayjs | null;
}

export default function ResidenceModal({ open, residence, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const { createResidence, updateResidence } = useResidencesStore();
  const isEdit = !!residence;

  useEffect(() => {
    if (open) {
      if (residence) {
        form.setFieldsValue({
          city: residence.city,
          street: residence.street,
          current: residence.current === 1,
          start_date: dayjs(residence.start_date),
          end_date: residence.end_date ? dayjs(residence.end_date) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, residence]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      city: values.city,
      street: values.street,
      current: values.current ? 1 : 0,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date ? values.end_date.toISOString() : null,
    };

    if (isEdit) {
      await updateResidence(residence.id, payload);
    } else {
      await createResidence(payload);
    }
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Edit Residence" : "New Residence"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="street" label="Street" rules={[{ required: true, message: "Required" }]}>
          <Input placeholder="e.g. 123 Main St" />
        </Form.Item>
        <Form.Item name="city" label="City" rules={[{ required: true, message: "Required" }]}>
          <Input placeholder="e.g. Tel Aviv" />
        </Form.Item>
        <div style={{ display: "flex", gap: 24 }}>
          <Form.Item
            name="start_date"
            label="Start Date"
            hasFeedback
            rules={[{ required: true, message: "Required" }]}
            style={{ flex: 1 }}
          >
            <DatePicker format="DD/MM/YY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="end_date"
            label="End Date"
            hasFeedback
            dependencies={["start_date"]}
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const start = form.getFieldValue("start_date");
                  if (start && value.isBefore(start, "day")) {
                    return Promise.reject("End date must be after start date");
                  }
                  return Promise.resolve();
                },
              },
            ]}
            style={{ flex: 1 }}
          >
            <DatePicker format="DD/MM/YY" style={{ width: "100%" }} placeholder="Leave empty if current" />
          </Form.Item>
        </div>
        <Form.Item name="current" label="Current Residence" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
