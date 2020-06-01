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
          <div class="breadcrumb-text">
            {{ level }}
          </div>
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
        this.breadcrumbLevels = ['Run history', this.$route.params.run];
      }
    },
  },
  mounted() {
    this.updateBreadcrumb();
  },
  watch: {
    $route() {
      this.updateBreadcrumb();
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
  padding: 0 64px;
  background: linear-gradient(20deg, #2B32B2, #1488CC);
  padding-bottom: 32px;
  transition: all 0.5s;
  height: fit-content;
}

h1 {
  margin-top: 32px;
  margin-bottom: 0;
  color: whitesmoke;
  font-size: 2.4rem;
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
