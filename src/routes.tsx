import { Icon } from "@chakra-ui/react";
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
} from "react-icons/md";

// Admin Imports
import MainDashboard from "views/admin/default";
import NFTMarketplace from "views/admin/marketplace";
import Profile from "views/admin/profile";
import DataTables from "views/admin/dataTables";
import RTL from "views/admin/rtl";
import Inventory from "pages/inventory/Inventory";
import Product from "pages/product/Product";
import InventorySupplier from "pages/inventorySupplier/InventorySupplier";
import InventorySupplierOrder from "pages/supplyOrder/SupplyOrder";

// Auth Imports
import SignInCentered from "views/auth/signIn";

const routes = [
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: MainDashboard,
  },
  {
    name: "NFT Marketplace",
    layout: "/admin",
    path: "/nft-marketplace",
    icon: (
      <Icon
        as={MdOutlineShoppingCart}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: NFTMarketplace,
    secondary: true,
  },
  {
    name: "Data Tables",
    layout: "/admin",
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    path: "/data-tables",
    component: DataTables,
  },
  {
    name: "Profile",
    layout: "/admin",
    path: "/profile",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Profile,
  },
  {
    name: "Sign In",
    layout: "/auth",
    path: "/sign-in",
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: SignInCentered,
  },
  {
    name: "RTL Admin",
    layout: "/rtl",
    path: "/rtl-default",
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: RTL,
  },
  {
    name: "Humq",
    layout: "/admin",
    path: "/inventory",
    exact: true,
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: Inventory,
  },
  {
    name: "Products",
    layout: "/admin",
    path: "/products",
    exact: true,
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: Product,
  },
  {
    name: "Inventory Suppliers",
    layout: "/admin",
    path: "/suppliers",
    exact: true,
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: InventorySupplier,
  },
  {
    name: "Suppy Orders",
    layout: "/admin",
    path: "/supply-orders",
    exact: true,
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: InventorySupplierOrder,
  },
];

export const links = {
  inventory: "/admin/inventory",
  inventoryItem: (inventoryId: string | number) =>
    `/admin/inventory/upsert/${inventoryId}`,
  product: "/admin/products",
  productItem: (productId: string | number) =>
    `/admin/products/upsert/${productId}`,
  suppliers: "/admin/suppliers",
  supplier: (supplierId: string | number) =>
    `/admin/suppliers/upsert/${supplierId}`,
  supplyOrders: "/admin/supply-orders",
  supplyOrder: (inventorySupplierId: string | number, orderId: number) =>
    `/admin/supply-orders/upsert/${inventorySupplierId}/order/${orderId}`,
};
export default routes;
