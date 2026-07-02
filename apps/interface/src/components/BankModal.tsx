"use client";

import { useEffect } from "react";
import { Form, Input, Modal } from "antd";
import type { Bank } from "@apartment-tracker/types";
import { useBanksStore } from "@/store/banksStore";

interface Props {
  open: boolean;
  bank?: Bank | null;
  onClose: (created?: Bank) => void;
}

export default function BankModal({ open, bank, onClose }: Props) {
  const [form] = Form.useForm<{ name: string }>();
  const { createBank, updateBank } = useBanksStore();
  const isEdit = !!bank;

  useEffect(() => {
    if (open) {
      if (bank) {
        form.setFieldsValue({ name: bank.name });
      } else {
        form.resetFields();
      }
    }
  }, [open, bank]);

  const handleOk = async () => {
    const { name } = await form.validateFields();
    if (isEdit) {
      await updateBank(bank.id, name);
      onClose();
    } else {
      const created = await createBank(name);
      onClose(created);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Bank" : "New Bank"}
      open={open}
      onOk={handleOk}
      onCancel={() => onClose()}
      okText="Save"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: "Required" }]}>
          <Input placeholder="e.g. Bank Hapoalim" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
