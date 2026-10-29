import {
  Box,
  Button,
  Checkbox,
  Flex,
  IconButton,
  Text,
  useOutsideClick,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export type ColumnOption = {
  id: string;
  label: string;
};

export type ColumnLayout = {
  // Column ids in display order. Ids not listed here fall back to their
  // position in `options`, so adding a column later doesn't strand a layout.
  order: string[];
  hidden: string[];
};

const emptyLayout: ColumnLayout = { order: [], hidden: [] };

/**
 * Reads a saved layout, tolerating anything that isn't one. Browsers can and do
 * throw on localStorage (private windows, blocked site data), and a layout
 * saved by an older build may not match this shape at all.
 */
const readLayout = (storageKey: string): ColumnLayout => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return emptyLayout;
    const parsed = JSON.parse(raw);
    return {
      order: Array.isArray(parsed?.order) ? parsed.order.map(String) : [],
      hidden: Array.isArray(parsed?.hidden) ? parsed.hidden.map(String) : [],
    };
  } catch {
    return emptyLayout;
  }
};

const writeLayout = (storageKey: string, layout: ColumnLayout) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(layout));
  } catch {
    // A layout is a convenience; losing it must never break the screen.
  }
};

/**
 * Resolves the columns actually shown, and in what order, from the full set of
 * options plus whatever the viewer has saved.
 */
export const useColumnLayout = (
  storageKey: string,
  options: ColumnOption[],
) => {
  const [layout, setLayout] = useState<ColumnLayout>(() =>
    readLayout(storageKey),
  );

  useEffect(() => {
    writeLayout(storageKey, layout);
  }, [storageKey, layout]);

  const ordered = useMemo(() => {
    const known = new Set(options.map((option) => option.id));
    const saved = layout.order.filter((id) => known.has(id));
    // Columns the saved layout never mentioned keep their declared position.
    const rest = options
      .map((option) => option.id)
      .filter((id) => !saved.includes(id));
    return [...saved, ...rest];
  }, [layout.order, options]);

  const visible = useMemo(
    () => ordered.filter((id) => !layout.hidden.includes(id)),
    [ordered, layout.hidden],
  );

  const toggle = useCallback((id: string) => {
    setLayout((current) => ({
      ...current,
      hidden: current.hidden.includes(id)
        ? current.hidden.filter((hiddenId) => hiddenId !== id)
        : [...current.hidden, id],
    }));
  }, []);

  const move = useCallback(
    (id: string, direction: -1 | 1) => {
      setLayout((current) => {
        const next = [...ordered];
        const from = next.indexOf(id);
        const to = from + direction;
        if (from < 0 || to < 0 || to >= next.length) return current;
        [next[from], next[to]] = [next[to], next[from]];
        return { ...current, order: next };
      });
    },
    [ordered],
  );

  const reset = useCallback(() => setLayout(emptyLayout), []);

  return { ordered, visible, toggle, move, reset };
};

type Props = {
  options: ColumnOption[];
  ordered: string[];
  visible: string[];
  onToggle: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onReset: () => void;
  // Lets the same picker choose which filters show, not only columns.
  buttonLabel?: string;
  title?: string;
};

/** «Խմբագրել դիտելու ձևը» - pick which columns show, and in what order. */
export const ColumnPicker = ({
  options,
  ordered,
  visible,
  onToggle,
  onMove,
  onReset,
  buttonLabel,
  title,
}: Props) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const byId = new Map(options.map((option) => [option.id, option]));

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  return (
    <Box position="relative" ref={containerRef}>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen((current) => !current)}
      >
        {buttonLabel ?? t("common.table.columns")}
      </Button>
      {isOpen ? (
        <Box
          position="absolute"
          right="0"
          top="calc(100% + 4px)"
          zIndex={20}
          width="320px"
          maxHeight="360px"
          overflowY="auto"
          bg="white"
          _dark={{ bg: "navy.800", borderColor: "whiteAlpha.300" }}
          borderWidth="1px"
          borderColor="gray.200"
          rounded="md"
          boxShadow="lg"
          p="12px"
        >
          <Text fontWeight="700" mb="8px">
            {title ?? t("common.table.editColumns")}
          </Text>
          {ordered.map((id, index) => {
            const option = byId.get(id);
            if (!option) return null;
            return (
              <Flex key={id} align="center" justify="space-between" py="4px">
                <Checkbox
                  isChecked={visible.includes(id)}
                  onChange={() => onToggle(id)}
                >
                  <Text fontSize="sm">{option.label}</Text>
                </Checkbox>
                <Flex gap="4px">
                  <IconButton
                    aria-label={t("common.table.moveUp")}
                    size="xs"
                    variant="ghost"
                    isDisabled={index === 0}
                    onClick={() => onMove(id, -1)}
                    icon={<span>↑</span>}
                  />
                  <IconButton
                    aria-label={t("common.table.moveDown")}
                    size="xs"
                    variant="ghost"
                    isDisabled={index === ordered.length - 1}
                    onClick={() => onMove(id, 1)}
                    icon={<span>↓</span>}
                  />
                </Flex>
              </Flex>
            );
          })}
          <Button size="xs" variant="ghost" mt="8px" onClick={onReset}>
            {t("common.table.resetColumns")}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
};
