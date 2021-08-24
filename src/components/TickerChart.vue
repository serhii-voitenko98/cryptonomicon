<template>
  <section class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ selectedTicker.name }} - USD
    </h3>
    <div
      class="flex items-end border-gray-600 border-b border-l h-64"
      ref="graph"
    >
      <div
        v-for="(bar, idx) of normalizedGraph"
        :key="idx"
        :style="{ height: `${bar}%`, width: `${$options.BAR_WIDTH}px` }"
        class="bg-purple-800 border w-10"
      ></div>
    </div>

    <close-button
      @click="$emit('close-chart')"
      class="absolute top-0 right-0"
    />
  </section>
</template>

<script>
import CloseButton from "./elements/CloseButton.vue";

export default {
  BAR_WIDTH: 38,

  data() {
    return {
      maxGraphElements: 1,
    };
  },

  components: {
    CloseButton,
  },

  props: {
    graph: {
      required: false,
      default: [],
    },
    selectedTicker: {
      type: Object,
      required: false,
      default: null,
    },
  },

  emits: {
    "close-chart": null,
  },

  mounted() {
    this.calculateMaxGraphElements();

    window.addEventListener("resize", () => {
      this.calculateMaxGraphElements();
      this.normalizeGraphSize(this.graph);
    });
  },

  beforeUnmount() {
    window.removeEventListener("resize", () => {});
  },

  computed: {
    normalizedGraph() {
      const max = Math.max(...this.graph);
      const min = Math.min(...this.graph);

      if (max === min) {
        return this.graph.map(() => 50);
      }

      const normalized = this.graph.map(
        (price) => 5 + ((price - min) * 95) / (max - min)
      );

      console.log("normalized", normalized);

      this.normalizeGraphSize(normalized);

      return normalized;
    },
  },

  methods: {
    calculateMaxGraphElements() {
      if (!this.$refs.graph) {
        return;
      }

      this.maxGraphElements = parseInt(
        this.$refs.graph.clientWidth / this.$options.BAR_WIDTH
      );
    },

    normalizeGraphSize(graph) {
      console.log("this.maxGraphElements", this.maxGraphElements);
      while (graph.length > this.maxGraphElements) {
        graph.shift();
      }
    },
  },
};
</script>
