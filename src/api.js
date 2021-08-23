//TODO: refactor to use URLSearchParams
import { getCurrencyFromParameter } from "./utils/get-currency-from-parameter";

export const loadCoins = () =>
  fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  ).then((data) => data.json());

const API_KEY =
  "d0389feeeed3e7337fefea9f95d014cb302733582df58a80d62a8f2ad65c2f10";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";
const ERROR_INDEX = "500";
const INVALID_SUB = "INVALID_SUB";
const BTC = "BTC";
const USD = "USD";

let btcToUsd;

socket.addEventListener("message", ({ data }) => {
  const {
    TYPE: type,
    FROMSYMBOL: fromSymbol,
    TOSYMBOL: toSymbol,
    PRICE: newPrice,
    PARAMETER: parameter,
    INFO: info,
    MESSAGE: message,
  } = JSON.parse(data);

  if ((type !== AGGREGATE_INDEX || !newPrice) && type !== ERROR_INDEX) {
    return;
  }

  if (fromSymbol === BTC && toSymbol === USD) {
    btcToUsd = newPrice;
  }

  if (type === ERROR_INDEX && message === INVALID_SUB) {
    const currencyFromParameter = getCurrencyFromParameter(parameter);

    if (currencyFromParameter.currency === USD) {
      return sendToWebSocket({
        action: "SubAdd",
        subs: [`5~CCCAGG~${currencyFromParameter.cryptoCurrency}~BTC`],
      });
    }

    invokeHandlers(currencyFromParameter.cryptoCurrency, undefined, info);
  } else {
    let price = newPrice;

    if (toSymbol === BTC) {
      if (btcToUsd === undefined) {
        return sendToWebSocket({
          action: "SubAdd",
          subs: [`5~CCCAGG~BTC~USD`],
        });
      }

      price *= btcToUsd;
    }

    invokeHandlers(fromSymbol, price);
  }
});

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

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeTockerToWs(ticker) {
  if (ticker === BTC && btcToUsd !== undefined) {
    return;
  }
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeFromckerToWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`, `5~CCCAGG~${ticker}~BTC`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);

  subscribeTockerToWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromckerToWs(ticker);
};

window.tickers = tickersHandlers;
