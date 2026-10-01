"use client";

import { useEffect, useState } from "react";
import { Button, DatePicker, Form, Modal, Space, Table, Tag, Typography, theme } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, CheckOutlined, DeleteOutlined, EditOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { CellularContractData, Contract, ContractOffer, InternetContractData, Provider } from "@apartment-tracker/types";
import { useContractOffersStore } from "@/store/contractOffersStore";
import { useContractsStore } from "@/store/contractsStore";
import { useModal } from "@/components/ThemeProvider";
import OfferFormModal from "./OfferFormModal";

const DATE_FORMAT = "DD/MM/YY";

const STATUS_COLOR: Record<string, string> = {
  pending: "default",
  accepted: "green",
  rejected: "red",
  expired: "orange",
};

interface Props {
  open: boolean;
  contract: Contract | null;
  providers: Provider[];
  onClose: () => void;
}

interface Entry {
  key: string;
  isCurrent: boolean;
  offer?: ContractOffer;
}

interface FieldRow {
  key: string;
  label: string;
  render: (entry: Entry) => React.ReactNode;
}

export default function CompareOffersModal({ open, contract, providers, onClose }: Props) {
  const { token } = theme.useToken();
  const modal = useModal();
  const [formOpen, setFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ContractOffer | null>(null);
  const [acceptingOffer, setAcceptingOffer] = useState<ContractOffer | null>(null);
  const [acceptForm] = Form.useForm<{ effective_date: dayjs.Dayjs; end_date?: dayjs.Dayjs | null }>();

  const { offersByContract, fetchByContract, updateOffer, deleteOffer } = useContractOffersStore();
  const { fetchAll: fetchContracts } = useContractsStore();

  const offers = contract ? offersByContract[contract.id] ?? [] : [];
  const providerById = Object.fromEntries(providers.map((p) => [p.id, p]));

  useEffect(() => {
    if (open && contract) fetchByContract(contract.id);
  }, [open, contract]);

  if (!contract) return null;

  const endDatePresets = [6, 12, 18, 24].map((months) => ({
    label: `${months} months`,
    value: () => dayjs(acceptForm.getFieldValue("effective_date") ?? dayjs()).add(months, "month"),
  }));

  const handleAcceptOk = async () => {
    const values = await acceptForm.validateFields();
    await updateOffer(acceptingOffer!.id, contract.id, {
      status: "accepted",
      effective_date: values.effective_date.format("YYYY-MM-DD"),
      new_contract_end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
    });
    await fetchContracts();
    setAcceptingOffer(null);
  };

  const fmt = (n: number) =>
    `₪${n.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const priceCell = (entry: Entry) => {
    const price = entry.isCurrent ? contract.monthly_price : entry.offer!.monthly_price;
    if (entry.isCurrent) return <span>{fmt(price)}</span>;

    const delta = price - contract.monthly_price;
    const pct = contract.monthly_price ? (delta / contract.monthly_price) * 100 : 0;
    const color = delta <= 0 ? token.colorSuccess : token.colorError;
    return (
      <span>
        <div>{fmt(price)}</div>
        <div style={{ color, fontSize: 12 }}>
          {delta > 0 ? "+" : ""}{fmt(delta)} ({delta > 0 ? "+" : ""}{pct.toFixed(1)}%)
        </div>
      </span>
    );
  };

  const dataOf = (entry: Entry) =>
    (entry.isCurrent ? contract.data : entry.offer!.data) as Partial<CellularContractData & InternetContractData>;

  const comparableValueCell = (entry: Entry, value: number | undefined, currentValue: number | undefined, unit: string) => {
    if (value === undefined) return "-";
    if (entry.isCurrent || currentValue === undefined) return `${value} ${unit}`;

    const Icon = value > currentValue ? ArrowUpOutlined : value < currentValue ? ArrowDownOutlined : MinusOutlined;
    const color = value > currentValue ? token.colorSuccess : value < currentValue ? token.colorError : token.colorTextSecondary;
    return (
      <span>
        {value} {unit} <Icon style={{ color }} />
      </span>
    );
  };

  const rows: FieldRow[] = [
    {
      key: "provider",
      label: "Provider",
      render: (e) => providerById[e.isCurrent ? contract.provider_id : e.offer!.provider_id]?.name ?? "-",
    },
    {
      key: "price",
      label: "Monthly Price",
      render: priceCell,
    },
    ...(contract.bill_type === "cellular"
      ? [
          {
            key: "data_gb",
            label: "Data",
            render: (e: Entry) => comparableValueCell(e, dataOf(e).data_gb, dataOf({ key: "current", isCurrent: true }).data_gb, "GB"),
          },
          {
            key: "calls",
            label: "Calls",
            render: (e: Entry) => (dataOf(e).calls_unlimited ? "Unlimited" : `${dataOf(e).calls_minutes ?? "-"} min`),
          },
          {
            key: "sms",
            label: "SMS",
            render: (e: Entry) => (dataOf(e).sms_unlimited ? "Unlimited" : `${dataOf(e).sms_count ?? "-"}`),
          },
        ]
      : []),
    ...(contract.bill_type === "internet"
      ? [
          {
            key: "speed",
            label: "Speed",
            render: (e: Entry) => comparableValueCell(e, dataOf(e).speed_mbps, dataOf({ key: "current", isCurrent: true }).speed_mbps, "Mbps"),
          },
        ]
      : []),
    {
      key: "date",
      label: "Date",
      render: (e) => dayjs(e.isCurrent ? contract.start_date : e.offer!.received_date).format(DATE_FORMAT),
    },
    {
      key: "status",
      label: "Status",
      render: (e) =>
        e.isCurrent
          ? <Tag color="blue">Current</Tag>
          : <Tag color={STATUS_COLOR[e.offer!.status]}>{e.offer!.status}</Tag>,
    },
    {
      key: "comment",
      label: "Comment",
      render: (e) => (e.isCurrent ? contract.comment : e.offer!.comment) ?? "-",
    },
    {
      key: "actions",
      label: "",
      render: (e) => {
        if (e.isCurrent) return null;
        const offer = e.offer!;
        return (
          <Space>
            {offer.status !== "accepted" && (
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                title="Accept offer"
                onClick={() => {
                  acceptForm.setFieldsValue({ effective_date: dayjs() });
                  setAcceptingOffer(offer);
                }}
              />
            )}
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditingOffer(offer); setFormOpen(true); }} />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                modal.confirm({
                  title: "Delete Offer",
                  content: "Are you sure you want to delete this offer?",
                  okText: "Delete",
                  okButtonProps: { danger: true },
                  onOk: () => deleteOffer(offer.id, contract.id),
                })
              }
            />
          </Space>
        );
      },
    },
  ];

  const entries: Entry[] = [
    { key: "current", isCurrent: true },
    ...offers.map((o) => ({ key: o.id, isCurrent: false, offer: o })),
  ];

  const columns = [
    {
      title: "",
      dataIndex: "label",
      key: "label",
      fixed: "left" as const,
      width: 140,
      render: (label: string) => <Typography.Text strong>{label}</Typography.Text>,
    },
    ...entries.map((entry) => ({
      title: entry.isCurrent ? "Current Contract" : (providerById[entry.offer!.provider_id]?.name ?? "Offer"),
      key: entry.key,
      width: 180,
      render: (_: unknown, row: FieldRow) => row.render(entry),
    })),
  ];

  return (
    <>
      <Modal
        title={`Compare Offers`}
        open={open}
        onCancel={onClose}
        footer={<Button icon={<PlusOutlined />} onClick={() => { setEditingOffer(null); setFormOpen(true); }}>Add Offer</Button>}
        width="90vw"
        style={{ top: 24 }}
        destroyOnHidden
      >
        <Table
          rowKey="key"
          columns={columns}
          dataSource={rows}
          pagination={false}
          scroll={{ x: "max-content" }}
          size="small"
        />
      </Modal>

      <OfferFormModal
        open={formOpen}
        contractId={contract.id}
        billType={contract.bill_type}
        offer={editingOffer}
        onClose={() => { setFormOpen(false); setEditingOffer(null); }}
      />

      <Modal
        title="Accept Offer"
        open={!!acceptingOffer}
        onOk={handleAcceptOk}
        onCancel={() => setAcceptingOffer(null)}
        okText="Accept"
        destroyOnHidden
      >
        <Form form={acceptForm} layout="vertical">
          <Form.Item
            name="effective_date"
            label="Effective date"
            rules={[{ required: true, message: "Please select the date this offer takes effect" }]}
          >
            <DatePicker format={DATE_FORMAT} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="end_date" label="End date">
            <DatePicker format={DATE_FORMAT} style={{ width: "100%" }} presets={endDatePresets} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
