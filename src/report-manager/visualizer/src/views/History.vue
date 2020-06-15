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
      <span>Here will be displayed all the cross-browser test runs that are stored locally</span>
      <div class="run-list-table">
        <div class="run-list-row">
          <span class="table-header date-cell">Date</span>
          <span class="table-header path-cell">Built files path</span>
        </div>
        <div
          class="run-list-row"
          v-for="run in runs"
          :key="run.startDate"
          @click="$router.push({ name: 'Run', params: { run: run.startDate } })"
        >
          <div class="date-cell">
            {{ run.startDate }}
          </div>
          <div class="path-cell">
            {{ run.appDirname }}
          </div>
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
      runs: [],
      error: null,
    };
  },
  methods: {
    async loadRunData() {
      try {
        const response = await fetch('runs/runs.json');
        const { runs } = await response.json();

        runs.forEach(async (run) => {
          const runResponse = await fetch(`runs/${run}/run.json`);
          this.runs.push(await runResponse.json());
          this.$forceUpdate();
        });
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
.history-container{
  padding: 0 64px;
  padding-top: 32px;
  min-width: 80vw;
}

.run-list-table {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 16px;
  margin-bottom: 32px;
}

.run-list-row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  cursor: pointer;
  width: 100%;
  background-color: white;
  padding: 4px 0;
  transition: 0.16s all ease-in-out;
}

.run-list-row:nth-of-type(2n) {
  background-color: rgb(226, 226, 226);
}

.run-list-row:hover {
  background-color: rgb(163, 187, 221);
}

.run-list-row:first-of-type:hover {
  background-color: white;
  cursor: auto;
}

.table-header {
  font-weight: bold;
  text-align: center;
}

.date-cell {
  flex: 1;
  padding: 0 24px;
}

.path-cell {
  flex: 4;
  padding: 0 24px;
}
</style>
