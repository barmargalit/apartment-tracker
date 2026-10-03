import { Tag } from "antd";
import { BillType } from "@xpensive/types";

export const BILL_TYPE_COLOR: Record<BillType, string> = {
  [BillType.Electric]: "gold",
  [BillType.Water]: "blue",
  [BillType.Internet]: "purple",
  [BillType.Gas]: "orange",
  [BillType.PropertyTax]: "green",
  [BillType.BuildingFee]: "cyan",
  [BillType.Cellular]: "magenta",
  [BillType.Rent]: "volcano",
};

export const BILL_TYPE_LABEL: Record<BillType, string> = {
  [BillType.Electric]: "Electric",
  [BillType.Water]: "Water",
  [BillType.Internet]: "Internet",
  [BillType.Gas]: "Gas",
  [BillType.PropertyTax]: "Property Tax",
  [BillType.BuildingFee]: "Building Fee",
  [BillType.Cellular]: "Cellular",
  [BillType.Rent]: "Rent",
};

export const BILL_TYPE_OPTIONS = (Object.values(BillType) as BillType[]).map((v) => ({
  value: v,
  label: BILL_TYPE_LABEL[v],
}));

export function BillTypeTag({ type, style }: { type: BillType | string; style?: React.CSSProperties }) {
  const t = type as BillType;
  return (
    <Tag color={BILL_TYPE_COLOR[t] ?? "default"} style={style}>
      {BILL_TYPE_LABEL[t] ?? type}
    </Tag>
  );
}
