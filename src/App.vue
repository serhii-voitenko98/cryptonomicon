<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="false"
      class="
        fixed
        w-100
        h-100
        opacity-80
        bg-purple-800
        inset-0
        z-50
        flex
        items-center
        justify-center
      "
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <div class="container">
      <add-ticker
        @add-ticker="addTicker"
        @input="defineIsTickerExists"
        :tickerAlreadyExists="isTickerExists"
      />

      <tickers-filter @filter-changed="filterChanged" />

      <tickers-pagination
        @page-changed="pageChanged"
        :isNextShown="isNextShown"
      />

      <tickers-list
        @remove-ticker="removeTicker"
        @select-ticker="selectTicker"
        :tickers="paginatedTickers"
        :isSelected="!!selectedTicker"
      />

      <ticker-chart
        v-if="selectedTicker"
        @close-chart="selectedTicker = null"
        :selectedTicker="selectedTicker"
        :graph="graph"
      />
    </div>
  </div>
</template>

<script>
import TickersList from "./components/TickersList.vue";
import TickersFilter from "./components/TickersFilter.vue";
import TickersPagination from "./components/TickersPagination.vue";
import AddTicker from "./components/AddTicker.vue";
import TickerChart from "./components/TickerChart.vue";

import { subscribeToTicker, unsubscribeFromTicker } from "./api";

export default {
  name: "App",

  components: {
    TickersList,
    AddTicker,
    TickersFilter,
    TickersPagination,
    TickerChart,
  },

  data() {
    return {
      ticker: "",
      selectedTicker: null,
      isTickerExists: false,

      tickers: [],
      graph: [],

      filter: "",
      page: 1,
      size: 6,
    };
  },

  created() {
    const localStorageData = localStorage.getItem("crypto-list");

    if (localStorageData) {
      this.tickers = JSON.parse(localStorageData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (error, newPrice) => {
          if (error) {
            return this.updateTicker(ticker.name, "-", error);
          }

          this.updateTicker(ticker.name, newPrice, error);
        });
      });
    }
  },

  methods: {
    addTicker(ticker) {
      const currentTicker = {
        name: ticker,
        price: "-",
      };

      this.tickers = [...this.tickers, currentTicker];

      subscribeToTicker(currentTicker.name, (error, newPrice) => {
        if (error) {
          return this.updateTicker(currentTicker.name, "-", error);
        }

        this.updateTicker(currentTicker.name, newPrice, error);
      });
    },

    removeTicker(tickerToDelete) {
      this.tickers = this.tickers.filter((t) => t !== tickerToDelete);

      this.filter = "";
      this.page = 1;

      if (this.selectedTicker === tickerToDelete) {
        this.selectedTicker = null;
      }

      unsubscribeFromTicker(tickerToDelete.name, () => {
        console.log(`ticker ${tickerToDelete.name} has been unsubscribed`);
      });
    },

    defineIsTickerExists(ticker) {
      this.isTickerExists = !!this.tickers.filter((t) => t.name === ticker)
        .length;
    },

    updateTicker(tickerName, price, error) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          if (!error && t === this.selectedTicker) {
            this.graph.push(t.price);
          }

          t.price = price;
          t.error = error;
        });
    },

    selectTicker(ticker) {
      this.selectedTicker = ticker;
    },

    filterChanged(value) {
      this.filter = value;
    },

    pageChanged(value) {
      this.page = value;
    },
  },

  computed: {
    startIndex() {
      return (this.page - 1) * this.size;
    },

    endIndex() {
      return this.page * this.size;
    },

    isNextShown() {
      return this.filteredTickers.length > this.endIndex;
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    filteredTickers() {
      return this.tickers.filter((t) =>
        t.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  watch: {
    selectedTicker() {
      this.graph = [];
    },

    tickers() {
      localStorage.setItem("crypto-list", JSON.stringify(this.tickers));
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },
};
</script>
