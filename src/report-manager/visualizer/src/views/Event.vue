<template>
  <div class="event-container">
    <h1>Event: {{ eventID }}</h1>
    <h2>Before</h2>
    <div class="before-container">
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
    <div class="before-container">
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      eventID: this.$route.params.eventID,
    };
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

.before-container {
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

img {
  height: 320px;
  width: auto;
  margin-right: 16px;
}
</style>
