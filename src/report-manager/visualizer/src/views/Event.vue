<template>
  <div class="event-container">
    <h1>Event: {{ eventID }}</h1>
    <h2>Before</h2>
    <div class="detail-container">
      <div class="image-container">
        <img :src="`runs/${$route.params.run}/snapshots/${eventID}/chrome_before.png`">
        <span>Chrome</span>
      </div>
      <div class="image-container">
        <img :src="`runs/${$route.params.run}/snapshots/${eventID}/firefox_before.png`">
        <span>Firefox</span>
      </div>
      <div class="image-container">
        <img :src="`runs/${$route.params.run}/snapshots/${eventID}/comparison_chrome_vs_firefox_before.png`">
        <span>Diff (comparison)</span>
      </div>
    </div>
    <h2>After</h2>
    <div class="detail-container">
      <div class="image-container">
        <img :src="`runs/${$route.params.run}/snapshots/${eventID}/chrome_after.png`">
        <span>Chrome</span>
      </div>
      <div class="image-container">
        <img :src="`runs/${$route.params.run}/snapshots/${eventID}/firefox_after.png`">
        <span>Firefox</span>
      </div>
      <div class="image-container">
        <img :src="`runs/${$route.params.run}/snapshots/${eventID}/comparison_chrome_vs_firefox_after.png`">
        <span>Diff (comparison)</span>
      </div>
    </div>

    <h2 v-show="consoleLogs && consoleLogs.length>0">Console logs</h2>
    <div v-show="consoleLogs && consoleLogs.length>0">
      <div class="detail-container">
        <div v-for="(browser,index) in consoleLogs" :key="index" class="logs-container">
          <p class="console-log">
            <span :class="{ error: browser.isErrorLog }">{{browser.log.type}}: </span>{{browser.log.message}}
          </p>
          <span>{{browser.name}}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      eventID: this.$route.params.eventID,
      consoleLogs: [],
    };
  },
  mounted() {
    const { browsers } = this.$route.params;
    if (!browsers) return;
    browsers.forEach((browser) => {
      if (browser.log) {
        this.consoleLogs.push({
          ...browser,
          isErrorLog: browser.log ? browser.log.type === 'error' : false,
        });
      }
    });
  },
};
</script>

<style scoped>
.event-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 8px 24px;
}

.detail-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.image-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.logs-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  max-width:30vw;
}

.error{
  color: rgb(255, 158, 158);
}

img {
  height: 320px;
  width: auto;
  margin-right: 16px;
}
</style>
