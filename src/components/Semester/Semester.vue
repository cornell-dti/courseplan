<template>
  <div
    class="semester"
    :class="{
      'semester--compact': compact,
    }"
    data-intro-group="pageTour"
    data-step="3"
    :data-intro="walkthroughText()"
    data-disable-interaction="1"
    data-tooltipClass="tooltipCenter tourStep3"
  >
    <new-course-modal
      @close-course-modal="closeCourseModal"
      @select-course="selectCourse"
      v-if="isCourseModalOpen"
      @add-course="addCourse"
    />
    <course-conflict-modal
      @close-course-modal="closeConflictModal"
      v-if="isConflictModalOpen"
      :selectedCourse="conflictCourse"
      :courseConflicts="courseConflicts"
      :selfCheckRequirements="selfCheckRequirements"
      @resolve-conflicts="handleConflictsResolved"
      @remove-course="deleteCourseWithoutModal"
    />
    <confirmation :text="confirmationText" v-if="isConfirmationOpen" />
    <delete-semester
      @delete-semester="deleteSemester"
      @close-delete-sem="closeDeleteSemesterModal"
      :deleteSemSeason="season"
      :deleteSemYear="year"
      v-if="isDeleteSemesterOpen"
    />
    <edit-semester
      @edit-semester="editSemester"
      @close-edit-sem="closeEditSemesterModal"
      :deleteSemSeason="season"
      :deleteSemYear="year"
      v-if="isEditSemesterOpen"
    />
    <clear-semester
      @clear-semester="clearSemester"
      @close-clear-sem="closeClearSemesterModal"
      v-if="isClearSemesterOpen"
    />
    <delete-note-modal
      @delete-note="deleteNote"
      @close-delete-note="closeDeleteNoteModal"
      v-if="isDeleteNoteOpen && noteCourseUniqueID !== undefined"
      :noteCourseUniqueID="noteCourseUniqueID"
    />
    <button
      v-if="isFirstSem"
      class="semester-addSemesterButton"
      @click="openSemesterModal"
      data-cyId="semester-addSemesterButton"
    >
      + New Semester
    </button>
    <div class="semester-content">
      <div class="semester-top" :class="{ 'semester-top--compact': compact }">
        <div class="semester-left" :class="{ 'semester-left--compact': compact }">
          <span class="semester-name" data-cyId="semesterName"
            ><img class="season-emoji" :src="seasonImg[season]" alt="" /> {{ season }}
            {{ year }}</span
          >
          <span class="semester-credits">{{ creditString }}</span>
        </div>
        <div class="semester-right" :class="{ 'semester-right--compact': compact }">
          <button class="semester-minimize" @click="minimizeSemester" data-cyId="minimizeSemester">
            <img
              v-if="!isSemesterMinimized"
              src="@/assets/images/minimize.svg"
              alt="minimze semester"
            />
            <img v-else src="@/assets/images/expand.svg" alt="expand semester" />
          </button>
          <button class="semester-dotRow" @click="openSemesterMenu" data-cyId="semesterMenu">
            <img src="@/assets/images/dots/threeDots.svg" alt="open menu for semester" />
          </button>
        </div>
      </div>
      <div
        class="semester-courses"
        :class="{ 'semester-hidden': isSemesterMinimized }"
        data-cyId="semester-courses"
      >
        <draggable
          ref="droppable"
          class="draggable-semester-courses"
          group="draggable-semester-courses"
          v-model="coursesForDraggable"
          item-key="uniqueID"
          :componentData="{ style: { height: courseContainerHeight + 'rem' } }"
          @start="onDragStart"
          @sort="onDropped"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <div class="semester-courseWrapper">
              <course
                v-if="!isPlaceholderCourse(element)"
                :courseObj="element"
                :year="year"
                :season="season"
                :isReqCourse="false"
                :compact="compact"
                :active="activatedCourse.uniqueID === element.uniqueID"
                :isSemesterCourseCard="true"
                class="semester-course"
                data-cyId="semester-course"
                :semesterIndex="semesterIndex + 1"
                @delete-course="deleteCourse"
                @color-course="colorCourse"
                @color-subject="colorSubject"
                @course-on-click="courseOnClick"
                @edit-course-credit="editCourseCredit"
                @save-course="saveCourse"
                @save-note="saveNote"
                @add-collection="addCollection"
                @edit-collection="editCollection"
                @open-delete-note-modal="openDeleteNoteModal"
                @note-state-change="handleNoteStateChange"
              />
              <placeholder
                v-else
                :compact="compact"
                :semesterIndex="semesterIndex + 1"
                :placeholderObj="element"
              />
            </div>
          </template>
        </draggable>
        <add-course-button
          :compact="compact"
          @click="openCourseModal"
          data-cyId="semester-addCourse"
        />
      </div>
    </div>
    <semester-menu
      v-if="semesterMenuOpen"
      class="semester-menu"
      :isOpenModal="isDeleteSemesterOpen || isEditSemesterOpen || isClearSemesterOpen"
      @open-delete-semester-modal="openDeleteSemesterModal"
      @open-edit-semester-modal="openEditSemesterModal"
      @open-clear-semester-modal="openClearSemesterModal"
      v-click-outside="closeSemesterMenuIfOpen"
    />
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import draggable from 'vuedraggable';
import { Timestamp } from 'firebase/firestore';
import Course from '@/components/Course/Course.vue';
import Placeholder from '@/components/Course/Placeholder.vue';
import NewCourseModal from '@/components/Modals/NewCourse/NewCourseModal.vue';
import CourseConflictModal from '@/components/Modals/NewCourse/CourseConflictModal.vue';
import DeleteNoteModal from '@/components/Modals/DeleteNoteModal.vue';
import Confirmation from '@/components/Modals/Confirmation.vue';
import SemesterMenu from '@/components/Modals/SemesterMenu.vue';
import DeleteSemester from '@/components/Modals/DeleteSemester.vue';
import EditSemester from '@/components/Modals/EditSemester.vue';
import ClearSemester from '@/components/Modals/ClearSemester.vue';
import AddCourseButton from '@/components/AddCourseButton.vue';

import { clickOutside, isPlaceholderCourse } from '@/utilities';

import fall from '@/assets/images/fallEmoji.svg';
import spring from '@/assets/images/springEmoji.svg';
import winter from '@/assets/images/winterEmoji.svg';
import summer from '@/assets/images/summerEmoji.svg';
import {
  cornellCourseRosterCourseToFirebaseSemesterCourseWithGlobalData,
  editSemester,
  editSemesters,
  addCourseToSemester,
  deleteCourseFromSemester,
  deleteAllCoursesFromSemester,
  updateRequirementChoices,
  addCollection,
  addCourseToCollections,
  editCollection,
  editDefaultCollection,
  deleteCourseFromCollection,
} from '@/global-firestore-data';
import store, { updateSubjectColorData } from '@/store';
import {
  getRelatedRequirementIdsForCourseOptOut,
  getRelatedUnfulfilledRequirements,
} from '@/requirements/requirement-frontend-utils';

import featureFlagCheckers from '@/feature-flags';

type ComponentRef = { $el: HTMLDivElement };

export default defineComponent({
  components: {
    draggable,
    AddCourseButton,
    Confirmation,
    Course,
    DeleteSemester,
    EditSemester,
    ClearSemester,
    NewCourseModal,
    CourseConflictModal,
    DeleteNoteModal,
    SemesterMenu,
    Placeholder,
  },
  data() {
    return {
      confirmationText: '',
      isConfirmationOpen: false,
      scrollable: true,
      semesterMenuOpen: false,
      stopCloseFlag: false,

      isDeleteSemesterOpen: false,
      isEditSemesterOpen: false,
      isClearSemesterOpen: false,
      // Keep track of how many levels has a card enters in the droppable zone.
      // Inspired by https://stackoverflow.com/a/21002544
      isShadowCounter: 0,
      isDraggedFrom: false,
      isCourseModalOpen: false,
      isConflictModalOpen: false,
      isSemesterMinimized: false,
      conflictCourse: {} as FirestoreSemesterCourse,
      courseConflicts: new Set<string[]>(),
      selfCheckRequirements: [] as readonly RequirementWithIDSourceType[],
      isDeleteNoteOpen: false,
      noteCourseUniqueID: undefined as number | undefined,

      seasonImg: {
        Fall: fall,
        Spring: spring,
        Winter: winter,
        Summer: summer,
      },
      expandedNotes: new Map<number, boolean>(), // Track expanded state of notes by course uniqueID
      isNoteTransitioning: false,
    };
  },
  props: {
    semesterIndex: { type: Number, required: true },
    season: {
      type: String as PropType<FirestoreSemesterSeason>,
      required: true,
    },
    year: { type: Number, required: true },
    courses: {
      type: Array as PropType<readonly (FirestoreSemesterCourse | FirestoreSemesterPlaceholder)[]>,
      required: true,
    },
    compact: { type: Boolean, required: true },
    activatedCourse: {
      type: Object as PropType<FirestoreSemesterCourse>,
      required: true,
    },
    isFirstSem: { type: Boolean, required: true },
  },
  emits: {
    'new-semester': () => true,
    'course-onclick': (course: FirestoreSemesterCourse) => typeof course === 'object',
    'delete-semester': (season: string, year: number) =>
      typeof season === 'string' && typeof year === 'number',
  },
  mounted() {
    this.$el.addEventListener('touchmove', this.dragListener, {
      passive: false,
    });
    const droppable = (this.$refs.droppable as ComponentRef).$el;
    droppable.addEventListener('dragenter', this.onDragEnter);
    droppable.addEventListener('dragleave', this.onDragExit);
    const savedSemesterMinimize = localStorage.getItem(JSON.stringify(this.semesterIndex));
    this.isSemesterMinimized = savedSemesterMinimize ? JSON.parse(savedSemesterMinimize) : false;
  },
  beforeUnmount() {
    this.$el.removeEventListener('touchmove', this.dragListener);
    const droppable = (this.$refs.droppable as ComponentRef).$el;
    droppable.removeEventListener('dragenter', this.onDragEnter);
    droppable.removeEventListener('dragleave', this.onDragExit);
  },

  computed: {
    coursesForDraggable: {
      get(): readonly (FirestoreSemesterCourse | FirestoreSemesterPlaceholder)[] {
        return this.courses;
      },
      /**
       * This function is called when a course is dragged into the semester.
       *
       * It can be a semester-to-semester drag-n-drop, which does not have `requirementID`
       * and does not require update the requirement.
       * It can also be a requirement-bar-to-semester drag-n-drop, which has a `requirementID`
       * attached to the course. We need to check the presence of this field and update requirement
       * choice accordingly.
       */
      set(newCourses: readonly AppFirestoreSemesterCourseWithRequirementID[]) {
        const courses = newCourses.map(({ requirementID: _, ...rest }) => rest);
        editSemester(
          store.state.currentPlan,
          this.year,
          this.season,
          (semester: FirestoreSemester): FirestoreSemester => ({
            ...semester,
            courses,
          })
        );
        updateRequirementChoices(oldChoices => {
          const choices = { ...oldChoices };
          newCourses.forEach(({ uniqueID, requirementID, crseId }) => {
            if (requirementID == null) {
              // In this case, it's not a course from requirement bar
              return;
            }
            const choice = choices[uniqueID] || {
              arbitraryOptIn: {},
              acknowledgedCheckerWarningOptIn: [],
              optOut: [],
            };
            // We know the requirement must be dragged from requirements without warnings,
            // because only those courses provide suggested courses.
            // As a result, `acknowledgedCheckerWarningOptIn` is irrelevant and we only need to update
            // the `optOut` field.
            // Below, we find all the requirements it can possibly match,
            // and only remove the requirementID since that's the one we should keep.
            const optOut = getRelatedRequirementIdsForCourseOptOut(
              crseId,
              requirementID,
              store.state.groupedRequirementFulfillmentReport,
              store.state.toggleableRequirementChoices,
              store.state.userRequirementsMap
            );
            choices[uniqueID] = { ...choice, optOut };
          });
          return choices;
        });
      },
    },
    // Add space for a course if there is a "shadow" of it, decrease if it is from the current sem
    courseContainerHeight(): number {
      let factor = 6.1;
      let extraIncrementer = 0;
      if (this.isShadowCounter > 0) {
        extraIncrementer += 1;
      }
      if (this.isDraggedFrom) {
        extraIncrementer -= 1;
      }
      if (this.compact) {
        factor = 2.6;
      }

      // Add extra height for courses with visible notes
      const extraNoteHeight = this.courses.reduce((acc, course) => {
        if (!isPlaceholderCourse(course) && course.note) {
          const isExpanded = this.expandedNotes.get(course.uniqueID);
          if (isExpanded) {
            return acc + 3.5; // Expanded note height
          }
          return acc + 1.0; // Collapsed but visible note height
        }
        return acc;
      }, 0);

      return (this.courses.length + 1 + extraIncrementer) * factor + extraNoteHeight;
    },
    creditString() {
      let credits = 0;
      this.courses.forEach(course => {
        if (!isPlaceholderCourse(course)) {
          credits += course.credits;
        }
      });
      if (credits === 1) {
        return `${credits.toString()} credit`;
      }
      return `${credits.toString()} credits`;
    },
    handleRequirementConflicts(): boolean {
      return featureFlagCheckers.isRequirementConflictsEnabled();
    },
  },
  methods: {
    isPlaceholderCourse,
    onDragStart() {
      this.isDraggedFrom = true;
      this.scrollable = true;
      this.isShadowCounter = 0;
    },
    onDragEnter() {
      this.isShadowCounter += 1;
    },
    onDragExit() {
      this.isShadowCounter -= 1;
    },
    onDropped() {
      this.isShadowCounter = 0;
    },
    onDragEnd() {
      this.isShadowCounter = 0;
      this.scrollable = false;
      this.isDraggedFrom = false;
    },
    openCourseModal() {
      // Delete confirmation for the use case of adding multiple courses consecutively
      this.closeConfirmationModal();
      this.isCourseModalOpen = !this.isCourseModalOpen;
    },
    closeCourseModal() {
      this.isCourseModalOpen = false;
    },
    openConflictModal(
      course: FirestoreSemesterCourse,
      conflicts: Set<string[]>,
      selfCheckRequirements: readonly RequirementWithIDSourceType[]
    ) {
      this.conflictCourse = course;
      this.courseConflicts = conflicts;
      this.selfCheckRequirements = selfCheckRequirements;
      this.isConflictModalOpen = !this.isConflictModalOpen;
    },
    closeConflictModal() {
      this.isConflictModalOpen = false;
    },
    openSemesterModal() {
      // Delete confirmation for the use case of adding multiple semesters consecutively
      this.closeConfirmationModal();

      this.$emit('new-semester');
    },
    openConfirmationModal(msg: string) {
      // Set text and display confirmation modal, then have it disappear after 3 seconds
      this.confirmationText = msg;
      this.isConfirmationOpen = true;

      setTimeout(() => {
        this.closeConfirmationModal();
      }, 2000);
    },
    closeConfirmationModal() {
      this.isConfirmationOpen = false;
    },

    saveCourse(
      course: FirestoreSemesterCourse,
      addedToCollections: string[],
      deletedFromCollections: string[]
    ) {
      deletedFromCollections.forEach(collection => {
        // If course is already in collection, remove it
        deleteCourseFromCollection(collection, course.code);
      });

      addCourseToCollections(
        store.state.currentPlan,
        this.year,
        this.season,
        course,
        addedToCollections
      );

      editDefaultCollection(); // edit the 'All' collection

      // Display confirmation message for all collections except the last one
      if (addedToCollections.length !== 0 && deletedFromCollections.length !== 0) {
        this.openConfirmationModal(
          `Saved ${course.code} to ${addedToCollections.join(', ')}. Deleted ${
            course.code
          } from ${deletedFromCollections.join(', ')}`
        );
      } else if (deletedFromCollections.length === 0 && addedToCollections.length !== 0) {
        this.openConfirmationModal(`Saved ${course.code} to ${addedToCollections.join(', ')}`);
      } else if (addedToCollections.length === 0 && deletedFromCollections.length !== 0) {
        this.openConfirmationModal(
          ` Deleted ${course.code} from ${deletedFromCollections.join(', ')}`
        );
      }
    },
    saveNote(uniqueID: number, note: string) {
      if (!note) {
        return;
      }
      editSemester(
        store.state.currentPlan,
        this.year,
        this.season,
        (semester: FirestoreSemester) => ({
          ...semester,
          courses: semester.courses.map(course =>
            course.uniqueID === uniqueID
              ? {
                  ...course,
                  note,
                  // We know that this must be an update as otherwise the frontend wouldn't allow
                  // saveNote to be called.
                  lastUpdated: Timestamp.now(),
                }
              : course
          ),
        })
      );
    },
    deleteNote(uniqueID: number) {
      editSemester(
        store.state.currentPlan,
        this.year,
        this.season,
        (semester: FirestoreSemester) => ({
          ...semester,
          courses: semester.courses.map(course =>
            // NOTE: we must explicitly set note and lastUpdated to null, as Firestore cannot handle
            // undefined values and extracting them would not be type-safe.
            course.uniqueID === uniqueID ? { ...course, note: null, lastUpdated: null } : course
          ),
        })
      );
      this.closeDeleteNoteModal();
    },
    addCollection(name: string) {
      addCollection(name, []);
      this.confirmationText = `${name} has been added!`;
      this.isConfirmationOpen = true;
      setTimeout(() => {
        this.isConfirmationOpen = false;
      }, 2000);
    },
    editCollection(oldname: string, name: string) {
      const { savedCourses } = store.state;
      const toEdit = savedCourses.find(collection => collection.name === oldname);
      const updater = (collection: Collection): Collection => ({
        name,
        courses: collection.courses,
      });
      if (toEdit !== undefined) {
        editCollection(oldname, updater);
      }

      this.confirmationText = `${oldname} has been renamed to ${name}!`;
      this.isConfirmationOpen = true;
      setTimeout(() => {
        this.isConfirmationOpen = false;
      }, 2000);
    },
    // TODO @willespencer refactor the below methods after gatekeep removed (to only 1 method)
    addCourse(data: CornellCourseRosterCourse, choice: FirestoreCourseOptInOptOutChoices) {
      const newCourse = cornellCourseRosterCourseToFirebaseSemesterCourseWithGlobalData(data);
      // Since the course is new, we know the old choice does not exist.
      addCourseToSemester(
        store.state.currentPlan,
        this.year,
        this.season,
        newCourse,
        () => choice,
        this.$gtag
      );

      const courseCode = `${data.subject} ${data.catalogNbr}`;
      this.openConfirmationModal(`Added ${courseCode} to ${this.season} ${this.year}`);
    },
    selectCourse(data: CornellCourseRosterCourse) {
      // only perform operations if the gatekeep is true
      if (this.handleRequirementConflicts) {
        const newCourse = cornellCourseRosterCourseToFirebaseSemesterCourseWithGlobalData(data);

        // set choice to nothing (no opting out, no opting in)
        const choice: FirestoreCourseOptInOptOutChoices = {
          optOut: [],
          acknowledgedCheckerWarningOptIn: [],
          arbitraryOptIn: {},
        };

        // add the course to the semeser (with no choice made)
        addCourseToSemester(
          store.state.currentPlan,
          this.year,
          this.season,
          newCourse,
          () => choice,
          this.$gtag
        );
        this.closeCourseModal();

        const conflicts = store.state.courseToRequirementsInConstraintViolations.get(
          newCourse.uniqueID
        );

        const { selfCheckRequirements } = getRelatedUnfulfilledRequirements(
          data,
          store.state.groupedRequirementFulfillmentReport,
          store.state.onboardingData,
          store.state.toggleableRequirementChoices,
          store.state.overriddenFulfillmentChoices,
          store.state.userRequirementsMap
        );

        // only open conflict modal if conflicts exist
        if (conflicts && conflicts.size > 0) {
          this.openConflictModal(newCourse, conflicts, selfCheckRequirements);
        }
      }
    },
    handleConflictsResolved(course: FirestoreSemesterCourse) {
      this.openConfirmationModal(`Added ${course.code} to ${this.season} ${this.year}`);
    },
    deleteCourseWithoutModal(uniqueID: number) {
      deleteCourseFromSemester(
        store.state.currentPlan,
        this.year,
        this.season,
        uniqueID,
        this.$gtag
      );
    },
    deleteCourse(courseCode: string, uniqueID: number) {
      deleteCourseFromSemester(
        store.state.currentPlan,
        this.year,
        this.season,
        uniqueID,
        this.$gtag
      );
      // Update requirements menu
      this.openConfirmationModal(`Removed ${courseCode} from ${this.season} ${this.year}`);
    },
    colorCourse(color: string, uniqueID: number, courseCode: string) {
      editSemester(
        store.state.currentPlan,
        this.year,
        this.season,
        (semester: FirestoreSemester): FirestoreSemester => ({
          ...semester,
          courses: this.courses.map(course =>
            course.uniqueID === uniqueID ? { ...course, color } : course
          ),
        })
      );
      this.openConfirmationModal(`Changed color for ${courseCode}`);
    },
    colorSubject(color: string, courseCode: string) {
      const subject = courseCode.split(' ')[0];
      const updater = (semester: FirestoreSemester): FirestoreSemester => ({
        ...semester,
        courses: semester.courses.map(course =>
          !isPlaceholderCourse(course) && course.code.split(' ')[0] === subject
            ? { ...course, color }
            : course
        ),
      });
      editSemesters(store.state.currentPlan, oldSemesters => oldSemesters.map(sem => updater(sem)));
      updateSubjectColorData(color, subject);
      this.openConfirmationModal(`Changed color for ${subject}`);
    },
    courseOnClick(course: FirestoreSemesterCourse) {
      this.$emit('course-onclick', course);
    },
    editCourseCredit(credit: number, uniqueID: number) {
      editSemester(
        store.state.currentPlan,
        this.year,
        this.season,
        (semester: FirestoreSemester): FirestoreSemester => ({
          ...semester,
          courses: this.courses.map(course =>
            course.uniqueID === uniqueID ? { ...course, credits: credit } : course
          ),
        })
      );
    },
    dragListener(event: Event) {
      if (!this.$data.scrollable) event.preventDefault();
    },
    minimizeSemester() {
      this.isSemesterMinimized = !this.isSemesterMinimized;
      localStorage.setItem(
        JSON.stringify(this.semesterIndex),
        JSON.stringify(this.isSemesterMinimized)
      );
    },
    openSemesterMenu() {
      this.stopCloseFlag = true;
      this.semesterMenuOpen = true;
    },
    closeSemesterMenuIfOpen() {
      if (this.stopCloseFlag) {
        this.stopCloseFlag = false;
      } else if (this.semesterMenuOpen) {
        this.semesterMenuOpen = false;
      }
    },
    openDeleteSemesterModal() {
      this.isDeleteSemesterOpen = true;
    },
    closeDeleteSemesterModal() {
      this.isDeleteSemesterOpen = false;
    },
    openDeleteNoteModal(uniqueID: number) {
      this.noteCourseUniqueID = uniqueID;
      this.isDeleteNoteOpen = true;
    },
    closeDeleteNoteModal() {
      this.isDeleteNoteOpen = false;
      this.noteCourseUniqueID = undefined;
    },
    deleteSemester(season: string, year: number) {
      this.$emit('delete-semester', season, year);
      this.openConfirmationModal(`Deleted ${season} ${year} from plan`);
    },
    openEditSemesterModal() {
      this.isEditSemesterOpen = true;
    },
    closeEditSemesterModal() {
      this.isEditSemesterOpen = false;
    },
    editSemester(seasonInput: string, yearInput: number) {
      editSemester(
        store.state.currentPlan,
        this.year,
        this.season,
        (oldSemester: FirestoreSemester): FirestoreSemester => ({
          ...oldSemester,
          season: seasonInput as FirestoreSemesterSeason,
          year: yearInput,
        })
      );
    },
    openClearSemesterModal() {
      this.isClearSemesterOpen = true;
    },
    closeClearSemesterModal() {
      this.isClearSemesterOpen = false;
    },
    clearSemester() {
      deleteAllCoursesFromSemester(store.state.currentPlan, this.year, this.season, this.$gtag);
      this.openConfirmationModal(`Cleared ${this.season} ${this.year} in plan`);
    },
    walkthroughText() {
      return `<div class="introjs-tooltipTop"><div class="introjs-customTitle">Add Classes to your Schedule</div><div class="introjs-customProgress">3/4</div>
      </div><div class = "introjs-bodytext">Press "+ Course" to add classes! Edit semesters using the ellipses on the top right and drag courses between semesters.</div>`;
    },
    handleNoteStateChange(courseUniqueID: number, isExpanded: boolean) {
      // Set transitioning flag
      this.isNoteTransitioning = true;

      // Update note state
      this.expandedNotes.set(courseUniqueID, isExpanded);

      // Remove transitioning flag after animation completes
      setTimeout(() => {
        this.isNoteTransitioning = false;
      }, 300); // Match this with your transition duration
    },
  },
  directives: {
    'click-outside': clickOutside,
  },
});
</script>

<style scoped lang="scss">
@import '@/assets/scss/_variables.scss';

.semester {
  width: $regular-semester-width;
  box-sizing: border-box;
  position: relative;
  border-radius: 11px;

  &-addSemesterButton {
    background: $sangBlue;
    border-radius: 3px;
    min-height: 2.5rem;
    min-width: 9rem;
    color: $white;
    border: none;
    position: absolute;
    top: -3.3rem;
    font-size: 16px;
  }

  &-content {
    padding: 0.875rem 0;
    border: 2px solid $borderGray;
    border-radius: 11px;
  }

  &--compact {
    width: $compact-semester-width;
  }

  &-confirmation {
    top: 16px;
    display: none;
  }

  &-top {
    display: flex;
    justify-content: space-between;
    color: $medGray;
    margin-left: 1.125rem;
    margin-right: 1.125rem;
  }

  &-left {
    display: flex;
    flex-direction: column;

    &--compact {
      justify-content: space-between;
    }
  }

  &-right {
    display: flex;

    &--compact {
      margin-top: 0.25rem;
    }
  }

  &-minimize {
    margin-right: 8px;
  }

  &-dotRow {
    padding: 15px 0;
    display: flex;
    position: relative;
    &:hover,
    &:active,
    &:focus {
      cursor: pointer;
    }
  }

  &-menu {
    position: absolute;
    right: -3rem;
    top: 2rem;
    z-index: 1;
  }

  &-name {
    font-size: 18px;
    line-height: 18px;
    margin-right: 0.5rem;
    font-weight: bold;
  }

  &-icon {
    width: 14px;
    height: 14px;
  }

  &-credits {
    font-size: 14px;
    line-height: 17px;
  }

  &-courseWrapper {
    margin: 0.5rem 0 0.5rem 0;
  }

  &-course {
    touch-action: none;
    cursor: grab;
  }

  &-course:active:hover {
    touch-action: none;
    cursor: grabbing;
  }

  &-hidden {
    display: none;
  }

  .season-emoji {
    height: 18px;
    margin-top: -4px;
  }

  .draggable-semester-courses {
    padding-top: 5px;
    padding-left: 1.125rem;
    padding-right: 1.125rem;
  }
}

@media only screen and (max-width: $medium-breakpoint) {
  .semester {
    width: $compact-semester-width;

    &-menu {
      right: 0rem;
    }
  }
}

@media only screen and (max-width: $small-breakpoint) {
  .semester,
  .semester--compact {
    width: calc(100vw - 4rem);
    padding: 0;
  }
}
</style>
