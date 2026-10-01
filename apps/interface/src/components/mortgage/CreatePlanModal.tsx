"use client";

import { useEffect, useState } from "react";
import { Button, Divider, Form, Modal, Select } from "antd";
import NumericInput from "@/components/shared/NumericInput";
import { PlusOutlined } from "@ant-design/icons";
import { useBanksStore } from "@/store/banksStore";
import BankModal from "@/components/banks/BankModal";
import type { Bank } from "@apartment-tracker/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (totalLoan: number, bankId?: string | null) => void;
}

interface FormValues {
  totalLoan: number;
  bankId?: string;
}

export default function CreatePlanModal({ open, onClose, onSave }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const { banks, fetchAll: fetchBanks } = useBanksStore();

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  useEffect(() => {
    if (open) form.resetFields();
  }, [open]);

  const handleBankCreated = (created?: Bank) => {
    setBankModalOpen(false);
    if (created) form.setFieldValue("bankId", created.id);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    onSave(values.totalLoan, values.bankId ?? null);
    onClose();
  };

  return (
    <>
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
            <NumericInput
              min={1}
              precision={0}
              prefix="₪"
              style={{ width: "100%" }}
              placeholder="e.g. 2,000,000"
            />
          </Form.Item>
          <Form.Item name="bankId" label="Bank">
            <Select
              allowClear
              placeholder="None"
              options={banks.map((b) => ({ value: b.id, label: b.name }))}
              popupRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: 0 }} />
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    style={{ width: "100%", textAlign: "left", margin: "6px 0" }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setBankModalOpen(true)}
                  >
                    Add bank
                  </Button>
                </>
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
      <BankModal open={bankModalOpen} onClose={handleBankCreated} />
    </>
  );
}
