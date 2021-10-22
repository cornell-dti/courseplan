import { SeasonOrdinal } from '../utilities';
import store from '../store';
import { semestersCollection } from '../firebase-frontend-config';
import { GTag, GTagEvent } from '../gtag';

import {
  addCourseToSelectableRequirements,
  deleteCourseFromSelectableRequirements,
  deleteCoursesFromSelectableRequirements,
} from './selectable-requirement-choices';

// compare function for FirestoreSemester to determine which comes first by year and type/season
export const compareFirestoreSemesters = (a: FirestoreSemester, b: FirestoreSemester): number => {
  if (a.type === b.type && a.year === b.year) {
    return 0;
  }
  if (a.year > b.year) {
    return -1;
  }
  if (a.year < b.year) {
    return 1;
  }
  if (SeasonOrdinal[a.type] < SeasonOrdinal[b.type]) {
    return 1;
  }
  return -1;
};

const editSemesters = (
  updater: (oldSemesters: readonly FirestoreSemester[]) => readonly FirestoreSemester[]
): void => {
  const newSemesters = updater(store.state.semesters);
  store.commit('setSemesters', newSemesters);
  semestersCollection.doc(store.state.currentFirebaseUser.email).update({
    semesters: newSemesters,
  });
};

/**
 * Toggles whether semesters are ordered by newest/oldest
 * @returns true iff semesters were previously ordered oldest -> newest,
 *          false otherwise
 */
export const toggleOrderByNewest = (): boolean => {
  const toggled = !store.state.orderByNewest;
  store.commit('setOrderByNewest', toggled);
  semestersCollection.doc(store.state.currentFirebaseUser.email).update({
    orderByNewest: toggled,
  });
  return toggled;
};

export const editSemester = (
  year: number,
  type: FirestoreSemesterType,
  updater: (oldSemester: FirestoreSemester) => FirestoreSemester
): void => {
  editSemesters(oldSemesters =>
    oldSemesters.map(sem => (sem.year === year && sem.type === type ? updater(sem) : sem))
  );
};

const createSemester = (
  type: FirestoreSemesterType,
  year: number,
  courses: readonly FirestoreSemesterCourse[]
): { type: FirestoreSemesterType; year: number; courses: readonly FirestoreSemesterCourse[] } => ({
  courses,
  type,
  year,
});

export const addSemester = (
  type: FirestoreSemesterType,
  year: number,
  gtag?: GTag,
  courses: readonly FirestoreSemesterCourse[] = []
): void => {
  GTagEvent(gtag, 'add-semester');
  editSemesters(oldSemesters => [...oldSemesters, createSemester(type, year, courses)]);
};

export const deleteSemester = (type: FirestoreSemesterType, year: number, gtag?: GTag): void => {
  GTagEvent(gtag, 'delete-semester');
  const semester = store.state.semesters.find(sem => sem.type === type && sem.year === year);
  if (semester) {
    deleteCoursesFromSelectableRequirements(semester.courses.map(course => course.uniqueID));
  }
  editSemesters(oldSemesters => oldSemesters.filter(sem => sem.type !== type || sem.year !== year));
};

export const addCourseToSemester = (
  season: FirestoreSemesterType,
  year: number,
  newCourse: FirestoreSemesterCourse,
  requirementID?: string,
  gtag?: GTag
): void => {
  GTagEvent(gtag, 'add-course');
  editSemesters(oldSemesters => {
    let semesterFound = false;
    const newSemestersWithCourse = oldSemesters.map(sem => {
      if (sem.type === season && sem.year === year) {
        semesterFound = true;
        return { ...sem, courses: [...sem.courses, newCourse] };
      }
      return sem;
    });
    if (semesterFound) return newSemestersWithCourse;
    return [...oldSemesters, createSemester(season, year, [newCourse])];
  });
  if (requirementID) {
    addCourseToSelectableRequirements(newCourse.uniqueID, requirementID);
  }
};

export const deleteCourseFromSemester = (
  season: FirestoreSemesterType,
  year: number,
  courseUniqueID: number,
  gtag?: GTag
): void => {
  GTagEvent(gtag, 'delete-course');
  editSemesters(oldSemesters => {
    let semesterFound = false;
    const newSemestersWithoutCourse = oldSemesters.map(sem => {
      if (sem.type === season && sem.year === year) {
        semesterFound = true;
        return {
          ...sem,
          courses: sem.courses.filter(course => course.uniqueID !== courseUniqueID),
        };
      }
      return sem;
    });
    if (semesterFound) return newSemestersWithoutCourse;
    return oldSemesters;
  });
  deleteCourseFromSelectableRequirements(courseUniqueID);
};

export const deleteAllCoursesFromSemester = (
  season: FirestoreSemesterType,
  year: number,
  gtag?: GTag
): void => {
  GTagEvent(gtag, 'delete-semester-courses');
  const semester = store.state.semesters.find(sem => sem.type === season && sem.year === year);
  if (semester) {
    deleteCoursesFromSelectableRequirements(semester.courses.map(course => course.uniqueID));
  }
  editSemesters(oldSemesters => {
    let semesterFound = false;
    const newSemestersWithEmptiedSemester = oldSemesters.map(sem => {
      if (sem.type === season && sem.year === year) {
        semesterFound = true;
        return {
          ...sem,
          courses: [],
        };
      }
      return sem;
    });
    if (semesterFound) return newSemestersWithEmptiedSemester;
    return oldSemesters;
  });
};

export const deleteCourseFromSemesters = (courseUniqueID: number, gtag?: GTag): void => {
  GTagEvent(gtag, 'delete-course');
  editSemesters(oldSemesters =>
    oldSemesters.map(semester => {
      const coursesWithoutDeleted = semester.courses.filter(
        course => course.uniqueID !== courseUniqueID
      );
      return { ...semester, courses: coursesWithoutDeleted };
    })
  );
  deleteCourseFromSelectableRequirements(courseUniqueID);
};

export const getActiveSemesters = (
  entranceSem: FirestoreSemesterType,
  entranceYear: number,
  gradSem: FirestoreSemesterType,
  gradYear: number
): FirestoreSemester[] => {
  const sems = [createSemester('Fall', entranceYear, []), createSemester('Spring', gradYear, [])];
  if (entranceSem === 'Spring' && entranceYear !== gradYear)
    sems.push(createSemester('Spring', entranceYear, []));
  if (gradSem === 'Fall' && entranceYear !== gradYear)
    sems.push(createSemester('Fall', gradYear, []));

  for (let yr = entranceYear + 1; yr < gradYear; yr += 1) {
    sems.push(createSemester('Spring', yr, []));
    sems.push(createSemester('Fall', yr, []));
  }
  return sems.sort(compareFirestoreSemesters);
};

// function to add all the semesters a user will be enrolled in based on entrance and graduation time
export const populateSemesters = (onboarding: AppOnboardingData): void => {
  const entranceYear = parseInt(onboarding.entranceYear, 10);
  const gradYear = parseInt(onboarding.gradYear, 10);

  const entranceSem: FirestoreSemesterType = onboarding.entranceSem
    ? onboarding.entranceSem
    : 'Fall';
  const gradSem: FirestoreSemesterType = onboarding.gradSem ? onboarding.gradSem : 'Spring';

  editSemesters(() => getActiveSemesters(entranceSem, entranceYear, gradSem, gradYear));
};
