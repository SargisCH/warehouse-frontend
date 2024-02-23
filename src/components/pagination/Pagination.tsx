// PaginationComponent.tsx

import React from "react";
import { Box, Button, Stack } from "@chakra-ui/react";
import { useHistory, useLocation } from "react-router-dom";

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
      const newUrl = `${location.pathname}?page=${page}`;
      history.push(newUrl);
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
          Previous
        </Button>

        {/* Page numbers */}
        {renderPageNumbers()}

        {/* "Next" button */}
        <Button
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>

        {/* "Skip 5" button */}
        <Button
          size="sm"
          disabled={currentPage + 5 > totalPages}
          onClick={() => handlePageChange(currentPage + 5)}
        >
          Skip 5
        </Button>
      </Stack>
    </Box>
  );
};

export default Pagination;
