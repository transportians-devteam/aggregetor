import { useEffect, useMemo, useState } from "react";

export function useClientPagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pageItems = useMemo(
    () => items.slice(safePage * pageSize, (safePage + 1) * pageSize),
    [items, pageSize, safePage],
  );

  return {
    page: safePage,
    pageSize,
    pageItems,
    totalItems: items.length,
    setPage,
    reset: () => setPage(0),
  };
}
