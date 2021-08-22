//TODO: refactor to use URLSearchParams

export const loadCoins = () =>
  fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  ).then((data) => data.json());

const API_KEY =
  "d0389feeeed3e7337fefea9f95d014cb302733582df58a80d62a8f2ad65c2f10";

const tickersHandlers = new Map();

const loadTicker = () => {
  if (!tickersHandlers.size) {
    return;
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys(),
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((data) => data.json())
    .then((data) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];

        handlers.forEach(fn => fn(newPrice));
      })
    });
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
};

setInterval(() => {
  loadTicker();
}, 5000);

window.tickers = tickersHandlers;
