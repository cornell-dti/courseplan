<template>
  <teleport-modal
    content-class="content-collection"
    right-button-text="Done"
    :right-button-is-disabled="!isUniqueCollectionName"
    :show-close-button="false"
    :is-save-course-modal="true"
    @modal-closed="closeCurrentModal"
    @left-button-clicked="closeCurrentModal"
    @right-button-clicked="saveCourse"
  >
    <template #title>
      <div class="saveCourseModal-title">
        <img src="@/assets/images/saveIconBig.svg" alt="big saved icon" />
        <h1>{{ courseCode }} Saved</h1>
      </div>
    </template>

    <div class="saveCourseModal-divider-line"></div>
    <div class="saveCourseModal-header">
      <div class="saveCourseModal-header-text">
        <span> Collections </span>
        <button class="saveCourseModal-header-text-addButton" @click="addCollection">
          <img src="@/assets/images/plus.svg" alt="add new collection" />
        </button>
      </div>
    </div>
    <div
      v-if="isNumCollectionGreaterThanFour || (isDefaultCollection && !isEditing)"
      class="saveCourseModal-divider-line"
    ></div>

    <div :class="['saveCourseModal-body']">
      <div
        :class="[
          'saveCourseModal-body-content',
          {
            scrollable: isNumCollectionGreaterThanFour,
          },
        ]"
      >
        <div
          v-if="isDefaultCollection && !isEditing"
          class="saveCourseModal-body-content default-collection"
        >
          No collections added yet
        </div>
        <div v-else>
          <div
            v-for="(collection, index) in collections"
            :key="collection"
            class="saveCourseModal-body-content-collection"
          >
            <input
              v-if="!isDefaultCollection"
              type="checkbox"
              :id="'collection-' + index"
              :value="collection"
              v-model="checkedCollections"
            />
            <label :for="'collection-' + index" class="collection-label">
              <span v-if="!isEditing || (isEditing && currentEditingIndex !== index)">
                {{ collection }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="isEditing" class="saveCourseModal-body-bottom">
        <input type="checkbox" v-model="checkedCollections" id="new-collection" />
        <label for="new-collection" class="new-collection-label">
          <input
            ref="newCollectionInput"
            maxlength="30"
            v-model="newCollectionName"
            @keydown.enter="finishEditing"
            @blur="finishEditing"
            class="editable-input"
            placeholder="Add new collection"
          />
        </label>
      </div>
    </div>
    <div v-if="isNumCollectionGreaterThanFour" class="saveCourseModal-divider-line"></div>
  </teleport-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TeleportModal from '@/components/Modals/TeleportModal.vue';
import store from '@/store';

export default defineComponent({
  components: { TeleportModal },
  props: {
    courseCode: { type: String, required: true },
  },
  data() {
    return {
      checkedCollections: [] as string[],
      preSelectedCollections: [] as string[], // To keep track of initial selections
      newCollectionName: '', // Holds the name of the new collection before it is added
      isEditing: false,
      currentEditingIndex: -1,
    };
  },
  computed: {
    isUniqueCollectionName() {
      return !this.collections.includes(this.newCollectionName);
    },
    isDefaultCollection() {
      const collections = store.state.savedCourses.map(collection => collection.name);
      return collections.length === 1; // Note: the 'All' collection
    },
    collections() {
      const collections = store.state.savedCourses
        .map(collection => collection.name)
        .filter(collection => collection !== 'All');
      return collections.length === 0 ? [] : collections;
    },
    updateSelectedCollections() {
      // Get collections that already contain this.courseCode
      return store.state.savedCourses
        .filter(collection => collection.courses.some(course => course.code === this.courseCode))
        .map(collection => collection.name)
        .filter(collection => collection !== 'All');
    },
    placeholder_name() {
      const oldCollections = store.state.savedCourses.map(collection => collection.name);
      let newCollectionNum = 1;
      // eslint-disable-next-line no-loop-func
      while (oldCollections.find(p => p === `Collection ${newCollectionNum}`)) {
        newCollectionNum += 1;
      }
      return `Collection ${newCollectionNum}`;
    },
    isNumCollectionGreaterThanFour() {
      return store.state.savedCourses.length > 4;
    },
  },
  mounted() {
    this.checkedCollections = this.updateSelectedCollections;
    this.preSelectedCollections = [...this.checkedCollections]; // Store initial state
  },
  emits: {
    'close-save-course-modal': () => true,
    'save-course': (addedToCollections: string[], deletedFromCollections: string[]) =>
      typeof addedToCollections === 'object' && typeof deletedFromCollections === 'object',
    'add-collection': (name: string) => typeof name === 'string',
  },
  methods: {
    closeCurrentModal() {
      this.$emit('close-save-course-modal');
    },
    saveCourse() {
      // Determine which collections to add/remove based on initial selections
      const addedToCollections = this.checkedCollections.filter(
        collection => !this.preSelectedCollections.includes(collection)
      );
      const deletedFromCollections = this.preSelectedCollections.filter(
        collection => !this.checkedCollections.includes(collection)
      );

      // If no specific collections were selected, and no prevoius selections were removed, add to 'All'
      if (addedToCollections.length === 0 && deletedFromCollections.length === 0) {
        console.log('added to All');
        addedToCollections.push('All');
      }
      this.$emit('save-course', addedToCollections, deletedFromCollections);

      this.closeCurrentModal();
    },
    addCollection() {
      this.newCollectionName = this.placeholder_name;
      this.isEditing = true;
      this.currentEditingIndex = this.collections.length;

      // Delay to allow the DOM to update, then focus and select the text
      this.$nextTick(() => {
        const input = this.$refs.newCollectionInput as HTMLInputElement;
        input.focus();
        input.select();
      });
    },
    finishEditing() {
      if (this.newCollectionName.trim() && this.isUniqueCollectionName) {
        this.$emit('add-collection', this.newCollectionName.trim());
        this.newCollectionName = '';
      }
      this.isEditing = false;
      this.newCollectionName = '';
      this.currentEditingIndex = -1;
    },
  },
});
</script>

<style lang="scss">
@import '@/components/Modals/SaveCourseModal.scss';

.content-collection {
  width: 302px;
  height: 293px;
  margin-top: 8rem;
}

.modal {
  &--block {
    display: block;
  }
  &--flex {
    display: flex;
  }
}
</style>
