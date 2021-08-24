<template>
  <hr class="w-full border-t border-gray-600 my-4" />

  <div>
    <span class="mr-1">Filter:</span>
    <input
      type="text"
      name="wallet"
      class="
        pr-10
        border-gray-300
        text-gray-900
        focus:outline-none focus:ring-gray-500 focus:border-gray-500
        sm:text-sm
        rounded-md
      "
      placeholder=""
      v-model="filter"
    />
  </div>
</template>

<script>
import { getSearchParams } from "../utils/get-search-params";

export default {
  data() {
    return {
      filter: "",
    };
  },

  props: {
    valueFromUrl: {
      type: String,
      required: false,
      default: "",
    },
  },

  emits: {
    "filter-changed": (value) => typeof value === "string",
  },

  created() {
    const { filter } = getSearchParams();

    if (filter) {
      this.filter = filter;
    }
  },

  watch: {
    filter(newValue) {
      this.$emit("filter-changed", newValue);
    },
  },
};
</script>
