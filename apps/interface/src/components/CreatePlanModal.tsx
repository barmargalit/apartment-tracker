"use client";

import { useEffect } from "react";
import { Form, InputNumber, Modal } from "antd";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (totalLoan: number) => void;
}

export default function CreatePlanModal({ open, onClose, onSave }: Props) {
  const [form] = Form.useForm<{ totalLoan: number }>();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSave(values.totalLoan);
    onClose();
  };

  return (
    <Modal
      title="Create Mortgage Plan"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Create"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="totalLoan"
          label="Total Loan Amount (₪)"
          rules={[{ required: true, message: "Required" }]}
        >
          <InputNumber
            min={1}
            precision={0}
            prefix="₪"
            style={{ width: "100%" }}
            placeholder="e.g. 2,000,000"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
