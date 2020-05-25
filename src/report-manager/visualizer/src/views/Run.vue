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
        <label for="threshold-slider"> <b>Threshold:</b> {{threshold}}% </label>
        <input id="threshold-slider" type="range" min="1" max="100" v-model="threshold"/>
      </div>
      <hr>
      <h2>Event list</h2>
      <div class="test-table">
        <div class="row-container">
          <div class="id column">Event ID</div>
          <div class="type column">Event type</div>
          <div class="mismatch column">Mismatch percentage (before)</div>
          <div class="mismatch column">Mismatch percentage (after)</div>
          <div class="actions column">Actions</div>
        </div>
        <!-- eslint-disable-next-line max-len -->
        <div
          class="row-container event"
          v-for="{ id: eventID, eventType, before, after } in run.events"
          :key="eventID"
        >
          <div class="id column">{{ eventID }}</div>
          <div class="type column">{{ eventType }}</div>
          <div :class="mismatchFormat(before)">{{ before }}%</div>
          <div :class="mismatchFormat(after)">{{ after }}%</div>
          <div class="actions column">
            <button @click="$router.push({ name: 'Event', params: { eventID }})">
              <img src="icons/details.svg" alt="Details icon"/> Check
            </button>
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
      threshold: 10,
    };
  },
  computed: {
    testedBrowsers() {
      return this.run.browsers.join(',');
    },
  },
  methods: {
    mismatchFormat(rawPercentage) {
      const percentage = parseFloat(rawPercentage, 10);
      console.log(this.threshold);
      if (percentage > this.threshold) {
        return ['mismatch', 'column', 'over-threshold'];
      }

      return ['mismatch', 'column'];
    },
    retryLoading() {
      this.loading = true;
      this.loadRun();
    },
    async loadRun() {
      const { run } = this.$route.params;
      try {
        const response = await fetch(`runs/${run}/run.json`);
        this.run = await response.json();
        this.run.events.forEach(async ({ id: eventID }, i) => {
          try {
            const beforeResponse = await fetch(`runs/${run}/snapshots/${eventID}/comparison_before.json`);
            const afterResponse = await fetch(`runs/${run}/snapshots/${eventID}/comparison_after.json`);
            const before = await beforeResponse.json();
            const after = await afterResponse.json();

            this.run.events[i].before = before.resemble.misMatchPercentage;
            this.run.events[i].after = after.resemble.misMatchPercentage;
            this.$forceUpdate(); // TODO improve, this is machete
          } catch (error) {
            console.error(`Error fetching event[${eventID}] details: `, error);
          }
        });
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

.row-container:last-of-type .column {
  border-bottom: 1px solid lightgray;
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

.actions{
  display:flex;
  flex-direction: column;
  flex:1;
}

.actions > button{
  border:solid 1px black;
  background: rgb(159, 211, 86);

  display:flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  cursor:pointer;
}

.after {
  height: 240px;
}

.over-threshold {
  background-color: rgb(255, 158, 158);
}
</style>
