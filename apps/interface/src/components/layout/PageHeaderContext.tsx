"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

interface PageHeaderState {
  title: string;
  actions: ReactNode;
}

type SetHeader = (state: Partial<PageHeaderState>) => void;

// Split into two contexts:
// - Setter: stable (useCallback), consumed by usePageHeader — callers never re-render on header changes
// - State: consumed by PageHeader — re-renders when header changes (context bypasses bail-out)
const PageHeaderStateContext = createContext<PageHeaderState>({ title: "", actions: null });
const PageHeaderSetterContext = createContext<SetHeader>(() => {});

export function usePageHeader(state: Partial<PageHeaderState>) {
  const setHeader = useContext(PageHeaderSetterContext);

  // Push latest state after every render of the calling component.
  // Safe because calling components only subscribe to the stable setter context,
  // so setHeader() won't cause them to re-render.
  useEffect(() => {
    setHeader(state);
  });

  useEffect(() => {
    return () => setHeader({ title: "", actions: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function usePageHeaderContext() {
  return useContext(PageHeaderStateContext);
}

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeaderState] = useState<PageHeaderState>({ title: "", actions: null });

  const setHeader = useCallback<SetHeader>((state) => {
    setHeaderState((prev) => ({ ...prev, ...state }));
  }, []);

  return (
    <PageHeaderSetterContext.Provider value={setHeader}>
      <PageHeaderStateContext.Provider value={header}>
        {children}
      </PageHeaderStateContext.Provider>
    </PageHeaderSetterContext.Provider>
  );
}
