"use client";

import { Descriptions } from "antd";
import type { DescriptionsProps } from "antd";
import { MortgageTrackType } from "./MortgageTrackCollapse";
import { TrackInputs, AmortizationRow } from "@/lib/mortgageUtils";

interface Props {
  type: MortgageTrackType;
  inputs: TrackInputs;
  firstRow: AmortizationRow;
}

const fmt = (n: number) =>
  `₪${n.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const pct = (n: number) => `${n}%`;

function buildItems(type: MortgageTrackType, inputs: TrackInputs, firstRow: AmortizationRow): DescriptionsProps["items"] {
  const items: DescriptionsProps["items"] = [
    { key: "principal", label: "Loan Amount", children: fmt(inputs.principal) },
    { key: "term", label: "Term", children: `${inputs.years} years (${inputs.years * 12} mo)` },
  ];

  if (type !== "prime") {
    items.push({ key: "rate", label: "Annual Rate", children: pct(inputs.annualRate ?? 0) });
  }

  if (type === "fixed_index_linked" || type === "variable_index_linked") {
    items.push({ key: "cpi", label: "Expected CPI", children: pct(inputs.annualCpi ?? 0) });
  }

  if (type === "prime") {
    items.push({ key: "prime", label: "Prime Rate", children: pct(inputs.primeRate ?? 0) });
    const spread = inputs.primeSpread ?? 0;
    items.push({ key: "spread", label: "Spread", children: spread >= 0 ? `+${pct(spread)}` : pct(spread) });
    items.push({ key: "effective", label: "Effective Rate", children: pct((inputs.primeRate ?? 0) + (inputs.primeSpread ?? 0)) });
  }

  if (type === "foreign_currency") {
    const fx = inputs.fxAnnualChange ?? 0;
    items.push({ key: "fx", label: "Annual FX Change", children: fx >= 0 ? `+${pct(fx)}` : pct(fx) });
  }

  items.push(
    { key: "payment", label: "First Payment", children: fmt(firstRow.scheduledPayment) },
    { key: "interest", label: "First Month Interest", children: fmt(firstRow.interest) },
    { key: "principal_part", label: "First Month Principal", children: fmt(firstRow.principal) },
  );

  return items;
}

export default function TrackSummary({ type, inputs, firstRow }: Props) {
  return (
    <Descriptions
      bordered
      size="small"
      column={2}
      style={{ marginBottom: 16 }}
      items={buildItems(type, inputs, firstRow)}
    />
  );
}
