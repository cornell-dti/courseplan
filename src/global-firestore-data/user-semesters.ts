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

export const editSemesters = async (
  updater: (oldSemesters: readonly FirestoreSemester[]) => readonly FirestoreSemester[]
): Promise<void> => {
  const semesters = updater(store.state.semesters);
  store.commit('setSemesters', semesters);
  // TODO: update when multiple plans frontend implemented
  await updateDoc(doc(semestersCollection, store.state.currentFirebaseUser.email), {
    semesters,
    plans: [{ semesters }],
  });
};

/**
 * Sets whether semesters are ordered by newest/oldest
 */
export const setOrderByNewest = async (orderByNewest: boolean): Promise<void> => {
  if (orderByNewest === store.state.orderByNewest) return;
  store.commit('setOrderByNewest', orderByNewest);
  await updateDoc(doc(semestersCollection, store.state.currentFirebaseUser.email), {
    orderByNewest,
  });
};

export const editSemester = async (
  year: number,
  season: FirestoreSemesterSeason,
  updater: (oldSemester: FirestoreSemester) => FirestoreSemester
): Promise<void> => {
  await editSemesters(oldSemesters =>
    oldSemesters.map(sem => (semesterEquals(sem, year, season) ? updater(sem) : sem))
  );
};

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

// exposed for testing
export const semesterEquals = (
  semester: FirestoreSemester,
  year: number,
  season: FirestoreSemesterSeason
): boolean => semester.year === year && semester.season === season;

export const addSemester = async (
  year: number,
  season: FirestoreSemesterSeason,
  gtag?: VueGtag,
  courses: readonly FirestoreSemesterCourse[] = []
): Promise<void> => {
  GTagEvent(gtag, 'add-semester');
  await editSemesters(oldSemesters => [...oldSemesters, createSemester(year, season, courses)]);
};

export const deleteSemester = async (
  year: number,
  season: FirestoreSemesterSeason,
  gtag?: VueGtag
): Promise<void> => {
  GTagEvent(gtag, 'delete-semester');
  const semester = store.state.semesters.find(sem => semesterEquals(sem, year, season));
  if (semester) {
    deleteCoursesFromRequirementChoices(semester.courses.map(course => course.uniqueID));
    await editSemesters(oldSemesters =>
      oldSemesters.filter(sem => !semesterEquals(sem, year, season))
    );
  }
};

export const addCourseToSemester = async (
  year: number,
  season: FirestoreSemesterSeason,
  newCourse: FirestoreSemesterCourse,
  choiceUpdater: (choice: FirestoreCourseOptInOptOutChoices) => FirestoreCourseOptInOptOutChoices,
  gtag?: VueGtag
): Promise<void> => {
  GTagEvent(gtag, 'add-course');
  await editSemesters(oldSemesters => {
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

export const deleteCourseFromSemester = async (
  year: number,
  season: FirestoreSemesterSeason,
  courseUniqueID: number,
  gtag?: VueGtag
): Promise<void> => {
  GTagEvent(gtag, 'delete-course');
  const semester = store.state.semesters.find(sem => semesterEquals(sem, year, season));
  if (semester) {
    await deleteCourseFromRequirementChoices(courseUniqueID);
    await editSemesters(oldSemesters =>
      oldSemesters.map(sem => ({
        ...sem,
        courses: semesterEquals(sem, year, season)
          ? sem.courses.filter(course => course.uniqueID !== courseUniqueID)
          : sem.courses,
      }))
    );
  }
};

export const deleteAllCoursesFromSemester = async (
  year: number,
  season: FirestoreSemesterSeason,
  gtag?: VueGtag
): Promise<void> => {
  GTagEvent(gtag, 'delete-semester-courses');
  const semester = store.state.semesters.find(sem => semesterEquals(sem, year, season));
  if (semester) {
    deleteCoursesFromRequirementChoices(semester.courses.map(course => course.uniqueID));
    await editSemesters(oldSemesters =>
      oldSemesters.map(sem => ({
        ...sem,
        courses: semesterEquals(sem, year, season) ? [] : sem.courses,
      }))
    );
  }
};

export const deleteCourseFromSemesters = async (
  courseUniqueID: number,
  gtag?: VueGtag
): Promise<void> => {
  GTagEvent(gtag, 'delete-course');
  await editSemesters(oldSemesters =>
    oldSemesters.map(semester => {
      const coursesWithoutDeleted = semester.courses.filter(
        course => course.uniqueID !== courseUniqueID
      );
      return { ...semester, courses: coursesWithoutDeleted };
    })
  );
  await deleteCourseFromRequirementChoices(courseUniqueID);
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
export const populateSemesters = async (onboarding: AppOnboardingData): Promise<void> => {
  const entranceYear = parseInt(onboarding.entranceYear, 10);
  const gradYear = parseInt(onboarding.gradYear, 10);

  const entranceSem: FirestoreSemesterSeason = onboarding.entranceSem
    ? onboarding.entranceSem
    : 'Fall';
  const gradSem: FirestoreSemesterSeason = onboarding.gradSem ? onboarding.gradSem : 'Spring';

  await editSemesters(() => getActiveSemesters(entranceYear, entranceSem, gradYear, gradSem));
};
