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
import { RouteTypeExtended } from "./types/index";

// Auth Imports
import SignInCentered from "views/auth/signIn";
import SignUp from "views/auth/signup";
import ProductCategory from "pages/productCategory/ProductCategory";
import Client from "pages/client/Client";
import Sale from "pages/sale/Sale";
import VerifyEmail from "views/auth/verifyEmail";

const routes: RouteTypeExtended[] = [
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
  // {
  //   name: "Data Tables",
  //   layout: "/admin",
  //   icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
  //   path: "/data-tables",
  //   component: DataTables,
  // },
  // {
  //   name: "Profile",
  //   layout: "/admin",
  //   path: "/profile",
  //   icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
  //   component: Profile,
  // },
  // {
  //   name: "Sign In",
  //   layout: "/auth",
  //   path: "/sign-in",
  //   icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
  //   component: SignInCentered,
  // },
  // {
  //   name: "Sign Up",
  //   layout: "/auth",
  //   path: "/sign-up",
  //   icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
  //   component: SignUp,
  // },
  // {
  //   name: "Verify Email",
  //   layout: "/auth",
  //   path: "/verify-email/:email",
  //   icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
  //   component: VerifyEmail,
  // },
  // {
  //   name: "RTL Admin",
  //   layout: "/rtl",
  //   path: "/rtl-default",
  //   icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  //   component: RTL,
  // },
  {
    name: "",
    layout: "",
    path: "",
    exact: true,
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: () => <></>,
    group: true,
    groupName: "Pahest",
    nestedRoutes: [
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
        name: "Categories",
        layout: "/admin",
        path: "/productCategory",
        exact: true,
        icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
        component: ProductCategory,
      },
    ],
  },
  {
    name: "",
    layout: "",
    path: "",
    exact: true,
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: () => <></>,
    group: true,
    groupName: "Vacharq",
    nestedRoutes: [
      {
        name: "vacharqneri patmutyun",
        layout: "/admin",
        path: "/sale",
        exact: true,
        icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
        component: Sale,
      },
      {
        name: "vacharaketer",
        layout: "/admin",
        path: "/client",
        exact: true,
        icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
        component: Client,
      },
    ],
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
  createInventory: "/admin/inventory/upsert/",
  product: "/admin/products",
  productItem: (productId: string | number) =>
    `/admin/products/upsert/${productId}`,
  createProduct: "/admin/products/upsert/",
  suppliers: "/admin/suppliers",
  supplier: (supplierId: string | number) =>
    `/admin/suppliers/upsert/${supplierId}`,
  createSupplier: "/admin/suppliers/upsert/",
  supplyOrders: "/admin/supply-orders",
  supplyOrder: (inventorySupplierId: string | number, orderId: number) =>
    `/admin/supply-orders/upsert/${inventorySupplierId}/order/${orderId}`,
  createSupplyOrder: (inventorySupplierId: string | number) =>
    `/admin/supply-orders/upsert/${inventorySupplierId}/order`,
  createSupplyOrderNoSupplier: "/admin/supply-orders/create-order",
  productCategories: "/admin/productCategory",
  productCategory: (productCategoryId: string | number) =>
    `/admin/productCategory/upsert/${productCategoryId}`,
  createProductCategory: "/admin/productCategory/upsert/",
  clients: "/admin/client",
  client: (clientId: string | number) => `/admin/client/upsert/${clientId}`,
  createClient: "/admin/client/upsert/",
  sale: "/admin/sale",
  saleCreate: (clientId: string | number) => `/admin/sale/create/${clientId}`,
  saleInfo: (saleId: number) => `/admin/sale/info/${saleId}`,
};
export default routes;
