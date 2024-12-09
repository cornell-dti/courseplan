<template>
  <div class="course-container" :class="{ 'figma-shake': isShaking }">
    <div
      :class="{
        'course--min': compact,
        conflict: isCourseConflict(courseObj.uniqueID),
        active: active,
      }"
      class="course"
      :id="`course-${courseObj.uniqueID}`"
    >
      <save-course-modal
        :courseCode="courseCode"
        @close-save-course-modal="closeSaveCourseModal"
        @save-course="saveCourse"
        @add-collection="addCollection"
        v-if="isSaveCourseOpen"
      />
      <edit-color
        :editedColor="editedColor"
        @color-course="colorCourse"
        @color-subject="colorSubject"
        @close-edit-color="closeEditColorModal"
        v-if="isEditColorOpen"
      />
      <div
        class="course-color"
        :style="cssVars"
        :class="{
          'course-color--active': active,
        }"
      >
        <img src="@/assets/images/dots/sixDots.svg" alt="" />
      </div>
      <div class="course-content" @click="courseOnClick()">
        <div class="course-main">
          <div class="course-top">
            <div class="course-left">
              <div
                class="course-code"
                data-cyId="courseCode"
                :style="{
                  color: compact ? '#3d3d3d' : '#858585',
                }"
              >
                {{ courseObj.code }}
              </div>
              <course-caution
                v-if="!isReqCourse && compact"
                :course="courseObj"
                :isCompactView="true"
              />
            </div>
            <button
              v-if="!isReqCourse && isSemesterCourseCard"
              class="course-dotRow"
              @click="openMenu"
            >
              <img src="@/assets/images/dots/threeDots.svg" alt="open menu for course card" />
            </button>
            <button
              v-else-if="!isReqCourse && !isSemesterCourseCard"
              class="course-trash"
              @click.stop="deleteCourseFromCollection"
              @mouseover="hoverTrashIcon"
              @mouseleave="unhoverTrashIcon"
            >
              <img :src="trashIcon" alt="delete course from collection" />
            </button>
          </div>
          <div v-if="!compact" class="course-name">{{ courseObj.name }}</div>
          <div v-if="!compact" class="course-info">
            <span class="course-credits">{{ creditString }}</span>
            <span v-if="semesterString" class="course-semesters">{{ semesterString }}</span>
            <course-caution
              v-if="!isReqCourse && !isSchedGenCourse"
              :course="courseObj"
              :isCompactView="false"
            />
          </div>
        </div>
      </div>
      <course-menu
        v-if="menuOpen"
        :courseObj="courseObj"
        :semesterIndex="semesterIndex"
        :isCompact="compact"
        :courseColor="courseObj.color"
        :courseCode="courseObj.code"
        @open-note-modal="openNoteModal"
        @open-edit-color-modal="openEditColorModal"
        @delete-course="deleteCourse"
        @edit-course-credit="editCourseCredit"
        @open-save-course-modal="openSaveCourseModal"
        :getCreditRange="getCreditRange || []"
        v-click-outside="closeMenuIfOpen"
      />
    </div>
    <Note
      v-if="isNoteVisible"
      class="note"
      :initialTranslateY="'-67px'"
      :expandedTranslateY="'-35px'"
      :width="'calc(102.8% - 10px)'"
      :color="cssVars['--bg-color']"
      :initialNote="courseObj.note || ''"
      :lastUpdated="courseObj.lastUpdated"
      @save-note="saveNote"
      @open-delete-note-modal="openDeleteNoteModal"
      ref="note"
      v-click-outside="handleClickOutsideNote"
    />
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import CourseMenu from '@/components/Modals/CourseMenu.vue';
import CourseCaution from '@/components/Course/CourseCaution.vue';
import SaveCourseModal from '@/components/Modals/SaveCourseModal.vue';
import {
  addCourseToBottomBar,
  reportCourseColorChange,
  reportSubjectColorChange,
} from '@/components/BottomBar/BottomBarState';
import { isCourseConflict } from '@/store';
import { clickOutside } from '@/utilities';
import EditColor from '../Modals/EditColor.vue';
import trashGrayIcon from '@/assets/images/trash-gray.svg';
import trashRedIcon from '@/assets/images/trash.svg';
import Note from '../Notes/Note.vue';

// MinimalNoteComponent is a representation of everything required for a functional,
// but minimal Note component to work statefully.
interface MinimalNoteComponent {
  note: string;
  isDirty: boolean;
  isExpanded: boolean;
  collapseNote: () => void;
  expandNote: () => void;
}

export default defineComponent({
  name: 'Course',
  components: { CourseCaution, CourseMenu, EditColor, SaveCourseModal, Note },
  props: {
    courseObj: { type: Object as PropType<FirestoreSemesterCourse>, required: true },
    compact: { type: Boolean, required: true },
    active: { type: Boolean, required: true },
    isReqCourse: { type: Boolean, required: true },
    semesterIndex: { type: Number, required: false, default: 0 },
    season: { type: String, required: false, default: '' },
    year: { type: Number, required: false, default: 0 },
    isSemesterCourseCard: { type: Boolean, required: true },
    isSchedGenCourse: { type: Boolean, required: false, default: false },
  },
  emits: {
    'delete-course': (code: string, uniqueID: number) =>
      typeof code === 'string' && typeof uniqueID === 'number',
    'color-course': (color: string, uniqueID: number, code: string) =>
      typeof color === 'string' && typeof uniqueID === 'number' && typeof code === 'string',
    'color-subject': (color: string, code: string) =>
      typeof color === 'string' && typeof code === 'string',
    'course-on-click': (course: FirestoreSemesterCourse) => typeof course === 'object',
    'edit-course-credit': (credit: number, uniqueID: number) =>
      typeof credit === 'number' && typeof uniqueID === 'number',
    'save-course': (
      course: FirestoreSemesterCourse,
      addedToCollections: string[],
      deletedFromCollection: string[]
    ) =>
      typeof course === 'object' &&
      typeof addedToCollections === 'object' &&
      typeof deletedFromCollection === 'object',
    'add-collection': (name: string) => typeof name === 'string',
    'delete-course-from-collection': (courseCode: string) => typeof courseCode === 'string',
    'save-note': (uniqueID: number, note: string) =>
      typeof uniqueID === 'number' && typeof note === 'string',
    'open-delete-note-modal': (uniqueID: number) => typeof uniqueID === 'number',
  },
  data() {
    return {
      menuOpen: false,
      stopCloseFlag: false,
      getCreditRange: this.courseObj.creditRange,
      isEditColorOpen: false,
      isSaveCourseOpen: false,
      editedColor: '',
      deletingCourse: false,
      trashIcon: trashGrayIcon, // Default icon
      courseCode: '',
      isExpanded: false,
      // isNotVisible represents a small open 'portrusion' indicating that there is a note
      // for the course in question. The note itself will not be visible without `isExpanded`
      // being true as well.
      isNoteVisible: Boolean(this.courseObj.note),
      isShaking: false,
    };
  },
  computed: {
    semesterString(): string {
      let semesterString = '';
      this.courseObj.semesters.forEach(semester => {
        semesterString += `${semester}, `;
      });
      if (semesterString.length > 0) {
        return semesterString.substring(0, semesterString.length - 2);
      }

      return semesterString;
    },

    creditString(): string {
      if (this.courseObj.credits === 1) {
        return `${this.courseObj.credits} credit`;
      }
      return `${this.courseObj.credits} credits`;
    },

    cssVars(): Record<string, string> {
      return {
        '--bg-color': `#${this.courseObj.color}`,
      };
    },
  },
  methods: {
    openMenu() {
      this.stopCloseFlag = true;
      this.menuOpen = true;
    },
    closeMenuIfOpen() {
      if (this.stopCloseFlag) {
        this.stopCloseFlag = false;
      } else if (this.menuOpen) {
        this.menuOpen = false;
      }
    },
    openSaveCourseModal(courseCode: string) {
      this.courseCode = courseCode;
      this.isSaveCourseOpen = true;
      this.closeMenuIfOpen();
    },
    closeSaveCourseModal() {
      this.isSaveCourseOpen = false;
    },
    deleteCourse() {
      this.$emit('delete-course', this.courseObj.code, this.courseObj.uniqueID);
      this.closeMenuIfOpen();
    },
    deleteCourseFromCollection() {
      this.$emit('delete-course-from-collection', this.courseObj.code);
    },
    openEditColorModal(color: string) {
      this.editedColor = color;
      this.isEditColorOpen = true;
    },
    closeEditColorModal() {
      this.isEditColorOpen = false;
    },
    addCollection(name: string) {
      this.$emit('add-collection', name);
    },
    saveCourse(addedToCollections: string[], deletedFromCollections: string[]) {
      const course = { ...this.courseObj };
      this.$emit('save-course', course, addedToCollections, deletedFromCollections);
    },
    colorCourse(color: string) {
      this.$emit('color-course', color, this.courseObj.uniqueID, this.courseObj.code);
      reportCourseColorChange(this.courseObj.uniqueID, color);
      this.closeMenuIfOpen();
    },
    colorSubject(color: string) {
      this.$emit('color-subject', color, this.courseObj.code);
      reportSubjectColorChange(this.courseObj.code, color);
      this.closeMenuIfOpen();
    },
    courseOnClick() {
      if (!this.menuOpen && !this.deletingCourse) {
        this.$emit('course-on-click', this.courseObj);
        addCourseToBottomBar(this.courseObj, this.season, this.year);
      }
    },
    editCourseCredit(credit: number) {
      this.$emit('edit-course-credit', credit, this.courseObj.uniqueID);
      this.closeMenuIfOpen();
    },
    isCourseConflict,
    hoverTrashIcon() {
      this.trashIcon = trashRedIcon;
    },
    unhoverTrashIcon() {
      this.trashIcon = trashGrayIcon;
    },
    openNoteModal() {
      if (!this.isNoteVisible) {
        this.isNoteVisible = true;
        this.menuOpen = false;
        // NOTE: should use $nextTick, as the browser engine could optimize away the
        // UI update by applying changes in the same render pass. Also important for allowing
        // for time for the note component to be rendered before attempting to access it.
        this.$nextTick(() => {
          const noteComponent = this.$refs.note as MinimalNoteComponent | undefined;
          if (noteComponent) {
            noteComponent.expandNote();
          }
        });
      } else {
        const noteComponent = this.$refs.note as MinimalNoteComponent | undefined;
        if (!noteComponent) {
          return;
        }
        // Note already open — trigger a shake to indicate this to the user.
        if (noteComponent.isExpanded) {
          this.triggerCourseCardShake();
        } else {
          noteComponent.expandNote();
        }
      }
      this.menuOpen = false;
    },
    closeNote() {
      // NOTE: this function hides the note entirely!
      // Grant time for the slide-back-in animation to play out.
      setTimeout(() => {
        this.isNoteVisible = false;
      }, 300);
    },
    triggerCourseCardShake() {
      this.isShaking = true;
      setTimeout(() => {
        this.isShaking = false;
      }, 900); // 3 shakes * 0.3s = 0.9s
    },
    saveNote(note: string) {
      if (!note || note === this.courseObj.note) {
        return;
      }
      this.$emit('save-note', this.courseObj.uniqueID, note);
    },
    handleClickOutsideNote(event: MouseEvent) {
      // Don't count a click on the open note (.courseMenu) or three dots (.course-dotRow)
      // as a click outside.
      const target = event.target as HTMLElement;
      if (target.closest('.courseMenu') || target.closest('.course-dotRow')) {
        return;
      }

      const noteComponent = this.$refs.note as MinimalNoteComponent | undefined;

      if (!noteComponent || !this.isNoteVisible) {
        return;
      }

      if (noteComponent.isDirty) {
        // Warn if the user is trying to leave a note with unsaved changes.
        this.triggerCourseCardShake();
      } else if (noteComponent.note && this.isNoteVisible) {
        noteComponent.collapseNote();
      } else {
        this.closeNote();
      }
    },
    openDeleteNoteModal() {
      this.$emit('open-delete-note-modal', this.courseObj.uniqueID);
    },
  },
  directives: {
    'click-outside': clickOutside,
  },
  watch: {
    // NOTE: this is required for reactive deletion of notes client-side after the deletion
    // modal is confirmed, as isNoteVisible is not reactive.
    'courseObj.note': {
      handler(newNote) {
        if (!newNote) {
          this.isNoteVisible = false;
        }
      },
      immediate: true,
    },
  },
});
</script>

<style scoped lang="scss">
@import '@/assets/scss/_variables.scss';

.course-container {
  position: relative;
  padding-bottom: 20px;
}

// Emulates a slight side-to-side sway à la Figma micro-interaction.
.figma-shake {
  animation: tilt-shaking 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) 3;
  transform-origin: center center;
}

@keyframes tilt-shaking {
  0% {
    transform: rotate(0deg) translateX(0);
  }
  25% {
    transform: rotate(4deg) translateX(6px);
  }
  50% {
    transform: rotate(0deg) translateX(0);
  }
  75% {
    transform: rotate(-4deg) translateX(-6px);
  }
  100% {
    transform: rotate(0deg) translateX(0);
  }
}

.course {
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.055);
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: row;
  background-color: $white;
  height: 5.625rem;
  cursor: grab;

  &:hover {
    background: $white;
  }

  &:active:hover {
    touch-action: none;
    cursor: grabbing;
  }
  &--min {
    height: 2.125rem;

    & .course-content {
      padding: 0 0.5em;
    }
  }

  &-main {
    width: 100%;
  }

  &-color {
    width: $colored-grabber-width;
    border-radius: 0.42rem 0 0 0.42rem;
    background-color: var(--bg-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-dotRow {
    padding: 8px 0;
    display: flex;
    position: relative;

    &:hover,
    &:active,
    &:focus {
      cursor: pointer;
    }
  }

  &-trash {
    padding: 8px 0;
    display: flex;
    position: relative;

    &:hover,
    &:active,
    &:focus {
      cursor: pointer;
    }
  }

  &-content {
    width: calc(100% - #{$colored-grabber-width});
    padding: 0 1rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  &-left {
    display: flex;
    align-items: center;
  }

  &-top {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  &-code {
    font-size: 14px;
    line-height: 17px;
    color: $primaryGray;
  }

  &-name {
    font-size: 16px;
    font-weight: bold;
    line-height: 19px;
    color: $primaryGray;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-info {
    font-size: 14px;
    line-height: 17px;
    color: $lightPlaceholderGray;
    display: flex;
    align-items: center;
  }
  port &-credits {
    white-space: nowrap;
  }

  &-semesters {
    margin-left: 0.2rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    &:before {
      margin-right: 0.2rem;
      font-style: normal;
      content: '|';
    }
  }

  &-buttons {
    display: flex;
    justify-content: space-around;
    margin: 0.5rem;
  }
}

.conflict {
  border: 1px solid rgba($conflictWarning, 0.5);
  border-radius: 8px;
  box-shadow: 1px 1px 5px rgba($conflictWarning, 0.5);
}

.active {
  border: 1px solid $yuxuanBlue;
}
.rectangle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(-65px);
  width: calc(106% - #{$colored-grabber-width});
  height: 80px;
  background-color: #a8e6cf;
  border-radius: 12.49px;
  cursor: pointer;
  z-index: 0;
  transition: transform 0.3s ease;
}

.rectangle.expanded {
  transform: translateX(-50%) translateY(0px);
}
</style>
