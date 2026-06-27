"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PageHeaderState {
  title: string;
  actions: ReactNode;
}

interface PageHeaderContextValue extends PageHeaderState {
  setHeader: (state: Partial<PageHeaderState>) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
  title: "",
  actions: null,
  setHeader: () => {},
});

export function usePageHeader(state: Partial<PageHeaderState>) {
  const { setHeader } = useContext(PageHeaderContext);
  useEffect(() => {
    setHeader(state);
    return () => setHeader({ title: "", actions: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function usePageHeaderContext() {
  return useContext(PageHeaderContext);
}

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeaderState] = useState<PageHeaderState>({ title: "", actions: null });

  function setHeader(state: Partial<PageHeaderState>) {
    setHeaderState((prev) => ({ ...prev, ...state }));
  }

  return (
    <PageHeaderContext.Provider value={{ ...header, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}
