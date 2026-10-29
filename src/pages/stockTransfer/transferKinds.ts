import { TransferKind } from "types";

type Side = "warehouse" | "manager";

// Which ends each document moves between, and where its screens live. The
// paths are spelled out rather than read from `links`: routes imports these
// pages, so `links` is not defined yet when this module first runs.
export const TRANSFER_SETUP: Record<
  TransferKind,
  { from: Side; to: Side; showPrice: boolean; list: string }
> = {
  WAREHOUSE: {
    from: "warehouse",
    to: "warehouse",
    showPrice: false,
    list: "/admin/warehouse-transfers",
  },
  DELIVERER: {
    from: "manager",
    to: "manager",
    showPrice: true,
    list: "/admin/deliverer-transfers",
  },
  ISSUE: {
    from: "warehouse",
    to: "manager",
    showPrice: true,
    list: "/admin/deliverer-issues",
  },
  RETURN: {
    from: "manager",
    to: "warehouse",
    showPrice: true,
    list: "/admin/deliverer-returns",
  },
};
