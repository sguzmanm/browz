<template>
  <div class="event-container">
    <div v-if="loading">
      Loading...
    </div>

    <div v-else-if="error">
      <span>There was an error loading this run: {{ error }}</span>
      <button @click="rertyLoading">Retry</button>
    </div>

    <template v-else>
      <h2>Event #{{ eventID }}</h2>
      <span>Random click @ {{ eventTimeOffset }}s after starting the run</span>
      <a class="logs-link"  @click="$router.push({ name: 'Logs', params: { eventID, browsers:event.browsers }})">
        View logs related to this event
        </a>
      <div class="funnel-container">
        <div class="funnel-step-container">
          <multiselect
            class="multiselect-container"
            v-model="visualizationTarget"
            :options="visualizationTargetOptions"
            :searchable="false"
            :show-labels="false"
            placeholder="Select an option"
          >
            <template slot="singleLabel" slot-scope="props">
              <div class="multiselect-option-container">
                <img class="multiselect-selected-label-image" :src="props.option.imagePath" alt="">
                <span class="multiselect-selected-label">
                  {{ props.option.title }}
                </span>
              </div>
            </template>
            <template slot="option" slot-scope="props">
              <div class="multiselect-option-container">
                <img class="multiselect-option-image" :src="props.option.imagePath" alt="">
                <div class="multiselect-option-text-container">
                  <span class="multiselect-option-title">{{ props.option.title }}</span>
                  <div class="multiselect-option-desc">{{ props.option.desc }}</div>
                </div>
              </div>
            </template>
          </multiselect>
          <transition name="fade">
            <span v-if="!visualizationTarget" class="funnel-step-tooltip">
              Choose what to visualize
            </span>
          </transition>
        </div>

        <step-indicator :should-continue="!!visualizationTarget" />

        <transition name="fade">
          <div class="funnel-step-container" v-if="!!visualizationTarget">
            <multiselect
              class="multiselect-container"
              v-model="moment"
              :options="momentOptions"
              :searchable="false"
              :show-labels="false"
              placeholder="Select an option"
            />
            <transition name="fade">
              <span v-if="!moment" class="funnel-step-tooltip">
                Choose moment when the screenshot was taken
              </span>
            </transition>
          </div>
        </transition>

        <step-indicator :should-continue="!!visualizationTarget && !!moment" />
      </div>
    </template>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import StepIndicator from '@/components/StepIndicator.vue';

const visualizationTargetOptions = [
  {
    title: 'Firefox',
    desc: 'Screenshots taken on firefox',
    imagePath: 'images/firefox.png',
  },
  {
    title: 'Chrome',
    desc: 'Screenshots taken on chrome',
    imagePath: 'images/chrome.png',
  },
  {
    title: 'Chrome vs Firefox',
    desc: 'Compare screenshots from both browsers',
    imagePath: 'images/chrome vs firefox.png',
  },
];

const momentOptions = [
  'Before the event',
  'After the event',
];

const visualizationModeOptions = [
  {
    title: 'Side by Side',
    desc: 'Use a slider to switch between the firefox or chrome version',
  },
  {
    title: 'Visual diff',
    desc: 'Color the areas where the two images differ',
  },
];

export default {
  components: {
    Multiselect,
    StepIndicator,
  },
  data() {
    return {
      loading: true,
      error: null,
      eventID: this.$route.params.eventID,
      run: {},
      event: {},
      before: {},
      after: {},

      visualizationTargetOptions,
      momentOptions,
      visualizationModeOptions,

      visualizationTarget: null,
      moment: null,
      visualizationMode: null,
    };
  },
  mounted() {
    this.loadData();
  },
  computed: {
    eventTimeOffset() {
      console.log(this.event.timestamp, this.run.startTimestamp, this.run.events);

      const offset = (this.event.comparisonTimestamp - this.run.startTimestamp) / 1000;
      return offset.toFixed(2);
    },
  },
  methods: {
    async loadData() {
      const { run } = this.$route.params;
      const { eventID } = this;

      try {
        const response = await fetch(`runs/${run}/run.json`);
        const beforeResponse = await fetch(`runs/${run}/snapshots/${eventID}/comparison_before.json`);
        const afterResponse = await fetch(`runs/${run}/snapshots/${eventID}/comparison_after.json`);
        const logResponse = await fetch(`runs/${run}/log.json`);

        this.run = await response.json();
        this.before = await beforeResponse.json();
        this.after = await afterResponse.json();
        this.logs = await logResponse.json();

        this.run.events.forEach((event) => {
          if (event.id === eventID) {
            this.event = event;
          }
        });
      } catch (error) {
        console.error(error);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
  },
  watch: {
    visualizationTarget(newValue) {
      if (newValue === null) {
        // unset next steps when visualization target is de-selected
        this.moment = null;
        this.visualizationMode = null;
      }
    },
  },
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
.multiselect__option--highlight {
  background: linear-gradient(20deg, #2B32B2, #1488CC);
}
</style>

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

.logs-link {
  font-size: 1.32rem;
  text-decoration: underline;
  color: #00488F;
  margin: 16px 0;
  cursor: pointer;
}

.funnel-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}

.funnel-step-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  width: 25vw;
  min-width: 280px;
  max-width: 360px;
}

.funnel-step-tooltip {
  margin-top: 12px;
  line-height: 1.32rem;
  text-align: center;
  color: #4b7ce0;
}

.multiselect-container {
  width: 25vw;
  min-width: 280px;
  max-width: 360px;
}

.multiselect-selected-label-image {
  max-height: 24px;
  margin-right: 12px;
}

.multiselect-option-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: calc(25vw - 2*12px);
  min-width: calc(280px - 2*12px - 12px);
  max-width: calc(360px - 2*12px - 12px);
}

.multiselect-option-image {
  max-height: 32px;
  margin-right: 12px;
}

.multiselect-option-text-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  overflow-wrap: break-word;
  overflow: hidden;
}

.multiselect-option-desc {
  font-size: 0.88rem;
  white-space: normal;
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
