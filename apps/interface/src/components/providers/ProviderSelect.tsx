"use client";

import { useEffect, useState } from "react";
import { Button, Divider, Select } from "antd";
import type { SelectProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { BillType, Provider } from "@apartment-tracker/types";
import { useProvidersStore } from "@/store/providersStore";
import ProviderModal from "./ProviderModal";

interface Props extends Omit<SelectProps<string | null>, "options"> {
  /** Filters the fetched provider list by type, and pre-fills the type when adding a new provider. */
  billType?: BillType;
  /** Pass an already-filtered list to use instead of fetching from the store (e.g. multiple type-specific selects on one page). */
  providers?: Provider[];
  /** Set to false to render a plain select with no "Add provider" affordance. Defaults to true. */
  allowAdd?: boolean;
}

export default function ProviderSelect({ billType, providers: providersOverride, allowAdd = true, onChange, ...rest }: Props) {
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const { providers: storeProviders, fetchAll } = useProvidersStore();

  useEffect(() => {
    if (!providersOverride) fetchAll();
  }, [providersOverride]);

  const providers = providersOverride ?? (billType ? storeProviders.filter((p) => p.types.includes(billType)) : storeProviders);

  const handleProviderCreated = (created?: Provider) => {
    setProviderModalOpen(false);
    if (created) onChange?.(created.id, { value: created.id, label: created.name });
  };

  return (
    <>
      <Select
        onChange={onChange}
        {...rest}
        options={providers.map((p) => ({ value: p.id, label: p.name }))}
        popupRender={
          allowAdd
            ? (menu) => (
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
              )
            : undefined
        }
      />
      {allowAdd && (
        <ProviderModal open={providerModalOpen} defaultType={billType} onClose={handleProviderCreated} />
      )}
    </>
  );
}
