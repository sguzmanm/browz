<template>
  <div class="run-container">
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="error">
      <span>There was an error loading this run: {{ error }}</span>
      <button @click="rertyLoading">Retry</button>
    </div>
    <template v-else>
      <div class="run-info">
        <span><b>Run start date:</b> {{ run.startDate }} </span>
        <span><b>Run end date:</b> {{ run.endDate }} </span>
        <span><b>Seed:</b> 54319902875 </span>
        <span><b>Base browser:</b> {{ run.baseBrowser }} </span>
        <span><b>Browsers tested:</b> {{ testedBrowsers }} </span>
      </div>
      <hr>
      <h2>Event list</h2>
      <div class="test-table">
        <div class="row-container">
          <div class="id column">Event ID</div>
          <div class="type column">Event type</div>
          <div class="mismatch column">Mismatch percentage</div>
          <div class="comparison column">Comparison</div>
        </div>
        <!-- eslint-disable-next-line max-len -->
        <div
          class="row-container event"
          v-for="{ id: eventID, eventType, resemble } in run.events"
          :key="eventID"
          @click="$router.push({ name: 'Event', params: { eventID }})"
        >
          <div class="id column">{{ eventID }}</div>
          <div class="type column">{{ eventType }}</div>
          <div class="mismatch column">{{ resemble && resemble.misMatchPercentage }}%</div>
          <div class="comparison column">
            <img class="after" :src="(`runs/${$route.params.run}/snapshots/${eventID}/comparison_chrome_vs_firefox_after.png`)">
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'Run',
  data() {
    return {
      loading: true,
      run: null,
      error: null,
    };
  },
  computed: {
    testedBrowsers() {
      return this.run.browsers.join(',');
    },
  },
  methods: {
    retryLoading() {
      this.loading = true;
      this.loadRun();
    },
    async loadRun() {
      const { run } = this.$route.params;
      try {
        const response = await fetch(`runs/${run}/run.json`);
        this.run = await response.json();
      } catch (error) {
        console.error(error);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
  },
  async mounted() {
    await this.loadRun();
  },
};
</script>

<style scoped>
.run-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
}

h1 {
  margin: 8px 0;
  font-size: 2.32rem;
}

.run-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: 1.2rem;
}

hr {
  width: 100%;
}

h2 {
  margin: 8px 0 16px 0;
}

.test-table {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
}

.row-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.event {
  cursor: pointer;
}

.event:hover {
  background-color: rgb(235, 235, 235);
}

.column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: stretch;
  border: 1px solid lightgray;
  padding: 8px;
  border-bottom: 0;
}

.id {
  flex: 1;
}

.type  {
  flex: 4;
}

.comparison {
  flex: 16;
}

.mismatch {
  flex: 4;
}

.after {
  height: 240px;
}
</style>