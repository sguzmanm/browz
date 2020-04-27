<template>
  <div class="home">
    <h1>Test report visualizer 👨‍💻️</h1>
    <div class="run-info">
      <span><b>Seed:</b> 54319902875 </span>
      <span><b>Base browser:</b> Chrome </span>
      <span><b>Browsers tested:</b> Chrome, Firefox </span>
      <span><b>Run date:</b> {{ date.toLocaleString() }} </span>
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
      <div class="row-container" v-for="{ id: eventID, event: eventType, resemble } in run.events" :key="eventID">
        <div class="id column">{{ eventID }}</div>
        <div class="type column">{{ eventType }}</div>
        <div class="mismatch column">{{ resemble.misMatchPercentage }}%</div>
        <div class="comparison column">
          <img class="after" :src="(`snapshots/${eventID}/comparison_chrome_vs_firefox_after.png`)">
        </div>
      </div>
    </div>
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
// @ is an alias to /src
//
import run from '@/../public/runs.json';

export default {
  name: 'Home',
  data() {
    return {
      eventIDs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      date: new Date(),
      run,
    };
  },
  components: {
    // HelloWorld,
  },
  mounted() {
    this.run.events.forEach(async ({ id: eventID }, i) => {
      const response = await fetch(`snapshots/${eventID}/comparison.json`);
      try {
        const { resemble } = await response.json();
        run.events[i].resemble = resemble;
      } catch (error) {
        console.error(eventID, error);
      }
    });
  },
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 8px 24px;
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
