"use client";

import { useEffect } from "react";
import dayjs from "dayjs";
import { DatePicker, Divider, Form, Input, Modal, Select, Space, Switch } from "antd";
import type { Dayjs } from "dayjs";
import NumericInput from "./NumericInput";
import type { Prospect, SafeSpace } from "@apartment-tracker/types";
import { useProspectsStore } from "@/store/prospectsStore";

interface Props {
  open: boolean;
  prospect?: Prospect | null;
  onClose: () => void;
}

interface FormValues {
  street: string;
  city: string;
  square_meters: number;
  balcony_square_meters?: number | null;
  rooms: number;
  parking: boolean;
  safe_space: SafeSpace;
  contractor?: string | null;
  comment?: string | null;
  price?: number | null;
  realtor?: boolean;
  realtor_fee?: number | null;
  floor_plan_url?: string | null;
  video_url?: string | null;
  floor?: number | null;
  property_tax?: number | null;
  building_fees?: number | null;
  visited?: Dayjs | null;
}

const SAFE_SPACE_OPTIONS = [
  { value: "Room", label: "Room" },
  { value: "Floor", label: "Floor" },
  { value: "Building", label: "Building" },
  { value: "None", label: "None" },
];

export default function ProspectModal({ open, prospect, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const { createProspect, updateProspect } = useProspectsStore();
  const isEdit = !!prospect;
  const isRealtor = Form.useWatch("realtor", form);

  useEffect(() => {
    if (open) {
      if (prospect) {
        form.setFieldsValue({
          street: prospect.street,
          city: prospect.city,
          square_meters: prospect.square_meters,
          balcony_square_meters: prospect.balcony_square_meters,
          rooms: prospect.rooms,
          parking: prospect.parking,
          safe_space: prospect.safe_space,
          contractor: prospect.contractor,
          comment: prospect.comment,
          price: prospect.price,
          realtor: prospect.realtor,
          realtor_fee: prospect.realtor_fee,
          floor_plan_url: prospect.floor_plan_url,
          video_url: prospect.video_url,
          floor: prospect.floor,
          property_tax: prospect.property_tax,
          building_fees: prospect.building_fees,
          visited: prospect.visited ? dayjs(prospect.visited) : null,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ parking: false, safe_space: "None" as SafeSpace, realtor: false });
      }
    }
  }, [open, prospect]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      balcony_square_meters: values.balcony_square_meters ?? null,
      comment: values.comment ?? null,
      price: values.price ?? null,
      realtor: values.realtor ?? false,
      realtor_fee: values.realtor ? (values.realtor_fee ?? null) : null,
      floor_plan_url: values.floor_plan_url ?? null,
      video_url: values.video_url ?? null,
      floor: values.floor ?? null,
      property_tax: values.property_tax ?? null,
      building_fees: values.building_fees ?? null,
      visited: values.visited ? values.visited.toISOString() : null,
    };
    if (isEdit) {
      await updateProspect(prospect.id, payload);
    } else {
      await createProspect(payload);
    }
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Edit Prospect" : "New Prospect"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      destroyOnHidden
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>

        <Divider titlePlacement="start" style={{ marginTop: 0 }}>Location</Divider>
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item name="street" label="Street" rules={[{ required: true, message: "Required" }]} style={{ flex: 2 }}>
            <Input />
          </Form.Item>
          <Form.Item name="city" label="City" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </div>

        <Divider titlePlacement="start">Property</Divider>
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item name="square_meters" label="m²" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
            <NumericInput min={1} precision={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="balcony_square_meters" label="Balcony m²" style={{ flex: 1 }}>
            <NumericInput min={0} precision={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="rooms" label="Rooms" rules={[{ required: true, message: "Required" }]} style={{ flex: 1 }}>
            <NumericInput min={1} step={0.5} precision={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="floor" label="Floor" style={{ flex: 1 }}>
            <NumericInput min={0} precision={0} style={{ width: "100%" }} />
          </Form.Item>
        </div>

        <Divider titlePlacement="start">Features</Divider>
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item name="safe_space" label="Safe Space" rules={[{ required: true, message: "Required" }]} style={{ flex: 2 }}>
            <Select options={SAFE_SPACE_OPTIONS} />
          </Form.Item>
          <Form.Item name="parking" label="Parking" valuePropName="checked" style={{ flex: 1 }}>
            <Switch />
          </Form.Item>
          <Form.Item name="realtor" label="Realtor" valuePropName="checked" style={{ flex: 1 }}>
            <Switch onChange={(checked) => { if (!checked) form.setFieldValue("realtor_fee", null); }} />
          </Form.Item>
          <Form.Item name="realtor_fee" label="Realtor Fee (%)" style={{ flex: 1 }}>
            <NumericInput min={0} max={100} precision={2} disabled={!isRealtor} style={{ width: "100%" }} />
          </Form.Item>
        </div>

        <Divider titlePlacement="start">Financials</Divider>
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item name="price" label="Price (₪M)" style={{ flex: 1 }}>
            <NumericInput min={0} precision={2} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Property Tax (₪)" style={{ flex: 1 }}>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item name="property_tax" noStyle>
                <NumericInput min={0} precision={2} style={{ width: "100%" }} />
              </Form.Item>
              <Input value="bi-monthly" disabled style={{ width: "auto", color: "inherit" }} />
            </Space.Compact>
          </Form.Item>
          <Form.Item label="Building Fees (₪)" style={{ flex: 1 }}>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item name="building_fees" noStyle>
                <NumericInput min={0} precision={2} style={{ width: "100%" }} />
              </Form.Item>
              <Input value="monthly" disabled style={{ width: "auto", color: "inherit" }} />
            </Space.Compact>
          </Form.Item>
        </div>

        <Divider titlePlacement="start">Details</Divider>
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item name="contractor" label="Contractor" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
          <Form.Item name="visited" label="Visited" style={{ flex: 1 }}>
            <DatePicker format="DD/MM/YY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="floor_plan_url" label="Floor Plan (PDF URL)" style={{ flex: 1 }}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="video_url" label="Video URL" style={{ flex: 1 }}>
            <Input placeholder="file:///..." />
          </Form.Item>
        </div>
        <Form.Item name="comment" label="Comment">
          <Input.TextArea maxLength={500} showCount autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>

      </Form>
    </Modal>
  );
}
