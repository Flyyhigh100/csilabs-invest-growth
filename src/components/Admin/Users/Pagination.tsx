
import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return (
    <div className="flex items-center justify-between mt-4">
      <Button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        variant="outline"
      >
        Previous
      </Button>
      <span className="text-sm text-gray-500">
        Page {page} of {totalPages || 1}
      </span>
      <Button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
