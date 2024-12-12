import { doc, updateDoc } from 'firebase/firestore';

import { VueGtag } from 'vue-gtag-next';
import { semestersCollection } from '../firebase-config';
import store from '../store';
import { GTagEvent } from '../gtag';
import { sortedSemesters } from '../utilities';

import {
  updateRequirementChoice,
  deleteCourseFromRequirementChoices,
  deleteCoursesFromRequirementChoices,
} from './user-overridden-fulfillment-choices';

export const editCollections = async (
  updater: (oldCollections: readonly Collection[]) => readonly Collection[]
): Promise<void> => {
  const savedCourses = updater(store.state.savedCourses);
  store.commit('setSavedCourses', savedCourses);
  await updateDoc(doc(semestersCollection, store.state.currentFirebaseUser.email), {
    savedCourses,
  });
};

export const editSemesters = (
  plan: Plan,
  updater: (oldSemesters: readonly FirestoreSemester[]) => readonly FirestoreSemester[]
): void => {
  const editedPlan = (p: Plan): Plan => ({ name: p.name, semesters: updater(p.semesters) });
  editPlan(plan.name, editedPlan);
};

export const editPlans = async (
  updater: (oldPlans: readonly Plan[]) => readonly Plan[]
): Promise<void> => {
  const plans = updater(store.state.plans);
  store.commit('setPlans', plans);
  await updateDoc(doc(semestersCollection, store.state.currentFirebaseUser.email), {
    plans,
  });
  store.commit('setOrderByNewest', store.state.orderByNewest);
};
/**
 * Sets whether semesters are ordered by newest/oldest
 */
export const setOrderByNewest = (orderByNewest: boolean): void => {
  if (orderByNewest === store.state.orderByNewest) return;
  store.commit('setOrderByNewest', orderByNewest);
  updateDoc(doc(semestersCollection, store.state.currentFirebaseUser.email), {
    orderByNewest,
  });
};

/**
 * Updates the 'All'/Default Collection with courses based on the following logic:
 * - Add unique courses from specific collections to the default collection.
 * - If a course is removed from the default collection, it is removed from all specific collections.
 * Note: Does not remove a course form the default collection if that course is removed in all specfic collections.
 */
export const editDefaultCollection = (): void => {
  const allCollections = store.state.savedCourses;
  const defaultCollectionName = 'All';

  const uniqueCoursesMap = new Map<string, FirestoreSemesterCourse>();
  allCollections.forEach(collection => {
    collection.courses.forEach(course => {
      uniqueCoursesMap.set(course.name, course);
    });
  });

  const uniqueCourses = new Set<FirestoreSemesterCourse>(uniqueCoursesMap.values());

  editCollection(defaultCollectionName, oldCollection => ({
    ...oldCollection,
    courses: Array.from(uniqueCourses),
  }));
};

export const editCollection = (
  name: string,
  updater: (oldCollection: Collection) => Collection
): void => {
  editCollections(oldCollection =>
    oldCollection.map(collection => (collection.name === name ? updater(collection) : collection))
  );
};

export const editSemester = (
  plan: Plan,
  year: number,
  season: FirestoreSemesterSeason,
  updater: (oldSemester: FirestoreSemester) => FirestoreSemester
): void => {
  editSemesters(plan, oldSemesters =>
    oldSemesters.map(sem => (semesterEquals(sem, year, season) ? updater(sem) : sem))
  );
};

export const editPlan = (name: string, updater: (oldPlan: Plan) => Plan): void => {
  editPlans(oldPlan => oldPlan.map(plan => (plan.name === name ? updater(plan) : plan)));
};

const createCollection = (
  name: string,
  courses: readonly FirestoreSemesterCourse[]
): {
  name: string;
  courses: readonly FirestoreSemesterCourse[];
} => ({
  name,
  courses,
});

const createSemester = (
  year: number,
  season: FirestoreSemesterSeason,
  courses: readonly FirestoreSemesterCourse[]
): {
  year: number;
  season: FirestoreSemesterSeason;
  courses: readonly FirestoreSemesterCourse[];
} => ({
  courses,
  season,
  year,
});

const createPlan = (
  name: string,
  semesters: FirestoreSemester[]
): {
  name: string;
  semesters: FirestoreSemester[];
} => ({
  name,
  semesters,
});

// exposed for testing
export const semesterEquals = (
  semester: FirestoreSemester,
  year: number,
  season: FirestoreSemesterSeason
): boolean => semester.year === year && semester.season === season;

export const addCollection = async (
  name: string,
  courses: readonly FirestoreSemesterCourse[],
  gtag?: VueGtag
): Promise<void> => {
  GTagEvent(gtag, 'add-collection');
  await editCollections(oldCollections => [...oldCollections, createCollection(name, courses)]);
};

export const addSemester = (
  plan: Plan,
  year: number,
  season: FirestoreSemesterSeason,
  gtag?: VueGtag,
  courses: readonly FirestoreSemesterCourse[] = []
): void => {
  GTagEvent(gtag, 'add-semester');
  editSemesters(plan, oldSemesters => [...oldSemesters, createSemester(year, season, courses)]);
};

export const addPlan = async (
  name: string,
  semesters: FirestoreSemester[],
  gtag?: VueGtag
): Promise<void> => {
  GTagEvent(gtag, 'add-plan');
  await editPlans(oldPlans => [...oldPlans, createPlan(name, semesters)]);
  store.commit(
    'setCurrentPlan',
    store.state.plans.find(plan => plan.name === name)
  );
};

/** Deletes an entire collection including the courses.
 */
export const deleteCollection = async (name: string, gtag?: VueGtag): Promise<void> => {
  GTagEvent(gtag, 'delete-collection');
  if (store.state.savedCourses.some(p => p.name === name)) {
    await editCollections(oldCollections => oldCollections.filter(p => p.name !== name));
  }
};

export const deleteSemester = (
  plan: Plan,
  year: number,
  season: FirestoreSemesterSeason,
  gtag?: VueGtag
): void => {
  GTagEvent(gtag, 'delete-semester');
  const semester: FirestoreSemester = store.getters.getCurrentPlanSemesters.find(
    (sem: FirestoreSemester) => semesterEquals(sem, year, season)
  );
  if (semester) {
    deleteCoursesFromRequirementChoices(semester.courses.map(course => course.uniqueID));
    editSemesters(plan, oldSemesters =>
      oldSemesters.filter(sem => !semesterEquals(sem, year, season))
    );
  }
};

export const deletePlan = async (name: string, gtag?: VueGtag): Promise<void> => {
  GTagEvent(gtag, 'delete-plan');
  if (store.state.plans.some(p => p.name === name)) {
    await editPlans(oldPlans => oldPlans.filter(p => p.name !== name));
  }
  store.commit('setCurrentPlan', store.state.plans[0]);
};

/** Add one course to multiple collections.
 * This course is removed from the requirement choices.
 */
export const addCourseToCollections = (
  plan: Plan,
  year: number,
  season: FirestoreSemesterSeason,
  newCourse: FirestoreSemesterCourse,
  collectionIDs: string[],
  gtag?: VueGtag
): void => {
  GTagEvent(gtag, 'add-course-collections');
  editCollections(oldCollections =>
    oldCollections.map(collection => {
      if (collectionIDs.includes(collection.name)) {
        return { ...collection, courses: [...collection.courses, newCourse] };
      }
      return collection;
    })
  );

  deleteCourseFromSemester(plan, year, season, newCourse.uniqueID);
  deleteCourseFromRequirementChoices(newCourse.uniqueID);
};

/**
 * Delete a course from all collections including the 'All' Collection.
 *
 * @param code
 */
export const deleteCourseFromAllCollections = (code: string): void => {
  // delete course from all collections
  const allCollections = store.state.savedCourses;
  allCollections.forEach(collection => {
    deleteCourseFromCollection(collection.name, code);
  });
};

/** Delete a course from a certain collection. */
export const deleteCourseFromCollection = (name: string, code: string): void => {
  // delete course from collection
  editCollection(name, oldCollection => ({
    ...oldCollection,
    courses: oldCollection.courses.filter(course => course.code !== code),
  }));
};

export const addCourseToSemester = (
  plan: Plan,
  year: number,
  season: FirestoreSemesterSeason,
  newCourse: FirestoreSemesterCourse,
  choiceUpdater: (choice: FirestoreCourseOptInOptOutChoices) => FirestoreCourseOptInOptOutChoices,
  gtag?: VueGtag
): void => {
  GTagEvent(gtag, 'add-course');
  editSemesters(plan, oldSemesters => {
    let semesterFound = false;
    const newSemestersWithCourse = oldSemesters.map(sem => {
      if (semesterEquals(sem, year, season)) {
        semesterFound = true;
        return { ...sem, courses: [...sem.courses, newCourse] };
      }
      return sem;
    });
    if (semesterFound) return newSemestersWithCourse;
    return [...oldSemesters, createSemester(year, season, [newCourse])];
  });
  updateRequirementChoice(newCourse.uniqueID, choiceUpdater);
};

export const deleteCourseFromSemester = (
  plan: Plan,
  year: number,
  season: FirestoreSemesterSeason,
  courseUniqueID: number,
  gtag?: VueGtag
): void => {
  GTagEvent(gtag, 'delete-course');
  const semester: FirestoreSemester = store.getters.getCurrentPlanSemesters.find(
    (sem: FirestoreSemester) => semesterEquals(sem, year, season)
  );
  if (semester) {
    deleteCourseFromRequirementChoices(courseUniqueID);
    editSemesters(plan, oldSemesters =>
      oldSemesters.map(sem => ({
        ...sem,
        courses: semesterEquals(sem, year, season)
          ? sem.courses.filter(course => course.uniqueID !== courseUniqueID)
          : sem.courses,
      }))
    );
  }
};

export const deleteAllCoursesFromSemester = (
  plan: Plan,
  year: number,
  season: FirestoreSemesterSeason,
  gtag?: VueGtag
): void => {
  GTagEvent(gtag, 'delete-semester-courses');
  const semester: FirestoreSemester = store.getters.getCurrentPlanSemesters.find(
    (sem: FirestoreSemester) => semesterEquals(sem, year, season)
  );
  if (semester) {
    deleteCoursesFromRequirementChoices(semester.courses.map(course => course.uniqueID));
    editSemesters(plan, oldSemesters =>
      oldSemesters.map(sem => ({
        ...sem,
        courses: semesterEquals(sem, year, season) ? [] : sem.courses,
      }))
    );
  }
};

export const deleteCourseFromSemesters = (
  plan: Plan,
  courseUniqueID: number,
  gtag?: VueGtag
): void => {
  GTagEvent(gtag, 'delete-course');
  editSemesters(plan, oldSemesters =>
    oldSemesters.map(semester => {
      const coursesWithoutDeleted = semester.courses.filter(
        course => course.uniqueID !== courseUniqueID
      );
      return { ...semester, courses: coursesWithoutDeleted };
    })
  );
  deleteCourseFromRequirementChoices(courseUniqueID);
};

// exposed for testing
export const getActiveSemesters = (
  entranceYear: number,
  entranceSem: FirestoreSemesterSeason,
  gradYear: number,
  gradSem: FirestoreSemesterSeason
): readonly FirestoreSemester[] => {
  const sems = [createSemester(entranceYear, 'Fall', []), createSemester(gradYear, 'Spring', [])];
  if (entranceYear !== gradYear && entranceSem === 'Spring')
    sems.push(createSemester(entranceYear, 'Spring', []));
  if (entranceYear !== gradYear && gradSem === 'Fall')
    sems.push(createSemester(gradYear, 'Fall', []));

  for (let yr = entranceYear + 1; yr < gradYear; yr += 1) {
    sems.push(createSemester(yr, 'Spring', []));
    sems.push(createSemester(yr, 'Fall', []));
  }
  return sortedSemesters(sems);
};

// add empty semesters based on entrance and graduation time
export const populateSemesters = (plan: Plan, onboarding: AppOnboardingData): void => {
  const entranceYear = parseInt(onboarding.entranceYear, 10);
  const gradYear = parseInt(onboarding.gradYear, 10);

  const entranceSem: FirestoreSemesterSeason = onboarding.entranceSem
    ? onboarding.entranceSem
    : 'Fall';
  const gradSem: FirestoreSemesterSeason = onboarding.gradSem ? onboarding.gradSem : 'Spring';

  editSemesters(plan, () => getActiveSemesters(entranceYear, entranceSem, gradYear, gradSem));
};
