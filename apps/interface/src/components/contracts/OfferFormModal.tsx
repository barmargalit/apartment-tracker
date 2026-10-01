"use client";

import { useEffect } from "react";
import { Checkbox, DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { BillType, CellularContractData, ContractOffer, ContractOfferStatus, InternetContractData } from "@apartment-tracker/types";
import { useContractOffersStore } from "@/store/contractOffersStore";
import NumericInput from "@/components/shared/NumericInput";
import ProviderSelect from "@/components/providers/ProviderSelect";

const STATUS_OPTIONS: { value: ContractOfferStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

interface Props {
  open: boolean;
  contractId: string;
  billType: BillType;
  offer?: ContractOffer | null;
  onClose: () => void;
}

interface FormValues {
  provider_id: string;
  monthly_price: number;
  received_date: Dayjs;
  status: ContractOfferStatus;
  comment?: string | null;
  // cellular
  data_gb?: number;
  calls_unlimited?: boolean;
  calls_minutes?: number;
  sms_unlimited?: boolean;
  sms_count?: number;
  // internet
  speed_mbps?: number;
}

export default function OfferFormModal({ open, contractId, billType, offer, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const callsUnlimited = Form.useWatch("calls_unlimited", form);
  const smsUnlimited = Form.useWatch("sms_unlimited", form);

  const isCellular = billType === "cellular";
  const isInternet = billType === "internet";
  const isEdit = !!offer;

  const { createOffer, updateOffer } = useContractOffersStore();

  useEffect(() => {
    if (!open) return;

    if (offer) {
      const d = offer.data as Partial<CellularContractData & InternetContractData>;
      form.setFieldsValue({
        provider_id: offer.provider_id,
        monthly_price: offer.monthly_price,
        received_date: dayjs(offer.received_date),
        status: offer.status,
        comment: offer.comment,
        data_gb: d.data_gb,
        calls_unlimited: d.calls_unlimited,
        calls_minutes: d.calls_minutes,
        sms_unlimited: d.sms_unlimited,
        sms_count: d.sms_count,
        speed_mbps: d.speed_mbps,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ received_date: dayjs(), status: "pending" });
    }
  }, [open, offer]);

  const handleOk = async () => {
    const values = await form.validateFields();

    let data: Record<string, unknown> = {};
    if (isCellular) {
      data = {
        data_gb: values.data_gb,
        calls_unlimited: values.calls_unlimited ?? false,
        calls_minutes: values.calls_unlimited ? undefined : values.calls_minutes,
        sms_unlimited: values.sms_unlimited ?? false,
        sms_count: values.sms_unlimited ? undefined : values.sms_count,
      };
    } else if (isInternet) {
      data = { speed_mbps: values.speed_mbps };
    }

    const payload = {
      provider_id: values.provider_id,
      bill_type: billType,
      monthly_price: values.monthly_price,
      received_date: values.received_date.format("YYYY-MM-DD"),
      status: values.status,
      comment: values.comment ?? null,
      data,
    };

    if (isEdit) {
      await updateOffer(offer.id, contractId, payload);
    } else {
      await createOffer({ ...payload, contract_id: contractId });
    }
    onClose();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Edit Offer" : "New Offer"}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Save"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="provider_id" label="Provider" rules={[{ required: true, message: "Required" }]}>
          <ProviderSelect billType={billType} placeholder="Select provider" />
        </Form.Item>

        <Form.Item name="monthly_price" label="Monthly Price" rules={[{ required: true, message: "Required" }]}>
          <NumericInput min={0} precision={2} prefix="₪" style={{ width: "100%" }} />
        </Form.Item>

        <div style={{ display: "flex", gap: 24 }}>
          <Form.Item name="received_date" label="Received Date" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
            <DatePicker format="DD/MM/YY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </div>

        {isCellular && (
          <>
            <Form.Item name="data_gb" label="Data (GB)" rules={[{ required: true, message: "Required" }]}>
              <InputNumber min={0} precision={0} style={{ width: "100%" }} placeholder="e.g. 500" />
            </Form.Item>

            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <Form.Item name="calls_unlimited" valuePropName="checked" style={{ flex: 1, marginBottom: 0 }}>
                <Checkbox>Unlimited Calls</Checkbox>
              </Form.Item>
              {!callsUnlimited && (
                <Form.Item name="calls_minutes" label="Call Minutes" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
                  <InputNumber min={0} precision={0} style={{ width: "100%" }} placeholder="minutes" />
                </Form.Item>
              )}
            </div>

            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: 8 }}>
              <Form.Item name="sms_unlimited" valuePropName="checked" style={{ flex: 1, marginBottom: 0 }}>
                <Checkbox>Unlimited SMS</Checkbox>
              </Form.Item>
              {!smsUnlimited && (
                <Form.Item name="sms_count" label="SMS Count" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
                  <InputNumber min={0} precision={0} style={{ width: "100%" }} placeholder="messages" />
                </Form.Item>
              )}
            </div>
          </>
        )}

        {isInternet && (
          <Form.Item name="speed_mbps" label="Speed (Mbps)" rules={[{ required: true, message: "Required" }]}>
            <InputNumber min={0} precision={0} style={{ width: "100%" }} placeholder="e.g. 1000" />
          </Form.Item>
        )}

        <Form.Item name="comment" label="Comment" style={{ marginTop: 8 }}>
          <Input.TextArea maxLength={200} showCount autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
