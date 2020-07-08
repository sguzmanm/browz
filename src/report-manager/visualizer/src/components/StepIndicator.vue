<template>
  <div class="step-indicator-container">
    <div class="triangle-border"/>
    <transition name="slide">
      <div v-if="visible" :class="['moving-indicator', { visible }]" />
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style scoped>
.step-indicator-container {
  position: relative;
  --indicator-size: 32px;
  overflow: hidden;
}

.triangle-border {
  width: var(--indicator-size);
  height: var(--indicator-size);
  border-color: white;
  border-width: calc(var(--indicator-size)/2);
  border-style: solid;
  border-left: var(--indicator-size) solid transparent;
  border-right: 0;
}

.moving-indicator {
  height: var(--indicator-size);
  width: var(--indicator-size);
  position: absolute;
  top: 0;
  left: calc(-1 * var(--indicator-size));
  background: linear-gradient(20deg, #2B32B2, #1488CC);
  z-index: -1;
  transition: all .48s;
  border-radius: 0 calc(var(--indicator-size)/2) calc(var(--indicator-size)/2) 0;
}

.visible {
  left: 0;
}

.slide-enter, .slide-leave-to {
  left: calc(-1 * var(--indicator-size));
}

.slide-enter-to, .slide-leave {
  left: 0;
}

.slide-leave-to {
  transform: translateY(4px) scaleY(0.8);
}

</style>
