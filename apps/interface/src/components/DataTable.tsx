"use client";

import { Table, TableProps, TablePaginationConfig } from "antd";

const pagination: TablePaginationConfig = {
  pageSize: 20,
  showSizeChanger: false,
};

export default function DataTable<T extends object>(props: TableProps<T>) {
  return (
    <Table<T>
      size="middle"
      pagination={pagination}
      scroll={{ x: "max-content" }}
      {...props}
    />
  );
}
