<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Ticker</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="example: DOGE"
            v-model="ticker"
            @keydown.enter="add"
          />
        </div>

        <div
          v-if="filteredCoinList.length"
          class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
        >
          <span
            v-for="(coin, idx) in filteredCoinList"
            :key="idx"
            @click="selectCoin(coin)"
            class="
              inline-flex
              items-center
              px-2
              m-1
              rounded-md
              text-xs
              font-medium
              bg-gray-300
              text-gray-800
              cursor-pointer
            "
          >
            {{ coin }}
          </span>
        </div>

        <div v-if="tickerAlreadyExists" class="text-sm text-red-600">
          Ticker already exist
        </div>
      </div>
    </div>

    <add-button @click="add" class="my-4">
      <template #content>Add ticker</template>
    </add-button>
  </section>
</template>

<script>
import AddButton from "./elements/AddButton.vue";
import { loadCoins } from "../api";

export default {
  components: {
    AddButton,
  },

  data() {
    return {
      ticker: "",
      coinList: [],
    };
  },

  props: {
    tickerAlreadyExists: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  emits: {
    "add-ticker": (value) => typeof value === "string" && value.length,
    input: (value) => typeof value === "string",
  },

  created() {
    loadCoins().then((data) => (this.coinList = data["Data"]));
  },

  methods: {
    add() {
      if (!this.ticker || this.tickerAlreadyExists) {
        return;
      }

      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
    },

    selectCoin(coin) {
      this.ticker = coin;
      this.add();
    },
  },

  computed: {
    filteredCoinList() {
      const result = [];

      if (this.coinList && this.ticker) {
        for (const key in this.coinList) {
          if (result.length === 4) break;

          if (!Object.prototype.hasOwnProperty.call(this.coinList, key))
            continue;

          const tickerInLowerCase = this.ticker.toLowerCase();
          const symbol = this.coinList[key].Symbol.toLowerCase();
          const fullName = this.coinList[key].FullName.toLowerCase();

          if (
            symbol.includes(tickerInLowerCase) ||
            fullName.includes(tickerInLowerCase)
          ) {
            result.push(this.coinList[key].Symbol);
          }
        }
      }

      return result;
    },
  },

  watch: {
    ticker() {
      this.$emit("input", this.ticker);
    },
  },
};
</script>
