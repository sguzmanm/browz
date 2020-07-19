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
      <a class="logs-link">View logs related to this event</a>

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

        <step-indicator :should-continue="shouldRenderSecondIndicator" />

        <transition name="fade">
          <div class="funnel-step-container" v-if="shouldRenderSecondIndicator">
          <multiselect
            class="multiselect-container"
            v-model="visualizationMode"
            :options="visualizationModeOptions"
            :searchable="false"
            :show-labels="false"
            placeholder="Select an option"
          >
            <template slot="singleLabel" slot-scope="props">
              <div class="multiselect-option-container">
                <i class="material-icons">{{props.option.icon}}</i>
                <span class="multiselect-selected-label">
                  {{ props.option.title }}
                </span>
              </div>
            </template>
            <template slot="option" slot-scope="props">
              <div class="multiselect-option-container">
                <i class="material-icons">{{props.option.icon}}</i>
                <div class="multiselect-option-text-container">
                  <span class="multiselect-option-title">{{ props.option.title }}</span>
                  <div class="multiselect-option-desc">{{ props.option.desc }}</div>
                </div>
              </div>
            </template>
          </multiselect>
          <transition name="fade">
            <span v-if="!visualizationMode" class="funnel-step-tooltip">
              Choose how to visualize the comparison
            </span>
          </transition>
        </div>
        </transition>
      </div>

      <div class="image-container" v-if="shouldRenderImage">
        <img :src="imageSrc" alt="browser screenshot">
      </div>

      <div class="image-container" v-if="shouldRenderSideBySide">
        <vue-compare-image
          :leftImage="chromeAndFirefoxImages[0]"
          leftLabel="Chrome"
          :rightImage="chromeAndFirefoxImages[1]"
          rightLabel="Firefox"
        />
      </div>
    </template>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import VueCompareImage from 'vue-compare-image';
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
    icon: 'compare',
  },
  {
    title: 'Visual diff',
    desc: 'Color the areas where the two images differ',
    icon: 'filter_b_and_w',
  },
];

export default {
  components: {
    Multiselect,
    StepIndicator,
    VueCompareImage,
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
      const offset = (this.event.comparisonTimestamp - this.run.startTimestamp) / 1000;
      return offset.toFixed(2);
    },
    shouldRenderSecondIndicator() {
      return !!this.visualizationTarget && !!this.moment
        && this.visualizationTarget && this.visualizationTarget.title === 'Chrome vs Firefox';
    },
    shouldRenderDiffImage() {
      return this.visualizationTarget
        && this.visualizationTarget.title === 'Chrome vs Firefox'
        && this.moment !== null
        && this.visualizationMode
        && this.visualizationMode.title === 'Visual diff';
    },
    shouldRenderBrowserImage() {
      return this.visualizationTarget
        && this.visualizationTarget.title !== 'Chrome vs Firefox'
        && this.moment !== null;
    },
    shouldRenderImage() {
      return this.shouldRenderDiffImage || this.shouldRenderBrowserImage;
    },
    shouldRenderSideBySide() {
      return this.visualizationTarget
        && this.visualizationTarget.title === 'Chrome vs Firefox'
        && this.moment !== null
        && this.visualizationMode
        && this.visualizationMode.title === 'Side by Side';
    },
    imageSrc() {
      const moment = this.moment.split(' ')[0].toLowerCase();

      let browser = this.visualizationTarget.title.toLowerCase();
      if (browser === 'chrome vs firefox') {
        browser = browser.replaceAll(' ', '_');
        return `runs/${this.$route.params.run}/snapshots/${this.eventID}/comparison_${browser}_${moment}.png`;
      }

      return `runs/${this.$route.params.run}/snapshots/${this.eventID}/${browser}_${moment}.png`;
    },
    chromeAndFirefoxImages() {
      const moment = this.moment.split(' ')[0].toLowerCase();

      return [
        `runs/${this.$route.params.run}/snapshots/${this.eventID}/chrome_${moment}.png`,
        `runs/${this.$route.params.run}/snapshots/${this.eventID}/firefox_${moment}.png`,
      ];
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

.left-label, .right-label {
  background: linear-gradient(20deg, rgba(43, 50, 178, 0.4), rgba(20, 136, 204, 0.4));
  color: whitesmoke;
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
  margin-top: 16px;
  margin-bottom: 32px;
}

.funnel-step-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  width: 25vw;
  min-width: 280px;
  max-width: 360px;

  user-select: none;
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

.multiselect-option-container .material-icons {
  margin-right: 12px;
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
