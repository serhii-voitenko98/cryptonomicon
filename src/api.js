export const loadCoins = () =>
  fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  ).then((data) => data.json());

const updateTickersWorker = new SharedWorker("/worker.js");

const tickersHandlers = new Map();

updateTickersWorker.port.onmessage = function ({ data }) {
  invokeHandlers(data.currency, data.price, data.error);
};

function invokeHandlers(
  currency,
  newPrice = undefined,
  errorMessage = undefined
) {
  const handlers = tickersHandlers.get(currency) ?? [];

  handlers.forEach((fn) => {
    fn(errorMessage, newPrice);
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);

  updateTickersWorker.port.postMessage([ticker, true]);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  updateTickersWorker.port.postMessage([ticker, false]);
};