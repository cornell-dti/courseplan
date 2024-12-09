<template>
  <div
    v-click-outside="close"
    class="dropdown"
    :data-intro-group="dataIntroGroup"
    :data-intro="dataIntro"
    :data-disable-interaction="dataDisableInteraction"
    :data-step="dataStep"
    :data-tooltipClass="dataTooltipClass"
  >
    <button class="dropdown-button" data-cyId="dropdown-button" @click="toggle">
      <img class="dropdown-button--image" />
      <span class="dropdown-button--label">View</span>
    </button>
    <div v-if="open" class="dropdown-content">
      <view-dropdown-option
        alt="not compact"
        :selected="!compact"
        :image="defaultSem"
        label="Default"
        @click="$emit('click-compact', false)"
      />
      <view-dropdown-option
        alt="compact"
        :selected="compact"
        :image="compactSem"
        label="Compact"
        @click="$emit('click-compact', true)"
      />
      <div class="dropdown-content--hline" />
      <view-dropdown-option
        alt="order by newest"
        :selected="orderByNewest"
        :image="newestArrow"
        label="Newest"
        @click="onOrderClick(true)"
      />
      <view-dropdown-option
        alt="order by oldest"
        :selected="!orderByNewest"
        :image="oldestArrow"
        label="Oldest"
        @click="onOrderClick(false)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store';
import { setOrderByNewest } from '@/global-firestore-data/user-semesters';
import defaultSem from '@/assets/images/views/twoColumnSelected.svg';
import compactSem from '@/assets/images/views/fourColumnSelected.svg';
import newestArrow from '@/assets/images/views/newestArrow.svg';
import oldestArrow from '@/assets/images/views/oldestArrow.svg';
import { clickOutside } from '@/utilities';
import ViewDropdownOption from './ViewDropdownOption.vue';

const requiredStringProp = { type: String, reqiured: true, default: '' };

export default defineComponent({
  components: { ViewDropdownOption },
  props: {
    compact: { type: Boolean, required: true },
    dataIntroGroup: requiredStringProp,
    dataIntro: requiredStringProp,
    dataDisableInteraction: requiredStringProp,
    dataStep: requiredStringProp,
    dataTooltipClass: requiredStringProp,
  },
  data() {
    return {
      open: false,
      defaultSem,
      compactSem,
      newestArrow,
      oldestArrow,
    };
  },
  computed: {
    orderByNewest() {
      return store.state.orderByNewest;
    },
  },

  emits: {
    'click-compact': (value: boolean) => typeof value === 'boolean',
  },

  methods: {
    onOrderClick(orderByNewest: boolean) {
      setOrderByNewest(orderByNewest);
    },
    toggle() {
      this.open = !this.open;
    },
    close() {
      this.open = false;
    },
  },
  directives: {
    'click-outside': clickOutside,
  },
});
</script>

<style scoped lang="scss">
@import '@/assets/scss/_variables.scss';
.dropdown {
  z-index: 1;
  position: relative;
  float: right;
  &-button {
    border: none;
    display: flex;
    align-items: center;
    &--label {
      :hover > & {
        color: $viewLabelGray;
      }
      font-weight: 500;
      font-size: 19px;
      line-height: 19px;
      color: $medGray;
    }
    &--image {
      margin-right: 0.3rem;
      width: 1rem;
      content: url('@/assets/images/views/settings.svg');
      :hover > & {
        content: url('@/assets/images/views/settingsOnHover.svg');
      }
    }
  }
  &-content {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    border-radius: 8px;
    min-height: 2.5rem;
    min-width: 12rem;
    align-items: center;
    padding: 0.5rem 0rem;
    background-color: $white;
    border: 1px solid $borderGray;
    box-sizing: border-box;
    box-shadow: 0px 5px 8px 2px $boxShadowGray;
    border-radius: 4px;
    &--hline {
      width: calc(100% - 2rem);
      height: 0;
      border: 0.5px solid $hlineGray;
      margin: 0.5rem 0rem;
    }
  }
}
</style>
