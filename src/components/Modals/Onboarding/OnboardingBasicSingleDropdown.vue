<template>
  <div
    class="onboarding-selectWrapperRow"
    :style="{ borderColor: boxBorder }"
    v-click-outside="closeDropdownIfOpen"
  >
    <div class="onboarding-select onboarding-input" data-cyId="onboarding-dropdown">
      <div
        class="onboarding-dropdown-placeholder college-major-minor-wrapper"
        @click="showHideDropdown()"
      >
        <input
          type="text"
          class="onboarding-dropdown-placeholder college-major-minor-placeholder"
          :style="{ color: placeholderColor, border: 'none', outline: 'none' }"
          :placeholder="prevQuery || 'Select one'"
          v-model="curQuery"
          tabindex="-1"
          ref="selectbox"
          @keyup="onKeyUp"
        />
        <div
          class="onboarding-dropdown-placeholder college-major-minor-arrow"
          :style="{ borderTopColor: arrowColor, transform: arrowDirection }"
        ></div>
      </div>
      <div class="onboarding-dropdown-content" v-if="shown">
        <div
          v-for="[key, fullName] in foundChoices"
          :key="key"
          class="onboarding-dropdown-content-item"
          :ref="`scroll-ref-${key}`"
          @click="onSelect([key, fullName])"
          data-cyId="onboarding-dropdownItem"
        >
          <img
            v-if="correspondingImages"
            class="season-emoji"
            :src="correspondingImages[fullName]"
            alt=""
          />
          {{ fullName }}
        </div>
      </div>
    </div>
    <button class="onboarding-remove" @click="onRemove()" v-if="!cannotBeRemoved">
      <img src="@/assets/images/x-green.svg" alt="x to delete dropdown" />
    </button>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { clickOutside } from '@/utilities';
import {
  inactiveGray,
  yuxuanBlue,
  lightPlaceholderGray,
  upsideDown,
} from '@/assets/constants/scss-variables';

export default defineComponent({
  props: {
    /** Mapping from acronym to full name */
    availableChoices: {
      type: Object as PropType<Readonly<Record<string, string>>>,
      required: true,
    },
    choice: { type: String, required: true },
    cannotBeRemoved: { type: Boolean, required: true },
    scrollBottomToElement: { type: Number, default: 0 },
    correspondingImages: {
      type: Object as PropType<Readonly<Record<string, string>>>,
      default: null,
    },
  },
  mounted() {
    this.curQuery = this.availableChoices[this.choice];
    this.prevQuery = this.curQuery;
  },
  emits: {
    'on-select': (acronym: string) => typeof acronym === 'string',
    'on-remove': () => true,
  },
  data() {
    return {
      shown: false,
      curQuery: '',
      prevQuery: '',
      stopClose: false,
      boxBorder: '',
      arrowColor: '',
      arrowDirection: '',
      placeholderColor: this.choice !== '' ? lightPlaceholderGray : '',
    };
  },
  computed: {
    foundChoices(): [string, string][] {
      return Object.entries(this.availableChoices).filter(v =>
        v[1].toLowerCase().startsWith(this.curQuery.toLowerCase())
      );
    },
  },
  directives: {
    'click-outside': clickOutside,
  },
  watch: {
    choice(newVal) {
      this.curQuery = this.availableChoices[newVal] || '';
      this.prevQuery = this.curQuery;
    },
  },
  methods: {
    showHideDropdown() {
      const contentShown = this.shown;
      this.shown = !contentShown;

      const box = this.$refs.selectbox as HTMLInputElement;
      if (contentShown) {
        // clicked box when content shown. So then hide content
        this.boxBorder = inactiveGray;
        this.arrowColor = inactiveGray;
        this.arrowDirection = '';
        this.curQuery = this.prevQuery;
      } else {
        box.focus();
        this.prevQuery = this.curQuery;
        this.curQuery = '';
        this.boxBorder = yuxuanBlue;
        this.arrowColor = yuxuanBlue;
        this.arrowDirection = upsideDown;
      }

      // scroll the bottom of the graduation year dropdown to scrollBottomToElement
      if (!contentShown && this.scrollBottomToElement > 0) {
        this.$nextTick(() => {
          (this.$refs[`scroll-ref-${this.scrollBottomToElement}`] as Element).scrollIntoView({
            behavior: 'auto',
            block: 'nearest',
          });
        });
      }
    },
    closeDropdownIfOpen() {
      if (this.stopClose) {
        this.stopClose = false;
      } else if (this.shown) {
        this.shown = false;
        this.curQuery = this.prevQuery;
        this.boxBorder = inactiveGray;
        this.arrowColor = inactiveGray;
        this.arrowDirection = '';
      }
    },
    onSelect([acronym, name]: [string, string]) {
      const box = this.$refs.selectbox as HTMLInputElement;
      this.shown = false;
      this.arrowColor = inactiveGray;
      this.arrowDirection = '';
      this.boxBorder = inactiveGray;
      this.placeholderColor = lightPlaceholderGray;
      this.$emit('on-select', acronym);
      this.curQuery = name;
      this.prevQuery = name;
      box.blur();
    },
    matchSelected() {
      if (this.foundChoices.length > 0) {
        this.onSelect(this.foundChoices[0]);
      } else {
        this.curQuery = this.prevQuery;
      }
    },
    onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Enter') {
        this.matchSelected();
      }
    },
    onRemove() {
      this.placeholderColor = '';
      this.$emit('on-remove');
    },
  },
});
</script>

<style scoped lang="scss">
@import '@/components/Modals/Onboarding/Onboarding.scss';
</style>
