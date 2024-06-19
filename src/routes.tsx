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
import InventoryEntry from "pages/inventoryEntry/InventoryEntry";
import Product from "pages/product/Product";
import InventorySupplier from "pages/inventorySupplier/InventorySupplier";
import InventorySupplierOrder from "pages/supplyOrder/SupplyOrder";
import { Role, RouteTypeExtended } from "./types/index";

// Auth Imports
import SignInCentered from "views/auth/signIn";
import SignUp from "views/auth/signup";
import ProductCategory from "pages/productCategory/ProductCategory";
import Client from "pages/client/Client";
import Sale from "pages/sale/Sale";
import Credit from "pages/credit/Credit";
import VerifyEmail from "views/auth/verifyEmail";
import TransactionHistory from "pages/transactionHistory/TransactionHistory";
import StockProductList from "pages/product/StockProductList";
import BalanceHistory from "pages/balanceHistory/BalanceHistory";
import Manager from "pages/manager/Manager";
import Settings from "pages/profile/Settings";
import ChangePassword from "views/auth/changePassword";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faCreditCard,
  faGear,
  faHistory,
  faHome,
  faList,
  faMoneyBill,
  faMoneyCheckAlt,
  faPerson,
  faReceipt,
  faShop,
  faTags,
  faUpload,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
const routes: RouteTypeExtended[] = [
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <FontAwesomeIcon icon={faHome} />,
    translationKey: "mainDashboard",
    component: MainDashboard,
    role: [Role.ADMIN, Role.MANAGER],
  },
  {
    name: "Balance History",
    layout: "/admin",
    path: "/balance-history",
    translationKey: "balanceHistory",
    icon: <FontAwesomeIcon icon={faMoneyBill} />,
    component: BalanceHistory,
    role: [Role.ADMIN],
  },

  // {
  //   name: "NFT Marketplace",
  //   layout: "/admin",
  //   path: "/nft-marketplace",
  //   icon: (
  //     <Icon
  //       as={MdOutlineShoppingCart}
  //       width="20px"
  //       height="20px"
  //       color="inherit"
  //     />
  //   ),
  //   component: NFTMarketplace,
  //   secondary: true,
  // },
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
  {
    name: "Sign In",
    layout: "/auth",
    path: "/sign-in",
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: SignInCentered,
    role: [],
  },
  {
    name: "Sign Up",
    layout: "/auth",
    path: "/sign-up",
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: SignUp,
    role: [],
  },
  {
    name: "Verify Email",
    layout: "/auth",
    path: "/verify-email/:email",
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: VerifyEmail,
    role: [],
  },
  {
    name: "Change password",
    layout: "/auth",
    path: "/change-password/:email",
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: ChangePassword,
    role: [],
  },
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
    icon: <FontAwesomeIcon icon={faWarehouse} />,
    component: () => <></>,
    group: true,
    groupName: "Pahest",
    translationKey: "warehouse",
    role: [],
    nestedRoutes: [
      {
        name: "Humq",
        translationKey: "inventory.inventory",
        layout: "/admin",
        path: "/inventory",
        exact: true,
        icon: <FontAwesomeIcon icon={faWarehouse} />,
        component: Inventory,
        role: [Role.ADMIN],
      },
      {
        name: "Entries",
        translationKey: "inventory.entries",
        layout: "/admin",
        path: "/inventoryEntry",
        exact: true,
        icon: <FontAwesomeIcon icon={faReceipt} />,
        component: InventoryEntry,
        role: [Role.ADMIN],
      },
      {
        name: "Products",
        layout: "/admin",
        translationKey: "products",
        path: "/products",
        exact: true,
        icon: <FontAwesomeIcon icon={faBox} />,
        component: Product,
        role: [Role.ADMIN],
      },
      // {
      //   name: "Stock Products",
      //   layout: "/admin",
      //   path: "/products/stockProducts",
      //   translationKey: "stockProducts",
      //   exact: true,
      //   icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
      //   component: StockProductList,
      //   role: [Role.ADMIN],
      // },
      {
        name: "Categories",
        layout: "/admin",
        path: "/productCategory",
        translationKey: "categories",
        exact: true,
        icon: <FontAwesomeIcon icon={faList} />,
        component: ProductCategory,
        role: [Role.ADMIN],
      },
    ],
  },
  {
    name: "",
    layout: "",
    path: "",
    exact: true,
    icon: <FontAwesomeIcon icon={faTags} />,
    component: () => <></>,
    group: true,
    groupName: "Vacharq",
    translationKey: "sales",
    role: [],
    nestedRoutes: [
      {
        name: "vacharqneri patmutyun",
        layout: "/admin",
        path: "/sale",
        translationKey: "salesHistory",
        exact: true,
        icon: <FontAwesomeIcon icon={faHistory} />,
        component: Sale,
        role: [Role.ADMIN, Role.MANAGER],
      },
      {
        name: "vacharaketer",
        layout: "/admin",
        path: "/client",
        translationKey: "clients",
        exact: true,
        icon: <FontAwesomeIcon icon={faPerson} />,
        component: Client,
        role: [Role.ADMIN, Role.MANAGER],
      },
    ],
  },
  {
    name: "Inventory Suppliers",
    translationKey: "inventorySuppliers",
    layout: "/admin",
    path: "/suppliers",
    exact: true,
    icon: <FontAwesomeIcon icon={faUpload} />,
    component: InventorySupplier,
    role: [Role.ADMIN],
  },
  {
    name: "Suppy Orders",
    translationKey: "supplyOrders",
    layout: "/admin",
    path: "/supply-orders",
    exact: true,
    icon: <FontAwesomeIcon icon={faShop} />,
    component: InventorySupplierOrder,
    role: [Role.ADMIN],
  },
  {
    name: "Credit list",
    translationKey: "creditList",
    layout: "/admin",
    path: "/credit",
    exact: true,
    icon: <FontAwesomeIcon icon={faMoneyCheckAlt} />,
    component: Credit,
    role: [Role.ADMIN, Role.MANAGER],
  },
  {
    name: "Transaction History List",
    layout: "/admin",
    path: "/transactionHistory",
    translationKey: "transactionHistoryList",
    exact: true,
    icon: <FontAwesomeIcon icon={faCreditCard} />,
    component: TransactionHistory,
    role: [Role.ADMIN, Role.MANAGER],
  },
  {
    name: "Managers",
    layout: "/admin",
    path: "/manager",
    translationKey: "managers",
    exact: true,
    icon: <FontAwesomeIcon icon={faPerson} />,
    component: Manager,
    role: [Role.ADMIN],
  },
  {
    name: "Profile settings",
    layout: "/admin",
    path: "/settings",
    translationKey: "profileSettings",
    exact: true,
    icon: <FontAwesomeIcon icon={faGear} />,
    component: Settings,
    role: [Role.ADMIN],
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
  addInStock: "/admin/products/addInStock/",
  updateStock: (id: number) => `/admin/products/stockProduct/${id}/`,
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
  credits: "/admin/credit",
  createCredit: "/admin/credit/upsert/",
  credit: (creditId: string | number) => `/admin/credit/upsert/${creditId}`,
  managers: "/admin/manager",
  createManager: "/admin/manager/upsert/",
  manager: (managerId: string | number) => `/admin/manager/upsert/${managerId}`,
  transactionHistories: "/admin/transactionHistory",
  createTransactionHistory: "/admin/transactionHistory/upsert/",
  transactionHistory: (transactionHistoryId: string | number) =>
    `/admin/transactionHistory/upsert/${transactionHistoryId}`,
  inventoryEntry: "/admin/inventoryEntry",
  createInventoryEntry: "/admin/inventoryEntry/upsert",
  updateInventoryEntry: (entryId: number) =>
    `/admin/inventoryEntry/upsert${entryId}`,
  settings: "/admin/settings",
  returnSale: (saleId: number) => `/admin/sale/return/${saleId}`,
};
export default routes;
