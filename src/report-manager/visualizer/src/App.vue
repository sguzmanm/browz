<template>
  <div id="app">
    <div class="topbar">
      <h1 class="title">Test report visualizer 👨‍💻️</h1>
    </div>
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="error">
      <span>There was an error loading the runs: {{error}}</span>
      <button @click="retryLoading">Retry</button>
    </div>
    <router-view v-else/>
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

        if (this.runs.currentRun) {
          this.$router.push({ name: 'Run', params: { run: this.runs.currentRun } });
        }
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

<style>
#app {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 8px 24px;
}

.topbar {
  display: flex;
  width: 100%;
  padding: 16px 0;
  border-bottom: 1px solid lightgray;
  margin-bottom: 16px;
}

.topbar .title {
  margin: 0;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
