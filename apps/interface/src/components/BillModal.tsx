"use client";

import { useEffect, useState } from "react";
import { Button, DatePicker, Divider, Form, Input, InputNumber, Modal, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { Bill, BillPeriod, BillType, ElectricBillData, Provider, WaterBillData } from "@apartment-tracker/types";
import { useBillsStore } from "@/store/billsStore";
import { useResidencesStore } from "@/store/residencesStore";
import { useProvidersStore } from "@/store/providersStore";
import ProviderModal from "./ProviderModal";

interface Props {
  open: boolean;
  bill?: Bill | null;
  defaultType?: BillType;
  onClose: () => void;
}

interface FormValues {
  type: BillType;
  start_date: Dayjs;
  end_date: Dayjs;
  price: number;
  residence_id?: string | null;
  provider_id?: string | null;
  comment?: string | null;
  // electric & water only
  usage?: number;
  period?: BillPeriod;
  year?: number;
}

const BILL_TYPE_OPTIONS = [
  { value: "electric", label: "Electric" },
  { value: "water",    label: "Water" },
  { value: "internet", label: "Internet" },
  { value: "gas",      label: "Gas" },
];

const PERIOD_OPTIONS = [1, 2, 3, 4, 5, 6].map((p) => ({ value: p, label: `Period ${p}` }));

const USAGE_TYPES = new Set(["electric", "water"]);

export default function BillModal({ open, bill, defaultType, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const selectedType = Form.useWatch("type", form);
  const showUsage = USAGE_TYPES.has(selectedType);
  const usageSuffix = selectedType === "electric" ? "kWh" : "m³";

  const [providerModalOpen, setProviderModalOpen] = useState(false);

  const { createBill, updateBill } = useBillsStore();
  const { residences, fetchAll: fetchResidences } = useResidencesStore();
  const { providers, fetchAll: fetchProviders } = useProvidersStore();
  const isEdit = !!bill;

  const handleProviderCreated = (created?: Provider) => {
    setProviderModalOpen(false);
    if (created) form.setFieldValue("provider_id", created.id);
  };

  useEffect(() => {
    if (selectedType) fetchProviders(selectedType as BillType);
  }, [selectedType]);

  useEffect(() => {
    if (open) {
      fetchResidences();

      const currentResidence = residences.find((r) => r.current === 1) ?? null;

      if (bill) {
        const data = bill.data as ElectricBillData & WaterBillData;
        form.setFieldsValue({
          type: bill.type,
          start_date: dayjs(bill.start_date),
          end_date: dayjs(bill.end_date),
          price: bill.price,
          residence_id: bill.residence_id,
          provider_id: bill.provider_id,
          usage: data.usage,
          period: data.period,
          year: data.year,
          comment: bill.comment,
        });
      } else {
        form.resetFields();
        if (defaultType) form.setFieldValue("type", defaultType);
        if (currentResidence) form.setFieldValue("residence_id", currentResidence.id);
      }
    }
  }, [open, bill]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const data: Record<string, unknown> = {};
    if (showUsage) {
      data.usage  = values.usage;
      data.period = values.period;
      data.year   = values.year;
    }

    const payload = {
      type:         values.type,
      start_date:   values.start_date.toISOString(),
      end_date:     values.end_date.toISOString(),
      price:        values.price,
      residence_id: values.residence_id ?? null,
      provider_id:  values.provider_id ?? null,
      comment:      values.comment ?? null,
      data,
    };

    if (isEdit) {
      await updateBill(bill.id, bill.type, payload);
    } else {
      await createBill(payload);
    }
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Edit Bill" : "New Bill"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="type" label="Type" rules={[{ required: true, message: "Required" }]}>
          <Select options={BILL_TYPE_OPTIONS} />
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
              { required: true, message: "Required" },
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
            <DatePicker format="DD/MM/YY" style={{ width: "100%" }} />
          </Form.Item>
        </div>

        {showUsage ? (
          <div style={{ display: "flex", gap: 24 }}>
            <Form.Item name="price" label="Price" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
              <InputNumber min={0} precision={2} prefix="₪" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="usage" label="Usage" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
              <InputNumber min={0} suffix={usageSuffix} style={{ width: "100%" }} />
            </Form.Item>
          </div>
        ) : (
          <Form.Item name="price" label="Price" rules={[{ required: true, message: "Required" }]}>
            <InputNumber min={0} precision={2} prefix="₪" style={{ width: "100%" }} />
          </Form.Item>
        )}

        {showUsage && (
          <div style={{ display: "flex", gap: 24 }}>
              <Form.Item name="period" label="Period" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
                <Select options={PERIOD_OPTIONS} />
              </Form.Item>

              <Form.Item
                name="year"
                label="Year"
                hasFeedback
                rules={[
                  { required: true, message: "Required" },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null) return Promise.resolve();
                      const current = new Date().getFullYear();
                      if (!Number.isInteger(value) || value < 1 || value > current) {
                        return Promise.reject(`Year must be between 1 and ${current}`);
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={1}
                  max={new Date().getFullYear()}
                  precision={0}
                  parser={(val) => (val ? parseInt(val.replace(/\D/g, ""), 10) : (0 as never))}
                  placeholder={String(new Date().getFullYear())}
                  style={{ width: "100%" }}
                />
              </Form.Item>
          </div>
        )}

        <Form.Item name="comment" label="Comment">
          <Input.TextArea maxLength={200} showCount autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>

        <Form.Item name="residence_id" label="Residence">
          <Select
            allowClear
            placeholder="None"
            options={residences.map((r) => ({ value: r.id, label: `${r.street}, ${r.city}` }))}
          />
        </Form.Item>

        <Form.Item name="provider_id" label="Provider">
          <Select
            allowClear
            placeholder="None"
            options={providers.map((p) => ({ value: p.id, label: p.name }))}
            popupRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: 0 }} />
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  style={{ width: "100%", textAlign: "left", margin: "6px 0" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setProviderModalOpen(true)}
                >
                  Add provider
                </Button>
              </>
            )}
          />
        </Form.Item>
      </Form>

      <ProviderModal
        open={providerModalOpen}
        defaultType={selectedType as BillType}
        onClose={handleProviderCreated}
      />
    </Modal>
  );
}
