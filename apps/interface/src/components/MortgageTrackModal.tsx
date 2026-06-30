"use client";

import { useEffect } from "react";
import { Divider, Form, InputNumber, Modal, Select } from "antd";
import { MortgageTrack, MortgageTrackType, TRACK_LABELS } from "./MortgageTrackCollapse";
import { TrackInputs } from "@/lib/mortgageUtils";

interface Props {
  open: boolean;
  editingTrack?: MortgageTrack | null;
  onClose: () => void;
  onSave: (type: MortgageTrackType, inputs: TrackInputs) => void;
}

interface FormValues {
  type: MortgageTrackType;
  principal: number;
  years: number;
  annualRate?: number;
  annualCpi?: number;
  primeRate?: number;
  primeSpread?: number;
  fxAnnualChange?: number;
}

const TRACK_OPTIONS = (Object.entries(TRACK_LABELS) as [MortgageTrackType, string][]).map(
  ([value, label]) => ({ value, label }),
);

const NEEDS_RATE = new Set<MortgageTrackType>([
  "fixed_unlinked", "fixed_index_linked", "variable_index_linked", "foreign_currency",
]);
const NEEDS_CPI = new Set<MortgageTrackType>(["fixed_index_linked", "variable_index_linked"]);

export default function MortgageTrackModal({ open, editingTrack, onClose, onSave }: Props) {
  const [form] = Form.useForm<FormValues>();
  const selectedType = Form.useWatch("type", form);
  const isEdit = !!editingTrack;

  const showRate = NEEDS_RATE.has(selectedType);
  const showCpi = NEEDS_CPI.has(selectedType);
  const showPrime = selectedType === "prime";
  const showFx = selectedType === "foreign_currency";

  useEffect(() => {
    if (open) {
      if (editingTrack) {
        const i = editingTrack.inputs ?? {};
        form.setFieldsValue({ type: editingTrack.type, ...i });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingTrack]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const inputs: TrackInputs = {
      principal: values.principal,
      years: values.years,
      annualRate: values.annualRate ?? 0,
      annualCpi: values.annualCpi,
      primeRate: values.primeRate,
      primeSpread: values.primeSpread,
      fxAnnualChange: values.fxAnnualChange,
    };
    onSave(values.type, inputs);
    form.resetFields();
    onClose();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Edit Track" : "Add Track"}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isEdit ? "Save" : "Add"}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="type" label="Track Type" rules={[{ required: true, message: "Required" }]}>
          <Select options={TRACK_OPTIONS} placeholder="Select a mortgage track type" />
        </Form.Item>

        {selectedType && (
          <>
            <Divider style={{ margin: "8px 0 16px" }} />

            <div style={{ display: "flex", gap: 16 }}>
              <Form.Item
                name="principal"
                label="Loan Amount (₪)"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={1} precision={0} style={{ width: "100%" }} prefix="₪" />
              </Form.Item>
              <Form.Item
                name="years"
                label="Term (years)"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={1} max={40} precision={0} style={{ width: "100%" }} />
              </Form.Item>
            </div>

            {showRate && (
              <Form.Item
                name="annualRate"
                label="Annual Interest Rate (%)"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber min={0} max={30} precision={2} step={0.1} suffix="%" style={{ width: "100%" }} />
              </Form.Item>
            )}

            {showCpi && (
              <Form.Item
                name="annualCpi"
                label="Expected Annual CPI (%)"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber min={0} max={20} precision={2} step={0.1} suffix="%" style={{ width: "100%" }} />
              </Form.Item>
            )}

            {showPrime && (
              <div style={{ display: "flex", gap: 16 }}>
                <Form.Item
                  name="primeRate"
                  label="Prime Rate (%)"
                  rules={[{ required: true, message: "Required" }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber min={0} max={20} precision={2} step={0.1} suffix="%" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  name="primeSpread"
                  label="Spread (%)"
                  tooltip="Added to prime rate. Can be negative (e.g. prime – 0.5)"
                  rules={[{ required: true, message: "Required" }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber min={-5} max={5} precision={2} step={0.1} suffix="%" style={{ width: "100%" }} />
                </Form.Item>
              </div>
            )}

            {showFx && (
              <Form.Item
                name="fxAnnualChange"
                label="Expected Annual FX Change (%)"
                tooltip="Positive = foreign currency appreciates (loan costs more in ILS over time)"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber min={-20} max={20} precision={2} step={0.1} suffix="%" style={{ width: "100%" }} />
              </Form.Item>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
}
