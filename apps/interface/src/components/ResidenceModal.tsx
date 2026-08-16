"use client";

import { useEffect } from "react";
import { DatePicker, Form, Input, Modal, Select, Switch, Tabs } from "antd";
import { ThunderboltOutlined, ExperimentOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { Residence, UtilitySettings } from "@apartment-tracker/types";
import { BillType } from "@apartment-tracker/types";
import { useResidencesStore } from "@/store/residencesStore";
import { useProvidersStore } from "@/store/providersStore";

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
  electric_provider_id?: string | null;
  electric_meter_numbers: string[];
  water_provider_id?: string | null;
  water_meter_numbers: string[];
}

export default function ResidenceModal({ open, residence, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const { createResidence, updateResidence } = useResidencesStore();
  const { providers, fetchAll: fetchProviders } = useProvidersStore();
  const isEdit = !!residence;

  const electricProviders = providers.filter((p) => p.type === BillType.Electric);
  const waterProviders = providers.filter((p) => p.type === BillType.Water);

  useEffect(() => {
    if (open) {
      fetchProviders();
      if (residence) {
        form.setFieldsValue({
          city: residence.city,
          street: residence.street,
          current: residence.current === 1,
          start_date: dayjs(residence.start_date),
          end_date: residence.end_date ? dayjs(residence.end_date) : null,
          electric_provider_id: residence.electric_settings?.provider_id ?? null,
          electric_meter_numbers: residence.electric_settings?.meter_numbers ?? [],
          water_provider_id: residence.water_settings?.provider_id ?? null,
          water_meter_numbers: residence.water_settings?.meter_numbers ?? [],
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, residence]);

  const handleOk = async () => {
    const values = await form.validateFields();

    const electric_settings: UtilitySettings = {
      provider_id: values.electric_provider_id ?? null,
      meter_numbers: values.electric_meter_numbers ?? [],
    };
    const water_settings: UtilitySettings = {
      provider_id: values.water_provider_id ?? null,
      meter_numbers: values.water_meter_numbers ?? [],
    };

    const payload = {
      city: values.city,
      street: values.street,
      current: values.current ? 1 : 0,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date ? values.end_date.toISOString() : null,
      electric_settings,
      water_settings,
    };

    if (isEdit) {
      await updateResidence(residence.id, payload);
    } else {
      await createResidence(payload);
    }
    onClose();
  };

  const generalTab = (
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
  );

  const utilityTab = (
    providerField: keyof FormValues,
    metersField: keyof FormValues,
    providerOptions: { id: string; name: string }[],
  ) => (
    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
      <Form.Item name={providerField} label="Provider">
        <Select
          allowClear
          placeholder="Select provider"
          options={providerOptions.map((p) => ({ value: p.id, label: p.name }))}
        />
      </Form.Item>
      <Form.Item name={metersField} label="Meter Numbers">
        <Select mode="tags" placeholder="Type a number and press Enter" open={false} />
      </Form.Item>
    </Form>
  );

  const tabs = [
    { key: "general", label: "General", children: generalTab },
    {
      key: "electric",
      label: <span><ThunderboltOutlined /> Electric</span>,
      children: utilityTab("electric_provider_id", "electric_meter_numbers", electricProviders),
    },
    {
      key: "water",
      label: <span><ExperimentOutlined /> Water</span>,
      children: utilityTab("water_provider_id", "water_meter_numbers", waterProviders),
    },
  ];

  return (
    <Modal
      title={isEdit ? "Edit Residence" : "New Residence"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      destroyOnHidden
    >
      <Tabs items={tabs} />
    </Modal>
  );
}
