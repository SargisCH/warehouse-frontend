import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useCreatePriceListMutation,
  useDeletePriceListMutation,
  useGetPriceListProductsQuery,
  useLazyGetPriceListByIdQuery,
  useUpdatePriceListMutation,
} from "api/priceList";
import AlertDialog from "components/alertDialog/AlertDialog";
import { links } from "routes";

type Row = {
  productId: number;
  productCode: string | null;
  productName: string | null;
  price: string;
};

const UpsertPriceList = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useParams() as any;
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const [error, setError] = useState("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const [createPriceList] = useCreatePriceListMutation();
  const [updatePriceList] = useUpdatePriceListMutation();
  const [deletePriceList] = useDeletePriceListMutation();
  const [getPriceListById] = useLazyGetPriceListByIdQuery();
  const { data: products = [] } = useGetPriceListProductsQuery({
    searchTerm: productSearch,
  });

  useEffect(() => {
    (async () => {
      if (!params.priceListId) return;
      const res = await getPriceListById({ priceListId: params.priceListId });
      if (!res.data) return;
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
    })();
  }, [params.priceListId, getPriceListById]);

  const addProduct = (product: any) =>
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
    const res: any = params.priceListId
      ? await updatePriceList({ ...body, id: params.priceListId })
      : await createPriceList(body);

    if (res?.error) {
      setError(res.error?.data?.message || "Request failed");
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

        <Box>
          <Flex justify="space-between" align="center" mb="8px">
            <Text fontSize="18px" fontWeight="700" color={textColor}>
              {t("common.priceList.prices")}
            </Text>
            <Input
              size="sm"
              width="220px"
              placeholder={t("common.priceList.searchProducts")}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </Flex>

          {productSearch ? (
            <Box
              borderWidth="1px"
              rounded="md"
              p="8px"
              mb="12px"
              maxHeight="220px"
              overflowY="auto"
            >
              <Table size="sm">
                <Tbody>
                  {products.map((product: any) => (
                    <Tr key={product.id}>
                      <Td>{product.sku}</Td>
                      <Td>{product.name}</Td>
                      <Td width="80px">
                        <Button size="xs" onClick={() => addProduct(product)}>
                          {t("common.add")}
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : null}

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
              {rows.map((row) => (
                <Tr key={row.productId}>
                  <Td>{row.productCode}</Td>
                  <Td>{row.productName}</Td>
                  <Td>
                    <Input
                      size="sm"
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
                      {t("common.delete")}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Flex gap="12px">
          <Button colorScheme="teal" onClick={onSubmit}>
            {t("common.save")}
          </Button>
          {params.priceListId ? (
            <Button
              colorScheme="red"
              onClick={() => setIsDeleteDialogOpened(true)}
            >
              {t("common.delete")}
            </Button>
          ) : null}
        </Flex>
      </Flex>

      {isDeleteDialogOpened ? (
        <AlertDialog
          handleConfirm={async () => {
            const res: any = await deletePriceList(params.priceListId);
            setIsDeleteDialogOpened(false);
            if (res?.error) {
              setError(res.error?.data?.message || "Request failed");
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
          headerText={"Warning"}
          confirmText="OK"
        />
      ) : null}
    </Box>
  );
};

export default UpsertPriceList;
