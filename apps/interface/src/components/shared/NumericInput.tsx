"use client";

import { InputNumber, InputNumberProps } from "antd";

type Props = Omit<InputNumberProps<number>, "formatter" | "parser">;

export default function NumericInput(props: Props) {
  return (
    <InputNumber<number>
      {...props}
      formatter={(value) =>
        value !== undefined && value !== null
          ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          : ""
      }
      parser={(value) =>
        value ? (parseFloat(value.replace(/,/g, "")) as number) : (0 as number)
      }
    />
  );
}
