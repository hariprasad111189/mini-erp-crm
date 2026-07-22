export type Pagination = {
  page: number;
  pageSize: number;
};

export const getSkipTake = ({ page, pageSize }: Pagination) => ({
  skip: (page - 1) * pageSize,
  take: pageSize
});

export const paged = <T>(data: T[], total: number, page: number, pageSize: number) => ({
  data,
  meta: {
    page,
    pageSize,
    total,
    pageCount: Math.ceil(total / pageSize)
  }
});

