import React from 'react';
import { Pagination } from '@mui/material';

export interface IPDFPaginationClasses {
  paginationButton?: string;
  prevButton?: string;
  nextButton?: string;
  paginationButtonGroup?: string;
}

export declare type PDFPaginationProps = {
  rowsPerPage?: number;
  currentPage: number;
  maxPage: number;
  onPageNavigate: (pageNum: number) => any;
  labels?: LabelType;
  classes?: IPDFPaginationClasses;
  components?: {
    Button: any;
    ButtonGroup: any;
  };
  showFirstLast?: boolean;
};

export declare type LabelType = {
  first?: string;
  last?: string;
  prev?: string;
  next?: string;
  show?: string;
  entries?: string;
  noResults?: string;
  filterPlaceholder?: string;
};

const PDFPagination = (props: PDFPaginationProps) => {
  const { currentPage, maxPage, onPageNavigate, showFirstLast = false } = props;

  const handleChange = (event: React.ChangeEvent<unknown>, page: number) => {
    onPageNavigate(page);
  };

  return (
    <Pagination
      count={maxPage}
      page={currentPage}
      onChange={handleChange}
      showFirstButton={showFirstLast}
      showLastButton={showFirstLast}
      variant="outlined"
      shape="rounded"
      sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
    />
  );
};

export default PDFPagination;