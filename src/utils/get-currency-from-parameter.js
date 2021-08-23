export const getCurrencyFromParameter = (parameter) => {
  const SPLITTED_SYMBOL = "~";
  const splitted = parameter.split(SPLITTED_SYMBOL);

  return {
    cryptoCurrency: splitted.slice(2, 3).toString(),
    currency: splitted[splitted.length - 1],
  };
};
