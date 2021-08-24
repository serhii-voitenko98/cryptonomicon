export const getSearchParams = () =>
  Object.fromEntries(new URL(window.location.href).searchParams);
