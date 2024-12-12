<template>
  <div class="requirementheader">
    <h1 class="top header-title">Collections</h1>
    <div class="collection">
      <drop-down-arrow class="collection-dropdown" :fillColor="darkGray" />
      <div class="collection-name">All</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DropDownArrow from '@/components/DropDownArrow.vue';

export default defineComponent({
  components: { DropDownArrow },
  props: {},
});
</script>

<style scoped lang="scss">
@import '@/assets/scss/_variables.scss';

.top {
  margin: 1.5rem 0 1rem 0;

  &-small {
    margin: 0px;
  }
}

.header-title {
  color: $darkGray;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.collection-name {
  display: inline-block;
  position: relative;
  left: 0.5rem;
  color: $darkGray;
}
</style>
