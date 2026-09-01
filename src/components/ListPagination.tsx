import { FormEvent, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ListPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function ListPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageInputId = useId();
  const currentPage = Math.min(page, totalPages - 1);
  const firstItem = totalItems === 0 ? 0 : currentPage * pageSize + 1;
  const lastItem = Math.min(totalItems, (currentPage + 1) * pageSize);
  const [targetPage, setTargetPage] = useState(String(currentPage + 1));

  useEffect(() => {
    setTargetPage(String(currentPage + 1));
  }, [currentPage]);

  const jumpToPage = (event: FormEvent) => {
    event.preventDefault();
    const requestedPage = Number.parseInt(targetPage, 10);
    if (!Number.isFinite(requestedPage)) {
      setTargetPage(String(currentPage + 1));
      return;
    }
    const validPage = Math.min(totalPages, Math.max(1, requestedPage));
    setTargetPage(String(validPage));
    onPageChange(validPage - 1);
  };

  if (totalItems <= pageSize) return null;

  return (
    <div className="flex flex-col gap-2 border-t bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground">
        Showing {firstItem}–{lastItem} of {totalItems}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <span className="min-w-24 text-center text-xs font-medium">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={currentPage + 1 >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
        <form className="ml-0 flex items-center gap-1 sm:ml-2" onSubmit={jumpToPage}>
          <label htmlFor={pageInputId} className="whitespace-nowrap text-xs text-muted-foreground">
            Go to
          </label>
          <Input
            id={pageInputId}
            type="number"
            min={1}
            max={totalPages}
            value={targetPage}
            onChange={(event) => setTargetPage(event.target.value)}
            className="h-8 w-16 px-2 text-center"
            aria-label={`Go to page, between 1 and ${totalPages}`}
          />
          <Button type="submit" size="sm" variant="outline">
            Go
          </Button>
        </form>
      </div>
    </div>
  );
}
