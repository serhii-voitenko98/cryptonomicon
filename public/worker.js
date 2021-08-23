const API_KEY =
  "d0389feeeed3e7337fefea9f95d014cb302733582df58a80d62a8f2ad65c2f10";

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";
const ERROR_INDEX = "500";
const INVALID_SUB = "INVALID_SUB";
const BTC = "BTC";
const USD = "USD";

let btcToUsd;

const ports = [];

const getCurrencyFromParameter = (parameter) => {
  const SPLITTED_SYMBOL = "~";
  const splitted = parameter.split(SPLITTED_SYMBOL);

  return {
    cryptoCurrency: splitted.slice(2, 3).toString(),
    currency: splitted[splitted.length - 1],
  };
};

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

function subscribeTickerToWs(ticker) {
  if (ticker === BTC && btcToUsd !== undefined) {
    return;
  }
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeTickerFromWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`, `5~CCCAGG~${ticker}~BTC`],
  });
}

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

    ports.forEach((port) => {
      port.postMessage({
        currency: currencyFromParameter.cryptoCurrency,
        price: undefined,
        error: info,
      });
    });
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

    ports.forEach((port) => {
      port.postMessage({
        currency: fromSymbol,
        price,
        error: undefined,
      });
    });
  }
});

self.onconnect = function (e) {
  const port = e.ports[0];

  ports.push(port);

  port.addEventListener("message", function (e) {
    const [ticker, isSubscribeOperation] = e.data;

    if (isSubscribeOperation) {
      return subscribeTickerToWs(ticker);
    }

    unsubscribeTickerFromWs(ticker);
  });

  port.start();
};
