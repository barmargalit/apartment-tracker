"use client";

import { Card, Tag, Tooltip, Typography, theme } from "antd";
import { useModal } from "./ThemeProvider";
import { DeleteOutlined, EditOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Residence } from "@apartment-tracker/types";

const DATE_FORMAT = "DD/MM/YY";

interface Props {
  residence: Residence;
  onToggleCurrent: (residence: Residence) => void;
  onEdit: (residence: Residence) => void;
  onDelete: (residence: Residence) => void;
}

export default function ResidenceCard({ residence, onToggleCurrent, onEdit, onDelete }: Props) {
  const { token } = theme.useToken();
  const modal = useModal();
  const isCurrent = residence.current === 1;

  const handleDelete = () => {
    modal.confirm({
      title: "Delete Residence",
      content: `Are you sure you want to delete ${residence.street}, ${residence.city}?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => onDelete(residence),
    });
  };

  const actions = [
    <Tooltip key="current" title={isCurrent ? "Mark as previous" : "Mark as current"}>
      {isCurrent
        ? <HeartFilled style={{ color: token.colorPrimary }} onClick={() => onToggleCurrent(residence)} />
        : <HeartOutlined onClick={() => onToggleCurrent(residence)} />
      }
    </Tooltip>,
    <Tooltip key="edit" title="Edit">
      <EditOutlined onClick={() => onEdit(residence)} />
    </Tooltip>,
    <Tooltip key="delete" title="Delete">
      <DeleteOutlined style={{ color: token.colorError }} onClick={handleDelete} />
    </Tooltip>,
  ];

  return (
    <Card
      title={residence.street}
      actions={actions}
      style={{
        minWidth: 360,
        ...(isCurrent ? {
          borderColor: token.colorPrimary,
          boxShadow: `0 0 0 2px ${token.colorPrimary}26`,
        } : {}),
      }}
    >
      <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
        {residence.city}
      </Typography.Text>
      <Typography.Text style={{ display: "block" }}>
        {dayjs(residence.start_date).format(DATE_FORMAT)}
        {" — "}
        {residence.end_date ? dayjs(residence.end_date).format(DATE_FORMAT) : "Present"}
      </Typography.Text>
      {residence.electric_settings?.meter_numbers && residence.electric_settings.meter_numbers.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12, marginRight: 6 }}>Electric:</Typography.Text>
          {residence.electric_settings.meter_numbers.map((n) => <Tag key={n}>{n}</Tag>)}
        </div>
      )}
      {residence.water_settings?.meter_numbers && residence.water_settings.meter_numbers.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12, marginRight: 6 }}>Water:</Typography.Text>
          {residence.water_settings.meter_numbers.map((n) => <Tag key={n}>{n}</Tag>)}
        </div>
      )}
    </Card>
  );
}
