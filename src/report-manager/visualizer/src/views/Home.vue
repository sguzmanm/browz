<template>
  <div class="home">
    <h1>Test report visualizer 👨‍💻️</h1>
    <div class="event-container" v-for="eventID in eventIDs" :key="eventID">
      [{{eventID}}]
      <img class="after" :src="(`snapshots/${eventID}/comparison_chrome_vs_firefox_after.png`)">
    </div>
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';

export default {
  name: 'Home',
  data() {
    return {
      eventIDs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    };
  },
  components: {
    // HelloWorld,
  },
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.event-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 8px 0;
}

.after {
  height: 240px;
}
</style>
