<template>
  <div class="history-container">
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="error">
      <span>There was an error loading the runs: {{error}}</span>
      <button @click="retryLoading">Retry</button>
    </div>
    <template v-else>
      <h2>Run history</h2>
      <div class="run-list-container">
        <div
          class="run-container"
          v-for="run in runs.runs"
          :key="run"
          @click="$router.push({ name: 'Run', params: { run } })"
        >
          {{ run }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      runs: {},
      error: null,
    };
  },
  methods: {
    async loadRunData() {
      try {
        const response = await fetch('runs/runs.json');
        this.runs = await response.json();
      } catch (error) {
        console.error(error);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    retryLoading() {
      this.loading = true;
      this.loadRunData();
    },
  },
  async mounted() {
    await this.loadRunData();
  },
};
</script>

<style scoped>
.run-list-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.run-container {
  display: flex;
  flex-direction: row;
  margin: 0px;
  padding: 4px;
  border: 1px solid lightblue;
  border-width: 1px 0;
  cursor: pointer;
  width: 100%;
}

.run-container:hover {
  background-color: lightgray;
}
</style>
