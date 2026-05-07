export const getPaginationOptions = (queryPage = 1, queryLimit = 10) => {
  const page = Math.max(parseInt(queryPage, 10) || 1, 1);
  const limit = Math.max(parseInt(queryLimit, 10) || 10, 1);

  const skip = (page - 1) * limit;
  const take = limit;

  return { skip, take, page, limit };
};

export const formatPaginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
