"use client";

import { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";
import type { BillType, Provider } from "@xpensive/types";
import { useProvidersStore } from "@/store/providersStore";
import { BILL_TYPE_OPTIONS } from "@/lib/billTypes";

interface Props {
  open: boolean;
  provider?: Provider | null;
  defaultType?: BillType;
  onClose: (created?: Provider) => void;
}

interface FormValues {
  name: string;
  types: BillType[];
}


export default function ProviderModal({ open, provider, defaultType, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const { createProvider, updateProvider } = useProvidersStore();
  const isEdit = !!provider;

  useEffect(() => {
    if (open) {
      if (provider) {
        form.setFieldsValue({ name: provider.name, types: provider.types });
      } else {
        form.resetFields();
        if (defaultType) form.setFieldValue("types", [defaultType]);
      }
    }
  }, [open, provider]);

  const handleOk = async () => {
    const { name, types } = await form.validateFields();
    if (isEdit) {
      await updateProvider(provider.id, name, types);
      onClose();
    } else {
      const created = await createProvider(name, types);
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
        <Form.Item name="types" label="Type" rules={[{ required: true, message: "Required" }]}>
          <Select mode="multiple" options={BILL_TYPE_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
