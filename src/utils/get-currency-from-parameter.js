export const getCurrencyFromParameter = (parameter) => {
  const SPLITTED_SYMBOL = "~";

  return parameter.split(SPLITTED_SYMBOL).slice(2, 3).toString();
};
