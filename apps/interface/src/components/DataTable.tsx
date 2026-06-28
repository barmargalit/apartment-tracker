"use client";

import { Table, TableProps, TablePaginationConfig } from "antd";
import EmptyState from "./EmptyState";

const pagination: TablePaginationConfig = {
  pageSize: 5,
  showSizeChanger: false,
};

export default function DataTable<T extends object>(props: TableProps<T>) {
  return (
    <Table<T>
      size="middle"
      pagination={pagination}
      scroll={{ x: "max-content" }}
      sticky={{ offsetHeader: 0 }}
      locale={{ emptyText: <EmptyState /> }}
      {...props}
    />
  );
}
