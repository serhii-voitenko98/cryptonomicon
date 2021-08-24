<template>
  <div>
    <app-button v-if="page != 1" @click="page -= 1" class="my-4 mr-2">
      <template #content>Previous</template>
    </app-button>

    <app-button v-if="isNextShown" @click="page += 1" class="my-4">
      <template #content>Next</template>
    </app-button>
  </div>
</template>

<script>
import AppButton from "./elements/AppButton.vue";
import { getSearchParams } from "../utils/get-search-params";

export default {
  data() {
    return {
      page: 1,
    };
  },

  props: {
    isNextShown: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  components: {
    AppButton,
  },

  emits: {
    "page-changed": null,
  },

  created() {
    const { page } = getSearchParams();

    if (page) {
      this.page = Number(page);
    }
  },

  watch: {
    page(newValue) {
      this.$emit("page-changed", newValue);
    },
  },
};
</script>
