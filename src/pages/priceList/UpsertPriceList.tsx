import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useCreatePriceListMutation,
  useDeletePriceListMutation,
  useGetPriceListProductsQuery,
  useLazyGetPriceListByIdQuery,
  useUpdatePriceListMutation,
} from "api/priceList";
import { ProductItem } from "api/product";
import AlertDialog from "components/alertDialog/AlertDialog";
import { links } from "routes";

type Row = {
  productId: number;
  productCode: string | null;
  productName: string | null;
  price: string;
};

const visibleProductCount = 10;

const UpsertPriceList = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { priceListId } = useParams<{ priceListId?: string }>();
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const [error, setError] = useState("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [productPickerMaxHeight, setProductPickerMaxHeight] = useState<string>();
  const productTableRef = useRef<HTMLTableElement>(null);
  const [productToFocus, setProductToFocus] = useState<number | null>(null);
  const [loadedPriceListId, setLoadedPriceListId] = useState<string>();

  const [createPriceList] = useCreatePriceListMutation();
  const [updatePriceList] = useUpdatePriceListMutation();
  const [deletePriceList] = useDeletePriceListMutation();
  const [getPriceListById, { isError: priceListLoadFailed }] =
    useLazyGetPriceListByIdQuery();
  const searchTerm = productSearch.trim();
  const selectedProductIds = new Set(rows.map((row) => row.productId));
  const canEdit = !priceListId || loadedPriceListId === priceListId;
  const {
    currentData: products = [],
    isFetching,
    isError,
  } = useGetPriceListProductsQuery(
    { searchTerm: productQuery },
    { refetchOnMountOrArgChange: true },
  );
  const loadingProducts = isFetching || productQuery !== searchTerm;

  useLayoutEffect(() => {
    const table = productTableRef.current;
    if (
      loadingProducts ||
      isError ||
      !table ||
      products.length <= visibleProductCount
    ) {
      setProductPickerMaxHeight(undefined);
      return;
    }

    const visibleRows = Array.from(table.tBodies[0].rows).slice(
      0,
      visibleProductCount,
    );
    const lastVisibleRow = visibleRows[visibleRows.length - 1];
    const updateMaxHeight = () => {
      const height =
        lastVisibleRow.getBoundingClientRect().bottom -
        table.getBoundingClientRect().top;
      setProductPickerMaxHeight(`${Math.ceil(height)}px`);
    };

    updateMaxHeight();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateMaxHeight);
    if (table.tHead) observer.observe(table.tHead);
    visibleRows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [isError, loadingProducts, products.length]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setProductQuery(searchTerm), 200);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (!priceListId) return;
    let active = true;
    (async () => {
      const res = await getPriceListById({ priceListId });
      if (!active || !res.data) return;
      setCode(res.data.code);
      setName(res.data.name);
      setIsDefault(res.data.isDefault);
      setIsClosed(res.data.isClosed);
      setRows(
        (res.data.items ?? []).map((item) => ({
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          price: item.price,
        })),
      );
      setLoadedPriceListId(priceListId);
    })();
    return () => {
      active = false;
    };
  }, [priceListId, getPriceListById]);

  useEffect(() => {
    if (productToFocus === null) return;
    const input = document.getElementById(`price-list-price-${productToFocus}`);
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.select();
    }
    setProductToFocus(null);
  }, [productToFocus]);

  const addProduct = (product: ProductItem) => {
    setProductToFocus(product.id);
    setRows((current) =>
      current.some((row) => row.productId === product.id)
        ? current
        : [
            ...current,
            {
              productId: product.id,
              productCode: product.sku,
              productName: product.name,
              price: "0.00",
            },
          ],
    );
  };

  const onSubmit = async () => {
    if (!name) {
      setError(t("common.priceList.nameRequired"));
      return;
    }
    const body: any = {
      name,
      isDefault,
      isClosed,
      items: rows.map((row) => ({
        productId: row.productId,
        price: String(row.price || "0"),
      })),
    };
    const res: any = priceListId
      ? await updatePriceList({ ...body, id: priceListId })
      : await createPriceList(body);

    if (res?.error) {
      setError(res.error?.data?.message || t("common.ui.requestFailed"));
      return;
    }
    history.push(links.priceLists);
  };

  return (
    <Box>
      <Flex direction="column" gap="16px">
        <Flex gap="20px" wrap="wrap">
          <FormControl width="180px">
            <FormLabel>{t("common.priceList.code")}</FormLabel>
            <Input
              value={code || t("common.priceList.codeAutoAssigned")}
              isReadOnly
              isDisabled
            />
          </FormControl>
          <FormControl width="320px">
            <FormLabel>{t("common.priceList.name")}</FormLabel>
            <Input
              value={name}
              placeholder={t("common.priceList.namePlaceholder")}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
        </Flex>

        <Flex gap="24px">
          <Checkbox
            isChecked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          >
            {t("common.priceList.isDefault")}
          </Checkbox>
          <Checkbox
            isChecked={isClosed}
            onChange={(e) => setIsClosed(e.target.checked)}
          >
            {t("common.priceList.isClosed")}
          </Checkbox>
        </Flex>
        <Text fontSize="sm" color="gray.400">
          {t("common.priceList.isDefaultHint")}
        </Text>

        <Grid templateColumns="minmax(0, 1fr)" gap="16px">
          <Box
            as="section"
            aria-labelledby="price-list-products-heading"
            borderWidth="1px"
            rounded="md"
          >
            <Box p="12px">
              <Text
                as="h2"
                id="price-list-products-heading"
                fontSize="18px"
                fontWeight="700"
                color={textColor}
                mb="8px"
              >
                {t("common.priceList.availableProducts")}
              </Text>
              <Input
                size="sm"
                placeholder={t("common.priceList.searchProducts")}
                aria-label={t("common.priceList.searchProducts")}
                aria-controls="price-list-product-picker"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </Box>
            <Box
              id="price-list-product-picker"
              maxH={productPickerMaxHeight}
              overflow="auto"
              aria-busy={loadingProducts}
            >
              {loadingProducts ? (
                <Box p="12px">
                  <Spinner size="sm" />
                </Box>
              ) : isError || !products.length ? (
                <Text role="status" fontSize="sm" p="12px">
                  {t(
                    isError
                      ? "common.priceList.productSearchError"
                      : "common.priceList.noMatchingProducts",
                  )}
                </Text>
              ) : (
                <Table ref={productTableRef} size="sm">
                  <Thead>
                    <Tr>
                      <Th>{t("common.priceList.productCode")}</Th>
                      <Th>{t("common.priceList.productName")}</Th>
                      <Th />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {products.map((product) => {
                      const isAdded = selectedProductIds.has(product.id);
                      return (
                        <Tr key={product.id}>
                          <Td>{product.sku}</Td>
                          <Td>{product.name}</Td>
                          <Td>
                            <Button
                              size="xs"
                              isDisabled={isAdded || !canEdit}
                              aria-label={t(
                                isAdded
                                  ? "common.priceList.productAlreadyAdded"
                                  : "common.priceList.addProduct",
                                {
                                  product:
                                    product.name || product.sku || product.id,
                                },
                              )}
                              onClick={() => addProduct(product)}
                            >
                              {isAdded
                                ? t("common.priceList.added")
                                : t("common.add")}
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              )}
            </Box>
          </Box>

          <Box
            as="section"
            aria-labelledby="price-list-prices-heading"
            borderWidth="1px"
            rounded="md"
          >
            <Text
              as="h2"
              id="price-list-prices-heading"
              fontSize="18px"
              fontWeight="700"
              color={textColor}
              p="12px"
            >
              {t("common.priceList.prices")}
            </Text>
            {!canEdit ? (
              <Box p="12px">
                {priceListLoadFailed ? (
                  <Text role="alert">{t("common.priceList.loadError")}</Text>
                ) : (
                  <Spinner size="sm" />
                )}
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{t("common.priceList.productCode")}</Th>
                      <Th>{t("common.priceList.productName")}</Th>
                      <Th>{t("common.priceList.price")}</Th>
                      <Th />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {!rows.length && (
                      <Tr>
                        <Td colSpan={4}>{t("common.priceList.emptyPrices")}</Td>
                      </Tr>
                    )}
                    {rows.map((row) => (
                      <Tr key={row.productId}>
                        <Td>{row.productCode}</Td>
                        <Td>{row.productName}</Td>
                        <Td>
                          <Input
                            size="sm"
                            id={`price-list-price-${row.productId}`}
                            aria-label={t("common.priceList.priceForProduct", {
                              product:
                                row.productName ||
                                row.productCode ||
                                row.productId,
                            })}
                            inputMode="decimal"
                            width="120px"
                            value={row.price}
                            onChange={(e) =>
                              setRows((current) =>
                                current.map((item) =>
                                  item.productId === row.productId
                                    ? { ...item, price: e.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                        </Td>
                        <Td>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() =>
                              setRows((current) =>
                                current.filter(
                                  (item) => item.productId !== row.productId,
                                ),
                              )
                            }
                          >
                            {t("common.priceList.removeProduct")}
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        </Grid>

        <Flex gap="12px">
          <Button colorScheme="teal" onClick={onSubmit} isDisabled={!canEdit}>
            {t("common.save")}
          </Button>
          {priceListId ? (
            <Button
              colorScheme="red"
              onClick={() => setIsDeleteDialogOpened(true)}
            >
              {t("common.delete")}
            </Button>
          ) : null}
        </Flex>
      </Flex>

      {isDeleteDialogOpened && priceListId ? (
        <AlertDialog
          handleConfirm={async () => {
            const res: any = await deletePriceList(priceListId);
            setIsDeleteDialogOpened(false);
            if (res?.error) {
              setError(res.error?.data?.message || t("common.ui.requestFailed"));
              return;
            }
            history.push(links.priceLists);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={t("common.priceList.deleteConfirmation")}
          headerText={t("common.priceList.deletePriceList")}
        />
      ) : null}

      {error ? (
        <AlertDialog
          handleConfirm={() => setError("")}
          oneButton
          isOpen={Boolean(error)}
          onClose={() => setError("")}
          bodyText={error}
          headerText={t("common.ui.warning")}
          confirmText={t("common.ui.ok")}
        />
      ) : null}
    </Box>
  );
};

export default UpsertPriceList;
