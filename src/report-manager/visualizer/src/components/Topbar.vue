<template>
  <div class="topbar-container">
    <h1>Thesis</h1>
    <transition name="grow">
      <div class="breadcrumb-container" v-if="breadcrumbLevels.length > 0">
        <div
          v-for="(level, index) in breadcrumbLevels"
          :key="level"
          class="breadcrumb-item"
        >
          <a @click="handleBreadcrumbItemClick(index)" class="breadcrumb-text">
            {{ level }}
          </a>
          <div class="breadcrumb-separator" v-if="index != breadcrumbLevels.length - 1"> > </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      breadcrumbLevels: [],
      currentRun: '',
    };
  },
  methods: {
    updateBreadcrumb() {
      const { name } = this.$route;

      if (name === 'History') {
        this.breadcrumbLevels = [];
        return;
      }

      if (name === 'Run') {
        this.currentRun = this.$route.params.run;
        this.breadcrumbLevels = ['Run history', this.currentRun];
        return;
      }

      if (name === 'Event') {
        this.currentRun = this.$route.params.run;
        this.currentEvent = this.$route.params.eventID;
        this.breadcrumbLevels = [
          'Run history',
          this.$route.params.run,
          `Event #${this.$route.params.eventID}`,
        ];
      }
    },
    handleBreadcrumbItemClick(index) {
      if (index + 1 === this.breadcrumbLevels.length) {
        return;
      }

      switch (index) {
        case 0:
          this.$router.push({ name: 'History' });
          break;
        case 1:
          this.$router.push({ name: 'Run', params: { run: this.currentRun } });
          break;
        case 2:
          this.$router.push({ name: 'Event', params: { run: this.currentRun, eventID: this.currentEvent } });
          break;
        default:
          console.error('Unexpected breadcrumb state');
          break;
      }
    },
  },
  mounted() {
    this.updateBreadcrumb();
  },
  watch: {
    $route() {
      this.updateBreadcrumb();
      document.querySelector('.topbar-container').scrollIntoView();
    },
  },
};
</script>

<style scoped>
.topbar-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  padding: 0 32px;
  background: linear-gradient(20deg, #2B32B2, #1488CC);
  padding-bottom: 32px;
  transition: all 0.5s;
  height: fit-content;
}

h1 {
  margin-top: 32px;
  margin-bottom: 0;
  color: whitesmoke;
  font-size: 2.48rem;
}

.breadcrumb-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.breadcrumb-item {
  display: flex;
  flex-direction: row;
  color: lightblue;
  font-size: 1.32rem;
  opacity: 1;
}

.breadcrumb-text {
  text-decoration: underline lightblue;
  cursor: pointer;
}

.breadcrumb-separator {
  margin: 0 0.64rem;
  text-decoration: none;
}

/* Transitions */
.grow-enter-active, .grow-leave-active {
  transition: all .5s;
}

.grow-enter, .grow-leave-to {
  height: 0 !important;
  opacity: 0;
}

.grow-enter-to, .grow-leave {
  height: 1.4rem;
}
</style>
