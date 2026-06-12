"use client";

import { createContext, useContext } from "react";

export type Me = {
  employee: {
    id: string;
    org_id: string;
    name: string;
    badge: string;
    role: string;
    department: string | null;
    pay_type: string;
    pay_rate: number | null;
    pay_unit: string;
    hire_date: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    pto_allowance_hours: number;
  };
  org_name: string | null;
};

export const MeContext = createContext<Me | null>(null);

export function useMe(): Me {
  const me = useContext(MeContext);
  if (!me) throw new Error("useMe must be used inside /employee");
  return me;
}
