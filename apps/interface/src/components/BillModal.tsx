"use client";

import { useEffect, useRef, useState } from "react";
import { Button, DatePicker, Divider, Form, Input, InputNumber, Modal, Select } from "antd";
import NumericInput from "./NumericInput";
import { PlusOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { Bill, BillPeriod, BillType, ElectricBillData, Provider, WaterBillData } from "@apartment-tracker/types";
import { useBillsStore } from "@/store/billsStore";
import { useResidencesStore } from "@/store/residencesStore";
import { useProvidersStore } from "@/store/providersStore";
import { useContractsStore } from "@/store/contractsStore";
import { useResidentsStore } from "@/store/residentsStore";
import ProviderModal from "./ProviderModal";
import { BILL_TYPE_OPTIONS } from "@/lib/billTypes";

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
  resident_id?: string | null;
  provider_id?: string | null;
  contract_id?: string | null;
  comment?: string | null;
  // electric & water only
  usage?: number;
  period?: BillPeriod;
  year?: number;
}


const PERIOD_OPTIONS = [1, 2, 3, 4, 5, 6].map((p) => ({ value: p, label: `Period ${p}` }));

const USAGE_TYPES = new Set(["electric", "water"]);
const YEAR_TYPES = new Set(["electric", "water", "property_tax"]);

export default function BillModal({ open, bill, defaultType, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const selectedType = Form.useWatch("type", form);
  const selectedResidenceId = Form.useWatch("residence_id", form);
  const selectedResidentId = Form.useWatch("resident_id", form);
  const selectedContractId = Form.useWatch("contract_id", form);
  const showUsage = USAGE_TYPES.has(selectedType);
  const showYear = YEAR_TYPES.has(selectedType);
  const usageSuffix = selectedType === "electric" ? "kWh" : "m³";

  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const skipContractPriceFill = useRef(false);

  const { bills, createBill, updateBill } = useBillsStore();
  const { residences, fetchAll: fetchResidences } = useResidencesStore();
  const { providers, fetchAll: fetchProviders } = useProvidersStore();
  const { contracts, fetchAll: fetchContracts } = useContractsStore();
  const { residents, fetchAll: fetchResidents } = useResidentsStore();
  const isEdit = !!bill;

  const handleProviderCreated = (created?: Provider) => {
    setProviderModalOpen(false);
    if (created) form.setFieldValue("provider_id", created.id);
  };

  useEffect(() => {
    if (selectedType) fetchProviders(selectedType as BillType);
  }, [selectedType]);

  useEffect(() => {
    if (!open || isEdit) return;
    const residence = residences.find((r) => r.id === selectedResidenceId) ?? null;
    let autoProvider: string | null | undefined = null;
    if (selectedType === "electric") {
      autoProvider = residence?.electric_settings?.provider_id;
    } else if (selectedType === "water") {
      autoProvider = residence?.water_settings?.provider_id;
    }
    if (!autoProvider) {
      autoProvider = selectedType ? (bills[selectedType as BillType] ?? [])[0]?.provider_id : null;
    }
    form.setFieldValue("provider_id", autoProvider ?? null);
  }, [selectedType, selectedResidenceId, open]);

  useEffect(() => {
    if (!selectedContractId) return;
    const contract = contracts.find((c) => c.id === selectedContractId);
    if (!contract) return;
    const patch: Partial<FormValues> = {
      provider_id: contract.provider_id ?? null,
      residence_id: contract.residence_id ?? null,
      resident_id: contract.resident_id ?? null,
    };
    if (!skipContractPriceFill.current) {
      patch.price = contract.monthly_price;
    }
    skipContractPriceFill.current = false;
    form.setFieldsValue(patch);
  }, [selectedContractId]);

  useEffect(() => {
    if (open) {
      fetchResidences();
      fetchContracts();
      fetchResidents();

      const currentResidence = residences.find((r) => r.current === 1) ?? null;

      if (bill) {
        skipContractPriceFill.current = true;
        const data = bill.data as ElectricBillData & WaterBillData;
        form.setFieldsValue({
          type: bill.type,
          start_date: dayjs(bill.start_date),
          end_date: dayjs(bill.end_date),
          price: bill.price,
          residence_id: bill.residence_id,
          resident_id: bill.resident_id,
          provider_id: bill.provider_id,
          contract_id: bill.contract_id,
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
    } else if (showYear) {
      data.year = values.year;
    }

    const payload = {
      type:         values.type,
      start_date:   values.start_date.toISOString(),
      end_date:     values.end_date.toISOString(),
      price:        values.price,
      residence_id: values.residence_id ?? null,
      resident_id:  values.resident_id ?? null,
      provider_id:  values.provider_id ?? null,
      contract_id:  values.contract_id ?? null,
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

  const providerById = Object.fromEntries(providers.map((p) => [p.id, p]));
  const residenceById = Object.fromEntries(residences.map((r) => [r.id, r]));
  const residentById = Object.fromEntries(residents.map((r) => [r.id, r]));

  const contractOptions = contracts
    .filter((c) => !selectedType || c.bill_type === selectedType)
    .map((c) => {
      const providerName = providerById[c.provider_id]?.name ?? c.bill_type;
      const assignee = c.resident_id
        ? residentById[c.resident_id]?.name
        : c.residence_id
        ? (() => { const r = residenceById[c.residence_id!]; return r ? `${r.street}, ${r.city}` : undefined; })()
        : undefined;
      const dates = `${dayjs(c.start_date).format("DD/MM/YY")}${c.end_date ? ` → ${dayjs(c.end_date).format("DD/MM/YY")}` : ""}`;
      const label = [providerName, assignee, dates].filter(Boolean).join(" · ");
      return { value: c.id, label };
    });

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
              <NumericInput min={0} precision={2} prefix="₪" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="usage" label="Usage" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
              <NumericInput min={0} suffix={usageSuffix} style={{ width: "100%" }} />
            </Form.Item>
          </div>
        ) : (
          <Form.Item name="price" label="Price" rules={[{ required: true, message: "Required" }]}>
            <NumericInput min={0} precision={2} prefix="₪" style={{ width: "100%" }} />
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

        {showYear && !showUsage && (
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
        )}

        <Form.Item name="comment" label="Comment">
          <Input.TextArea maxLength={200} showCount autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>

        <Form.Item name="contract_id" label="Contract">
          <Select allowClear placeholder="None" options={contractOptions} />
        </Form.Item>

        <div style={{ display: "flex", gap: 24 }}>
          <Form.Item name="residence_id" label="Residence" style={{ flex: 1 }}>
            <Select
              allowClear
              placeholder="None"
              disabled={!!selectedResidentId}
              options={residences.map((r) => ({ value: r.id, label: `${r.street}, ${r.city}` }))}
            />
          </Form.Item>

          <Form.Item name="resident_id" label="Resident" style={{ flex: 1 }}>
            <Select
              allowClear
              placeholder="None"
              disabled={!!selectedResidenceId}
              options={residents.map((r) => ({ value: r.id, label: r.name }))}
            />
          </Form.Item>
        </div>

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
