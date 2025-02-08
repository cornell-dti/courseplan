<template>
  <main
    class="semesterView"
    data-cyId="semesterView"
    :class="{
      bottomBar: isBottomBar && isBottomBarExpanded,
      expandedBottomBarSemesterView: isBottomBarExpanded,
      collapsedBottomBarSemesterView: isBottomBar && !isBottomBarExpanded,
    }"
    @click="closeBar"
    :key="key"
  >
    <div class="semesterView-top">
      <new-semester-modal
        @add-semester="addSemester"
        @close-sem-modal="closeSemesterModal"
        v-if="isSemesterModalOpen"
      />
      <div class="semesterView-settings" :class="{ 'semesterView-settings--two': noSemesters }">
        <button
          v-if="noSemesters"
          class="semesterView-addSemesterButton"
          @click="openSemesterModal"
          data-cyId="semesterView-addSemesterButton"
        >
          + New Semester
        </button>
        <view-dropdown
          data-intro-group="req-tooltip"
          :data-intro="getToggleTooltipText()"
          data-disable-interaction="1"
          data-step="4"
          data-tooltipClass="tooltipCenter tourStep4"
          :compact="compact"
          @click-compact="toggleCompact"
        />
      </div>
      <confirmation :text="confirmationText" v-if="isSemesterConfirmationOpen" />
      <div class="semesterView-content" :class="{ 'semesterView-content--compact': compact }">
        <div
          v-for="(sem, semesterIndex) in semesters"
          :key="`${sem.year}-${sem.season}`"
          class="semesterView-wrapper"
        >
          <semester
            ref="semester"
            :season="sem.season"
            :year="sem.year"
            :courses="sem.courses"
            :semesterIndex="semesterIndex"
            :compact="compact"
            :activatedCourse="activatedCourse"
            :isFirstSem="checkIfFirstSem(sem)"
            @course-onclick="courseOnClick"
            @new-semester="openSemesterModal"
            @delete-semester="deleteSemester"
          />
        </div>
      </div>
    </div>
    <div class="semesterView-bot">
      <div class="semesterView-builtBy">
        Built with
        <img class="semesterView-heart" src="@/assets/images/redHeart.svg" alt="heart" />
        by
        <a target="_blank" href="https://www.cornelldti.org/projects/courseplan/">
          Cornell Digital Tech &amp; Innovation
        </a>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Semester from '@/components/Semester/Semester.vue';
import Confirmation from '@/components/Modals/Confirmation.vue';
import NewSemesterModal from '@/components/Modals/NewSemesterModal.vue';

import store from '@/store';
import { GTagEvent } from '@/gtag';
import { addSemester, deleteSemester } from '@/global-firestore-data';
import { closeBottomBar } from '@/components/BottomBar/BottomBarState';
import ViewDropdown from './ViewDropdown.vue';

export default defineComponent({
  components: { Confirmation, NewSemesterModal, Semester, ViewDropdown },
  props: {
    compact: { type: Boolean, required: true },
    isBottomBar: { type: Boolean, required: true },
    isBottomBarExpanded: { type: Boolean, required: true },
    isMobile: { type: Boolean, required: true },
    startTour: { type: Boolean, required: true },
  },
  emits: {
    'compact-updated': (compact: boolean) => typeof compact === 'boolean',
  },
  data() {
    return {
      confirmationText: '',
      key: 0,
      activatedCourse: {} as FirestoreSemesterCourse,
      isCourseClicked: false,
      isSemesterConfirmationOpen: false,
      isSemesterModalOpen: false,
    };
  },
  computed: {
    semesters(): readonly FirestoreSemester[] {
      if (store.state.plans.length === 0) {
        return [];
      }
      return store.getters.getCurrentPlanSemesters;
    },
    noSemesters(): boolean {
      return this.semesters.length === 0;
    },
  },
  methods: {
    checkIfFirstSem(semester: FirestoreSemester) {
      return (
        this.semesters[0].year === semester.year && this.semesters[0].season === semester.season
      );
    },
    toggleCompact(toggled: boolean) {
      if (toggled !== this.compact) {
        this.$emit('compact-updated', toggled);
        GTagEvent(this.$gtag, toggled ? 'to-compact' : 'to-not-compact');
      }
    },
    openSemesterConfirmationModal(season: FirestoreSemesterSeason, year: number, isAdd: boolean) {
      if (isAdd) {
        this.confirmationText = `Added ${season} ${year} to plan`;
      } else {
        this.confirmationText = `Deleted ${season} ${year} from plan`;
      }

      this.isSemesterConfirmationOpen = true;

      setTimeout(() => {
        this.isSemesterConfirmationOpen = false;
      }, 2000);
    },
    openSemesterModal() {
      this.isSemesterModalOpen = true;
    },
    closeSemesterModal() {
      this.isSemesterModalOpen = false;
    },
    addSemester(season: string, year: number) {
      addSemester(store.state.currentPlan, year, season as FirestoreSemesterSeason, this.$gtag);
      this.openSemesterConfirmationModal(season as FirestoreSemesterSeason, year, true);
    },
    deleteSemester(season: string, year: number) {
      deleteSemester(store.state.currentPlan, year, season as FirestoreSemesterSeason, this.$gtag);
      this.openSemesterConfirmationModal(season as FirestoreSemesterSeason, year, false);
    },
    courseOnClick(course: FirestoreSemesterCourse) {
      this.activatedCourse = course;
      this.key += 1;
      this.isCourseClicked = true;
    },
    closeBar() {
      if (!this.isCourseClicked) {
        closeBottomBar(this.$gtag);
      }
      this.isCourseClicked = false;
    },
    getToggleTooltipText() {
      return `<div class="introjs-tooltipTop"><div class="introjs-customTitle">Toggle between Views</div><div class="introjs-customProgress">4/4</div>
      </div><div class = "introjs-bodytext">View semesters and courses in full or compact mode.</div>`;
    },
  },
});
</script>

<style scoped lang="scss">
@import '@/assets/scss/_variables.scss';

.semesterView {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem 3rem 0;
  position: relative;
  overflow-y: auto;

  &-content {
    display: grid;
    justify-items: center;
    grid-template-columns: repeat(auto-fill, minmax(min($regular-semester-width, 100%), 1fr));
    column-gap: 0.5rem;
    margin: 0 -0.75rem;

    &--compact {
      grid-template-columns: repeat(auto-fill, minmax(min($compact-semester-width, 100%), 1fr));
    }
  }

  &-addSemesterButton {
    background: $sangBlue;
    border-radius: 3px;
    min-height: 2.5rem;
    min-width: 9rem;
    color: $white;
    border: none;
    font-size: 16px;
  }

  &-settings {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
    min-height: 2.25rem;
    align-items: center;

    &--two {
      justify-content: space-between;
    }
  }

  &-switch {
    display: flex;
    color: $medGray;
    align-items: center;
  }

  &-switchText {
    margin-right: 0.5rem;
    font-size: 16px;
    line-height: 19px;
  }

  &-switchImage {
    width: 2.25rem;
    height: 2.25rem;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: center;

    &:not(:last-child) {
      margin-right: 0.5rem;
    }
  }

  &-twoColumn {
    background-image: url('@/assets/images/views/twoColumn.svg');

    &:hover,
    &:focus,
    &:active,
    &--active {
      cursor: pointer;
      background-image: url('@/assets/images/views/twoColumnSelected.svg');
    }
  }

  &-fourColumn {
    background-image: url('@/assets/images/views/fourColumn.svg');

    &:hover,
    &:focus,
    &:active,
    &--active {
      cursor: pointer;
      background-image: url('@/assets/images/views/fourColumnSelected.svg');
    }
  }

  &-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
    padding: 0 0.25rem;
  }

  &-builtBy {
    color: $medGray;
    text-align: right;
    font-size: 15px;
    padding: 8px 10px;

    a {
      color: $medGray;

      &:hover {
        text-decoration: underline $medGray;
      }
    }
  }

  &-emoji-text {
    height: 14px;
  }

  &-heart {
    height: 18px;
  }
}

.collapsedBottomBarSemesterView {
  padding-bottom: 70px;
}

.bottomBar {
  padding-bottom: 350px;
}

@media only screen and (max-width: $medium-breakpoint) {
  .semesterView {
    margin-top: 5.5rem;
    margin-left: 2.5rem;
    margin-right: 1rem;

    &-switch {
      padding-right: 0.75rem;
    }

    &-content {
      width: 100%;
      justify-content: center;
      grid-template-columns: repeat(auto-fill, minmax(min($compact-semester-width, 100%), 1fr));
    }
  }
}

@media only screen and (max-width: $small-breakpoint) {
  .semesterView {
    margin-top: 5.5rem;
    margin-left: 0;
    margin-right: 0;

    &-content {
      margin: 0;
    }

    &-wrapper {
      flex: 1 1 auto;
      padding: 0 2rem;
    }
  }
}
</style>
