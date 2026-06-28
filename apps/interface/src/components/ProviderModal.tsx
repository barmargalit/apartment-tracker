"use client";

import { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";
import type { BillType, Provider } from "@apartment-tracker/types";
import { useProvidersStore } from "@/store/providersStore";

interface Props {
  open: boolean;
  provider?: Provider | null;
  defaultType?: BillType;
  onClose: (created?: Provider) => void;
}

interface FormValues {
  name: string;
  type: BillType;
}

const BILL_TYPE_OPTIONS = [
  { value: "electric", label: "Electric" },
  { value: "water",    label: "Water" },
  { value: "internet", label: "Internet" },
  { value: "gas",      label: "Gas" },
];

export default function ProviderModal({ open, provider, defaultType, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const { createProvider, updateProvider } = useProvidersStore();
  const isEdit = !!provider;

  useEffect(() => {
    if (open) {
      if (provider) {
        form.setFieldsValue({ name: provider.name, type: provider.type });
      } else {
        form.resetFields();
        if (defaultType) form.setFieldValue("type", defaultType);
      }
    }
  }, [open, provider]);

  const handleOk = async () => {
    const { name, type } = await form.validateFields();
    if (isEdit) {
      await updateProvider(provider.id, name, type);
      onClose();
    } else {
      const created = await createProvider(name, type);
      onClose(created);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Provider" : "New Provider"}
      open={open}
      onCancel={() => onClose()}
      onOk={handleOk}
      okText="Save"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: "Required" }]}>
          <Input placeholder="e.g. Israel Electric Corporation" />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true, message: "Required" }]}>
          <Select options={BILL_TYPE_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
