/**
 * Put all functions that can use and change the firestore data here.
 */

import {
  usernameCollection,
  onboardingDataCollection,
  semestersCollection,
  toggleableRequirementChoicesCollection,
  selectableRequirementChoicesCollection,
  uniqueIncrementerCollection,
} from './firebaseConfig';
import store from './store';
import { GTag, GTagEvent } from './gtag';

// enum to define seasons as integers in season order
export const SeasonsEnum = Object.freeze({
  Winter: 0,
  Spring: 1,
  Summer: 2,
  Fall: 3,
});

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
  if (SeasonsEnum[a.type] < SeasonsEnum[b.type]) {
    return 1;
  }
  return -1;
};

const editSemesters = (
  updater: (oldSemesters: readonly FirestoreSemester[]) => readonly FirestoreSemester[]
): void => {
  const newSemesters = updater(store.state.semesters);
  semestersCollection
    .doc(store.state.currentFirebaseUser.email)
    .set({ semesters: newSemesters })
    .then(() => store.commit('setSemesters', newSemesters));
};

export const editSemester = (
  year: number,
  type: FirestoreSemesterType,
  updater: (oldSemester: FirestoreSemester) => FirestoreSemester
): void => {
  editSemesters(oldSemesters =>
    oldSemesters
      .map(sem => (sem.year === year && sem.type === type ? updater(sem) : sem))
      .sort(compareFirestoreSemesters)
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
  editSemesters(oldSemesters =>
    [...oldSemesters, createSemester(type, year, courses)].sort(compareFirestoreSemesters)
  );
};

export const deleteSemester = (type: FirestoreSemesterType, year: number, gtag?: GTag): void => {
  GTagEvent(gtag, 'delete-semester');
  const semester = store.state.semesters.find(sem => sem.type === type && sem.year === year);
  if (semester) {
    const courseUniqueIds = new Set(semester.courses.map(course => course.uniqueID));
    chooseSelectableRequirementOption(
      Object.assign(
        {},
        ...Object.entries(store.state.selectableRequirementChoices)
          .filter(([k]) => !courseUniqueIds.has(parseInt(k, 10)))
          .map(([k, v]) => ({ [k]: v }))
      )
    );
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
    return [...oldSemesters, createSemester(season, year, [newCourse])].sort(
      compareFirestoreSemesters
    );
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

export const chooseToggleableRequirementOption = (
  toggleableRequirementChoices: AppToggleableRequirementChoices
): void => {
  toggleableRequirementChoicesCollection
    .doc(store.state.currentFirebaseUser.email)
    .set(toggleableRequirementChoices);
};

const chooseSelectableRequirementOption = (
  selectableRequirementChoices: AppSelectableRequirementChoices
): void => {
  selectableRequirementChoicesCollection
    .doc(store.state.currentFirebaseUser.email)
    .set(selectableRequirementChoices);
};

export const addCourseToSelectableRequirements = (
  courseUniqueID: number,
  requirementID: string | undefined
): void => {
  if (!requirementID) return;
  chooseSelectableRequirementOption({
    ...store.state.selectableRequirementChoices,
    [courseUniqueID]: requirementID,
  });
};

export const deleteCourseFromSelectableRequirements = (courseUniqueID: number): void => {
  chooseSelectableRequirementOption(
    Object.assign(
      {},
      ...Object.entries(store.state.selectableRequirementChoices)
        .filter(([k]) => parseInt(k, 10) !== courseUniqueID)
        .map(([k, v]) => ({ [k]: v }))
    )
  );
};

export const setOnboardingData = (name: FirestoreUserName, onboarding: AppOnboardingData): void => {
  usernameCollection
    .doc(store.state.currentFirebaseUser.email)
    .set({
      firstName: name.firstName,
      middleName: name.middleName || '',
      lastName: name.lastName,
    })
    .then(() => store.commit('setUserName', name));
  onboardingDataCollection
    .doc(store.state.currentFirebaseUser.email)
    .set({
      gradYear: onboarding.gradYear,
      entranceYear: onboarding.entranceYear,
      colleges: [{ acronym: onboarding.college }],
      majors: onboarding.major.map(acronym => ({ acronym })),
      minors: onboarding.minor.map(acronym => ({ acronym })),
      exam: onboarding.exam,
      class: onboarding.transferCourse,
      tookSwim: onboarding.tookSwim,
    })
    .then(() => store.commit('setOnboardingData', onboarding));
};

const editAPIBExams = (
  updater: (oldAPIBExams: readonly FirestoreAPIBExam[]) => readonly FirestoreAPIBExam[]
): void => {
  const newAPIBExams = updater(store.state.onboardingData.exam);
  const newOnboardingData = {
    ...store.state.onboardingData,
    exam: newAPIBExams,
  };
  onboardingDataCollection
    .doc(store.state.currentFirebaseUser.email)
    .update({ exam: newAPIBExams })
    .then(() => {
      store.commit('setOnboardingData', newOnboardingData);
    });
};

export const addOverridenRequirementAPIB = (
  examName: string,
  optIn: boolean,
  requirementName: string,
  slotName: string,
  courseUniqueId: string
): void => {
  editAPIBExams(oldAPIBExams =>
    oldAPIBExams.map(exam => {
      if (`${exam.type} ${exam.subject}` === examName) {
        const overridenRequirements = optIn ? exam.optIn || {} : exam.optOut || {};
        if (!(requirementName in overridenRequirements)) {
          overridenRequirements[requirementName] = {};
        }
        if (!(slotName in overridenRequirements[requirementName])) {
          overridenRequirements[requirementName][slotName] = [];
        }
        overridenRequirements[requirementName][slotName] = [
          ...overridenRequirements[requirementName][slotName],
          courseUniqueId,
        ];
        if (optIn) return { ...exam, optIn: overridenRequirements };
        return { ...exam, optOut: overridenRequirements };
      }
      return exam;
    })
  );
};

export const clearOverridenRequirementsAPIB = (examName: string): void => {
  editAPIBExams(oldAPIBExams =>
    oldAPIBExams.map(exam => {
      if (`${exam.type} ${exam.subject}` === examName) {
        const { optIn, optOut, ...rest } = exam;
        return { optIn: {}, optOut: {}, ...rest };
      }
      return exam;
    })
  );
};

export const incrementUniqueID = (amount = 1): number => {
  const updatedID = store.state.uniqueIncrementer + amount;
  uniqueIncrementerCollection
    .doc(store.state.currentFirebaseUser.email)
    .set({ uniqueIncrementer: updatedID });
  return updatedID;
};
