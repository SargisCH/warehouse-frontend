// PaginationComponent.tsx

import React from "react";
import { Box, Button, Stack } from "@chakra-ui/react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  setQueryParams?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  setQueryParams,
}) => {
  const location = useLocation();
  const history = useHistory();
  const { t } = useTranslation();
  const renderPageNumbers = () => {
    const pages = [];

    // Calculate the range of visible pages
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          size="sm"
          variant={i === currentPage ? "solid" : "outline"}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>,
      );
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    // Update URL query parameter
    if (setQueryParams) {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set("page", String(page));
      history.replace({
        pathname: location.pathname,
        search: newSearchParams.toString(),
      });
    }
    onPageChange(page);
  };
  return (
    <Box>
      <Stack direction="row" spacing={2} justify="right" align="center">
        {/* "Previous" button */}
        <Button
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          {t("common.previous")}
        </Button>

        {/* Page numbers */}
        {renderPageNumbers()}

        {/* "Next" button */}
        <Button
          size="sm"
          disabled={currentPage === totalPages || totalPages < 1}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          {t("common.next")}
        </Button>

        {/* "Skip 5" button */}
        <Button
          size="sm"
          disabled={currentPage + 5 > totalPages || totalPages > 1}
          onClick={() => handlePageChange(currentPage + 5)}
        >
          {t("common.skipCount", { count: 5 })}
        </Button>
      </Stack>
    </Box>
  );
};

export default Pagination;
