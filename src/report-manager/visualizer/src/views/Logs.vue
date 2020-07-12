<template>
  <div class="event-container">
      <h2>Logs</h2>
      <span>Logs associated to event {{eventID}}</span>
      <div v-for="browser in browsers" :key="browser">
        <div class="logs-header">
          <img :src="browser.image" :alt="`Image for ${browser.name}`">
          <p>{{browser.name}}</p>
        </div>
        <div class="logs-container" v-if="browser.log && browser.log.messages && browser.log.messages.length>0">
          <div class="log-line"
            v-for="(message, index) in browser.log.messages" :key="index">
            <p>{{ index +1 }}. [{{ browser.log.type }}]: {{ message }}</p>
          </div>
        </div>
        <div class="log-line" v-else>
          <p>There are no logs registered for this browser</p>
        </div>
      </div>
  </div>
</template>

<script>

const browserLogos = {
  firefox: 'images/firefox.png',
  chrome: 'images/chrome.png',
};

export default {
  data() {
    return {
      eventID: this.$route.params.eventID,
      browsers: this.$route.params.browsers,
    };
  },
  mounted() {
    this.browsers = this.browsers.map((browser) => ({
      ...browser,
      image: browserLogos[browser.name],
    }));
  },
};
</script>

<style scoped>
.event-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  padding: 0 32px;
  padding-top: 32px;
}

h2 {
  margin-bottom: 16px;
}

.logs-header{
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  color: #00488F;
  font-weight: bold;

  max-width: 30vw;
}

.logs-header > img{
    max-height: 24px;
  margin-right: 12px;
}

.logs-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  max-width:70vw;
}

.log-line {
  background-color: rgb(42, 42, 42);
  color: whitesmoke;
  padding: 3px 5px;
  width: 90vw;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: all .5s ease-in-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-enter-to, .fade-leave {
  opacity: 1;
}
</style>
