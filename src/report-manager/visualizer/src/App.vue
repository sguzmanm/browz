<template>
  <div id="app">
    <div class="topbar">
      <h1 class="title">Test report visualizer 👨‍💻️</h1>
    </div>
    <router-view />
  </div>
</template>

<style>
#app {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 8px 24px;
}

.topbar {
  display: flex;
  width: 100%;
  padding: 16px 0;
  border-bottom: 1px solid lightgray;
  margin-bottom: 16px;
}

.topbar .title {
  margin: 0;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
