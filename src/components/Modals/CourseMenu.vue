<template>
  <div class="courseMenu">
    <div class="courseMenu-content">
      <div class="courseMenu-section" @click="openNoteModal">
        <div class="courseMenu-left">
          <img
            class="courseMenu-icon"
            src="@/assets/images/noteIconSmall.svg"
            alt="note course icon"
            width="12"
            height="11"
          />
          <span class="courseMenu-text">Note</span>
        </div>
      </div>
      <div
        class="courseMenu-section"
        v-if="saveCourseIconVisible"
        @click="openSaveCourseModal(courseObj.code)"
      >
        <div class="courseMenu-left">
          <img
            class="courseMenu-icon"
            src="@/assets/images/saveIconSmall.svg"
            alt="save course icon"
          />
          <span class="courseMenu-text">Save</span>
        </div>
      </div>
      <div
        class="courseMenu-section"
        @click="toggleDisplayEditCourseCredits"
        :class="{ 'is-active': displayEditCourseCredits }"
        v-if="getCreditRange && getCreditRange[0] != getCreditRange[1]"
      >
        <div class="courseMenu-left">
          <img
            class="courseMenu-icon"
            :class="{ 'courseMenu-icon--left': isLeft }"
            src="@/assets/images/edit-credits.svg"
            alt="edit course credits icon"
          />
          <span class="courseMenu-text">Edit Credits</span>
        </div>
        <img
          class="courseMenu-arrow"
          src="@/assets/images/downarrow.svg"
          alt="arrow to expand edit course credits"
        />
        <div
          v-if="displayEditCourseCredits"
          class="courseMenu-content courseMenu-editCredits courseMenu-centerCredits"
          :style="{ zIndex: zIndexEditCredits }"
        >
          <div
            v-for="credit in makeCreditArary()"
            :key="credit"
            class="courseMenu-section courseMenu-section--credits"
            @click="editCourseCredit(credit)"
          >
            <div class="courseMenu-left">
              <span class="courseMenu-text">{{ credit }}</span>
            </div>
          </div>
        </div>
      </div>
      <div
        class="courseMenu-section"
        @click="toggleDisplayColors"
        :class="{ 'is-active': displayColors }"
      >
        <div class="courseMenu-left">
          <img
            class="courseMenu-icon"
            src="@/assets/images/paint.svg"
            alt="edit course color paint icon"
          />
          <span class="courseMenu-text">Edit Color</span>
        </div>
        <img
          class="courseMenu-arrow"
          src="@/assets/images/downarrow.svg"
          alt="arrow to expand edit course color"
        />
        <div
          v-if="displayColors"
          class="courseMenu-content courseMenu-colors"
          :style="{ zIndex: zIndexColors }"
        >
          <button
            v-for="(color, index) in colors"
            :key="index"
            class="courseMenu-color full-opacity-on-hover"
            @click="openEditColorModal(color.hex)"
          >
            <div class="courseMenu-left">
              <div
                class="courseMenu-color--icon"
                :style="{ backgroundColor: color.hex }"
                @mouseover="setDisplayColorTooltip(true, color.text)"
                @mouseleave="setDisplayColorTooltip(false, color.text)"
              >
                <img
                  v-if="`#${courseColor}` === color.hex"
                  class="courseMenu-color--checkmark"
                  src="@/assets/images/checkmark-color.svg"
                  alt="color checkmark"
                />
              </div>
            </div>
            <div v-if="tooltipColor === color.text" class="courseMenu-color--tooltip">
              {{ color.text }}
            </div>
          </button>
        </div>
      </div>

      <button class="delete-button courseMenu-section full-opacity-on-hover" @click="deleteCourse">
        <div class="courseMenu-left">
          <img
            class="courseMenu-icon"
            src="@/assets/images/trash.svg"
            alt="delete course trashcan icon"
          />
          <span class="courseMenu-text">Delete</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { coursesColorSet } from '@/assets/constants/colors';

export default defineComponent({
  props: {
    courseObj: { type: Object as PropType<FirestoreSemesterCourse>, required: true },
    getCreditRange: {
      type: (Array as PropType<readonly number[]>) as PropType<readonly [number, number]>,
      required: true,
    },
    semesterIndex: { type: Number, required: true },
    isCompact: { type: Boolean, required: true },
    courseColor: { type: String, required: true },
  },
  data() {
    return {
      isLeft:
        (this.semesterIndex % 2 === 0 && !this.isCompact) ||
        (this.semesterIndex % 4 === 0 && this.isCompact) ||
        window.innerWidth < 1200,
      // TODO: better version for all breakpoints
      // isLeft: this.semId % numPerRow() === 0,
      colors: coursesColorSet,
      displayColors: false,
      displayEditCourseCredits: false,
      tooltipColor: '',
      zIndexColors: 1,
      zIndexEditCredits: 1,
      courseCode: '',
      saveCourseIconVisible: true,
    };
  },
  computed: {
    // TODO: implement this without DOM manipulation and with semID changing (right now, stays the same if a sem is added)
    numPerRow(): number {
      const itemWidth = 406; // width of a semester div
      const itemWidthCompact = 232; // width of a compact semester div in px

      const grid = document.getElementsByClassName('semesterView-content')[0];
      const gridStyle = window.getComputedStyle(grid);
      const gridWidth =
        grid.clientWidth - (parseFloat(gridStyle.paddingLeft) + parseFloat(gridStyle.paddingRight));

      let numPerRow = 0;
      if (this.isCompact) {
        numPerRow = Math.min(Math.floor(gridWidth / itemWidthCompact), 4);
      } else {
        numPerRow = Math.min(Math.floor(gridWidth / itemWidth), 2);
      }
      return numPerRow;
    },
  },
  emits: {
    'open-save-course-modal': (code: string) => typeof code === 'string',
    'delete-course': () => true,
    'open-edit-color-modal': (color: string) => typeof color === 'string',
    'edit-course-credit': (credit: number) => typeof credit === 'number',
    'open-note-modal': () => true,
  },
  methods: {
    toggleDisplayColors() {
      this.displayColors = !this.displayColors;
      if (this.displayColors) {
        this.zIndexColors = 3;
      } else {
        this.zIndexColors = 1;
      }
      this.displayEditCourseCredits = false;
    },
    toggleDisplayEditCourseCredits() {
      this.displayEditCourseCredits = !this.displayEditCourseCredits;
      if (this.displayEditCourseCredits) {
        this.zIndexEditCredits = 3;
      } else {
        this.zIndexEditCredits = 1;
      }
      this.displayColors = false;
    },
    openSaveCourseModal(courseCode: string) {
      this.courseCode = courseCode;
      this.$emit('open-save-course-modal', courseCode);
    },
    deleteCourse() {
      this.$emit('delete-course');
    },
    openEditColorModal(color: string) {
      this.$emit('open-edit-color-modal', color);
    },
    setDisplayColors(bool: boolean) {
      this.displayColors = bool;
      if (bool) {
        this.zIndexColors = 3;
        this.zIndexEditCredits = 1;
      } else {
        this.zIndexColors = 1;
      }
    },
    setDisplayColorTooltip(bool: boolean, color: string) {
      if (bool) {
        this.tooltipColor = color;
      } else {
        this.tooltipColor = '';
      }
    },
    setDisplayEditCourseCredits(bool: boolean) {
      this.displayEditCourseCredits = bool;
      if (bool) {
        this.zIndexEditCredits = 3;
        this.zIndexColors = 1;
      } else {
        this.zIndexEditCredits = 1;
      }
    },
    editCourseCredit(credit: number) {
      this.$emit('edit-course-credit', credit);
    },
    makeCreditArary() {
      const creditArray: number[] = [];
      let accu = this.getCreditRange[0] < 1 ? 0 : this.getCreditRange[0] - 1;

      for (let i = accu; i < this.getCreditRange[1]; i += 1) {
        if (this.getCreditRange[0] < 1) {
          accu += 0.5;
          creditArray.push(accu);
          accu += 0.5;
          creditArray.push(accu);
        } else {
          accu += 1;
          creditArray.push(accu);
        }
      }
      return creditArray;
    },
    openNoteModal() {
      this.$emit('open-note-modal');
    },
  },
});
</script>

<style scoped lang="scss">
@import '@/assets/scss/_variables.scss';
.delete-button .courseMenu-text {
  color: #eb6d6d;
}
.courseMenu {
  position: absolute;
  right: -3rem;
  top: 2rem;
  z-index: 1000;

  &-content {
    background: $white;
    border: 1px solid $lightGray;
    box-sizing: border-box;
    border-radius: 9px;
    font-size: 14px;
    color: #404040;
    width: 9rem;
  }

  &-section {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    position: relative;
    cursor: pointer;
    width: 100%;
    &:hover,
    &:active,
    &.is-active,
    &:focus {
      background-color: rgba(50, 160, 242, 0.15);
    }

    &:first-child:not(.courseMenu-editCredits > &),
    &:only-child {
      border-top-left-radius: 9px;
      border-top-right-radius: 9px;
    }

    &:last-child {
      border-bottom-left-radius: 9px;
      border-bottom-right-radius: 9px;
    }

    &--credits {
      padding-left: 0;
      padding-right: 0;
      width: 100%;
      display: flex;
      justify-content: center;
    }

    &--left {
      padding-left: 2.25rem;
    }
  }

  &-left {
    display: flex;
    align-items: center;
  }

  &-icon {
    margin-right: 0.75rem;

    &--left {
      margin-right: 0.75rem;
    }
  }

  &-color {
    padding: 0px 3px 10px 3px;

    &--icon {
      width: 16px;
      height: 16px;
      border-radius: 2px;
      &:hover {
        box-shadow: 0px 0px 2px black;
      }
    }

    &--checkmark {
      padding-top: 4px;
      padding-bottom: 13px;
    }

    &--tooltip {
      position: absolute;
      background-color: white;
      box-shadow: 0px 0px 2px black;
      padding: 0px 8px 0px 8px;
    }
  }

  &-colors {
    position: absolute;
    padding: 10px 5px 0px 5px;
    top: 100%;
    z-index: 1;
    width: calc(100% + 0.081rem);
    left: -0.031rem;
    border-radius: 0 0 9px 9px;
    border-top: none;
    box-sizing: border-box;
  }

  &-editCredits {
    position: absolute;
    top: 100%;
    width: calc(100% + 0.081rem);
    left: -0.031rem;
    padding: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    z-index: 1;
    border-radius: 0 0 9px 9px;
    border-top: none;
    box-sizing: border-box;
  }
}

@media only screen and (max-width: $medium-breakpoint) {
  .courseMenu {
    right: -1rem;

    &-arrow {
      display: none;
    }
    &-colors {
      right: 0rem;
      left: 0rem;
    }
  }
}
</style>
