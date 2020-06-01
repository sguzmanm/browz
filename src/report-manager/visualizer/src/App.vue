<template>
  <div id="app">
    <Topbar />
    <router-view />
  </div>
</template>

<script>
import Topbar from '@/components/Topbar.vue';

export default {
  components: {
    Topbar,
  },
};
</script>

<style>
body {
  margin: 0;
}

* {
  box-sizing: border-box;
}

#app {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-family: 'Ubuntu Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 1.24rem;
  color: #003264;
}

h2, h3, h4 ,h5, h6 {
  color: #00488F;
  margin: 0;
}

h2 {
  font-size: 1.8rem;
}
</style>
