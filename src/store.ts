import { Store } from 'vuex';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

import * as fb from './firebase-config';
import computeGroupedRequirementFulfillmentReports from './requirements/requirement-frontend-computation';
import RequirementFulfillmentGraph from './requirements/requirement-graph';
import { createAppOnboardingData } from './user-data-converter';
import {
  allocateAllSubjectColor,
  updateSubjectColor,
  checkNotNull,
  getCurrentSeason,
  getCurrentYear,
  sortedSemesters,
  isPlaceholderCourse,
  getFirstPlan,
} from './utilities';
import featureFlagCheckers from './feature-flags';
import { setUserProperties } from './gtag';

type SimplifiedFirebaseUser = { readonly displayName: string; readonly email: string };

/**
 * Some course data that can be derived from semesters, but added to the global store for efficiency
 * and ease of access.
 */
type DerivedCoursesData = {
  readonly duplicatedCourseCodeSet: ReadonlySet<string>;
  // Mapping from course's unique ID to the full course object.
  readonly courseMap: Readonly<Record<number, FirestoreSemesterCourse>>;
  // Mapping from course's unique ID to the semester object.
  readonly courseToSemesterMap: Readonly<Record<number, FirestoreSemester>>;
};

export type VuexStoreState = {
  currentFirebaseUser: SimplifiedFirebaseUser;
  userName: FirestoreUserName;
  onboardingData: AppOnboardingData;
  orderByNewest: boolean;
  derivedCoursesData: DerivedCoursesData;
  toggleableRequirementChoices: AppToggleableRequirementChoices;
  overriddenFulfillmentChoices: FirestoreOverriddenFulfillmentChoices;
  userRequirementsMap: Readonly<Record<string, RequirementWithIDSourceType>>;
  dangerousRequirementFulfillmentGraph: RequirementFulfillmentGraph<string, CourseTaken>;
  safeRequirementFulfillmentGraph: RequirementFulfillmentGraph<string, CourseTaken>;
  courseToRequirementsInConstraintViolations: ReadonlyMap<string | number, Set<string[]>>;
  doubleCountedCourseUniqueIDSet: ReadonlySet<string | number>;
  groupedRequirementFulfillmentReport: readonly GroupedRequirementFulfillmentReport[];
  subjectColors: Readonly<Record<string, string>>;
  uniqueIncrementer: number;
  isTeleportModalOpen: boolean;
  plans: readonly Plan[];
  currentPlan: Plan;
  savedCourses: readonly Collection[];
  allSavedCourses: Collection;
};

export class TypedVuexStore extends Store<VuexStoreState> {}

const store: TypedVuexStore = new TypedVuexStore({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    // We allow the initial value to be null, so that the value can be read non-null elsewhere.
    // It is only null when the application has not authenticated the user yet, which is a scanario
    // only need to be considered in Login component.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    currentFirebaseUser: null!,
    userName: { firstName: '', middleName: '', lastName: '' },
    onboardingData: {
      gradYear: '',
      gradSem: '',
      entranceYear: '',
      entranceSem: '',
      college: '',
      major: [],
      minor: [],
      grad: '',
      exam: [],
      tookSwim: 'no',
      sawNewFeature: false,
      sawGiveaway: false,
      sawScheduleGenerator: false,
    },
    orderByNewest: true,
    derivedCoursesData: {
      duplicatedCourseCodeSet: new Set(),
      courseMap: {},
      courseToSemesterMap: {},
    },
    toggleableRequirementChoices: {},
    overriddenFulfillmentChoices: {},
    userRequirementsMap: {},
    // It won't be null once the app loads.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dangerousRequirementFulfillmentGraph: null!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    safeRequirementFulfillmentGraph: null!,
    courseToRequirementsInConstraintViolations: new Map(),
    doubleCountedCourseUniqueIDSet: new Set(),
    groupedRequirementFulfillmentReport: [],
    subjectColors: {},
    uniqueIncrementer: 0,
    isTeleportModalOpen: false,
    plans: [],
    currentPlan: { name: '', semesters: [] },
    savedCourses: [],
    allSavedCourses: { name: '', courses: [] },
  },
  actions: {},
  getters: {
    getCurrentPlanSemesters(state: VuexStoreState): readonly FirestoreSemester[] {
      return state.plans.length === 0
        ? []
        : state.plans.find(p => p.name === state.currentPlan.name)?.semesters ??
            state.plans[0].semesters;
    },
  },
  mutations: {
    setCurrentFirebaseUser(state: VuexStoreState, user: SimplifiedFirebaseUser) {
      state.currentFirebaseUser = user;
    },
    setUserName(state: VuexStoreState, userName: FirestoreUserName) {
      state.userName = userName;
    },
    setOnboardingData(state: VuexStoreState, onboardingData: AppOnboardingData) {
      state.onboardingData = onboardingData;
    },
    setOrderByNewest(state: VuexStoreState, orderByNewest: boolean) {
      state.orderByNewest = orderByNewest;
    },
    setDerivedCourseData(state: VuexStoreState, data: DerivedCoursesData) {
      state.derivedCoursesData = data;
    },
    setToggleableRequirementChoices(
      state: VuexStoreState,
      toggleableRequirementChoices: AppToggleableRequirementChoices
    ) {
      state.toggleableRequirementChoices = toggleableRequirementChoices;
    },
    setOverriddenFulfillmentChoices(
      state: VuexStoreState,
      overriddenFulfillmentChoices: FirestoreOverriddenFulfillmentChoices
    ) {
      state.overriddenFulfillmentChoices = overriddenFulfillmentChoices;
    },
    setRequirementData(
      state: VuexStoreState,
      data: Pick<
        VuexStoreState,
        | 'userRequirementsMap'
        | 'dangerousRequirementFulfillmentGraph'
        | 'safeRequirementFulfillmentGraph'
        | 'courseToRequirementsInConstraintViolations'
        | 'doubleCountedCourseUniqueIDSet'
        | 'groupedRequirementFulfillmentReport'
      >
    ) {
      state.userRequirementsMap = data.userRequirementsMap;
      state.dangerousRequirementFulfillmentGraph = data.dangerousRequirementFulfillmentGraph;
      state.safeRequirementFulfillmentGraph = data.safeRequirementFulfillmentGraph;
      state.courseToRequirementsInConstraintViolations =
        data.courseToRequirementsInConstraintViolations;
      state.doubleCountedCourseUniqueIDSet = data.doubleCountedCourseUniqueIDSet;
      state.groupedRequirementFulfillmentReport = data.groupedRequirementFulfillmentReport;
    },
    setSubjectColors(state: VuexStoreState, colors: Readonly<Record<string, string>>) {
      state.subjectColors = colors;
    },
    setUniqueIncrementer(state: VuexStoreState, newIncrementerValue: number) {
      state.uniqueIncrementer = newIncrementerValue;
    },
    setIsTeleportModalOpen(state: VuexStoreState, newTeleportModalValue: boolean) {
      state.isTeleportModalOpen = newTeleportModalValue;
    },
    setPlans(state: VuexStoreState, newPlans: readonly Plan[]) {
      state.plans = newPlans;
    },
    setCurrentPlan(state: VuexStoreState, newCurrPlan: Plan) {
      state.currentPlan = newCurrPlan;
    },
    setSemesters(state: VuexStoreState, semesters: readonly FirestoreSemester[]) {
      const editedPlan: Plan = {
        name: state.currentPlan.name,
        semesters: sortedSemesters(semesters, state.orderByNewest),
      };
      const editedPlans = state.plans.map(plan =>
        plan.name === state.currentPlan.name ? editedPlan : plan
      );
      state.plans = editedPlans;
      state.currentPlan = editedPlan;
    },
    setSawNewFeature(state: VuexStoreState, seen: boolean) {
      state.onboardingData.sawNewFeature = seen;
    },
    setSavedCourses(state: VuexStoreState, newSavedCourses: readonly Collection[]) {
      state.savedCourses = newSavedCourses;
    },
    setDefaultSavedCoursesCollection(state: VuexStoreState, allSavedCourses: Collection) {
      state.allSavedCourses = allSavedCourses;
    },
    setSawGiveaway(state: VuexStoreState, seen: boolean) {
      state.onboardingData.sawGiveaway = seen;
    },
    setSawScheduleGenerator(state: VuexStoreState, seen: boolean) {
      state.onboardingData.sawScheduleGenerator = seen;
    },
  },
});

const autoRecomputeDerivedData = (): (() => void) =>
  store.subscribe((mutation, state) => {
    switch (mutation.type) {
      case 'setOnboardingData': {
        setUserProperties(mutation.payload);
        break;
      }
      case 'setOrderByNewest': {
        store.commit(
          'setSemesters',
          sortedSemesters(store.getters.getCurrentPlanSemesters, state.orderByNewest)
        );
        break;
      }
      case 'setSemesters' || 'setPlans' || 'setSavedCourses': {
        const allCourseSet = new Set<string>();
        const duplicatedCourseCodeSet = new Set<string>();
        const courseMap: Record<number, FirestoreSemesterCourse> = {};
        const courseToSemesterMap: Record<number, FirestoreSemester> = {};
        (state.plans.length === 0
          ? []
          : state.plans.find(p => p.name === state.currentPlan.name)?.semesters ??
            state.plans[0].semesters
        ).forEach(semester => {
          semester.courses.forEach(course => {
            if (isPlaceholderCourse(course)) {
              return;
            }

            const { code } = course;
            if (allCourseSet.has(code)) {
              duplicatedCourseCodeSet.add(code);
            } else {
              allCourseSet.add(code);
            }
            courseMap[course.uniqueID] = course;
            courseToSemesterMap[course.uniqueID] = semester;
          });
        });
        const derivedCourseData: DerivedCoursesData = {
          duplicatedCourseCodeSet,
          courseMap,
          courseToSemesterMap,
        };
        store.commit('setDerivedCourseData', derivedCourseData);
        break;
      }
      default:
    }
    // Recompute requirements
    if (
      mutation.type === 'setOnboardingData' ||
      mutation.type === 'setSemesters' ||
      mutation.type === 'setToggleableRequirementChoices' ||
      mutation.type === 'setOverriddenFulfillmentChoices' ||
      mutation.type === 'setCurrentPlan' ||
      mutation.type === 'setPlans' ||
      mutation.type === 'setDefaultSavedCoursesCollection' ||
      mutation.type === 'setSavedCourses'
    ) {
      if (state.onboardingData.college !== '') {
        store.commit(
          'setRequirementData',
          computeGroupedRequirementFulfillmentReports(
            state.plans.length === 0
              ? []
              : state.plans.find(p => p.name === state.currentPlan.name)?.semesters ??
                  state.plans[0].semesters,
            state.onboardingData,
            state.toggleableRequirementChoices,
            state.overriddenFulfillmentChoices
          )
        );
      }
    }
  });

export const initializeFirestoreListeners = (onLoad: () => void): (() => void) => {
  const simplifiedUser = store.state.currentFirebaseUser;

  let userNameInitialLoadFinished = false;
  let onboardingDataInitialLoadFinished = false;
  let semestersInitialLoadFinished = false;
  let orderByNewestInitialLoadFinished = false;
  let toggleableRequirementChoiceInitialLoadFinished = false;
  let overriddenFulfillmentChoiceInitialLoadFinished = false;
  let subjectColorInitialLoadFinished = false;
  let uniqueIncrementerInitialLoadFinished = false;

  let emitted = false;

  const emitOnLoadWhenLoaded = (): void => {
    if (
      userNameInitialLoadFinished &&
      onboardingDataInitialLoadFinished &&
      semestersInitialLoadFinished &&
      orderByNewestInitialLoadFinished &&
      toggleableRequirementChoiceInitialLoadFinished &&
      overriddenFulfillmentChoiceInitialLoadFinished &&
      subjectColorInitialLoadFinished &&
      uniqueIncrementerInitialLoadFinished &&
      !emitted
    ) {
      emitted = true;
      onLoad();
    }
  };

  const userNameUnsubscriber = onSnapshot(
    doc(fb.usernameCollection, simplifiedUser.email),
    snapshot => {
      const data = snapshot.data();
      if (data) {
        store.commit('setUserName', data);
      } else {
        const [firstName, lastName] = simplifiedUser.displayName.split(' ');
        store.commit('setUserName', { firstName, middleName: '', lastName });
      }
      userNameInitialLoadFinished = true;
      emitOnLoadWhenLoaded();
    }
  );
  const onboardingDataUnsubscriber = onSnapshot(
    doc(fb.onboardingDataCollection, simplifiedUser.email),
    snapshot => {
      const data = snapshot.data();
      if (data) {
        store.commit('setOnboardingData', createAppOnboardingData(data));
      }
      onboardingDataInitialLoadFinished = true;
      emitOnLoadWhenLoaded();
    }
  );
  getDoc(doc(fb.semestersCollection, simplifiedUser.email)).then(snapshot => {
    const data = snapshot.data();
    if (data) {
      const plan = getFirstPlan(data);
      store.commit('setPlans', data.plans);
      store.commit('setCurrentPlan', plan);
      store.commit('setSavedCourses', data.savedCourses);
      const { orderByNewest } = data;
      store.commit('setSemesters', plan.semesters);
      updateDoc(doc(fb.semestersCollection, simplifiedUser.email), {
        plans: data.plans,
        savedCourses: data.savedCourses,
      });
      // if user hasn't yet chosen an ordering, choose true by default
      store.commit('setOrderByNewest', orderByNewest === undefined ? true : orderByNewest);
    } else {
      const plans = [{ name: 'Plan 1', semesters: [] }];
      const savedCourses = [{ name: 'All', courses: [] }];
      store.commit('setPlans', plans);
      store.commit('setCurrentPlan', plans[0]);
      store.commit('setSavedCourses', savedCourses);
      store.commit('setDefaultSavedCoursesCollection', savedCourses[0]);
      const newSemester: FirestoreSemester = {
        year: getCurrentYear(),
        season: getCurrentSeason(),
        courses: [],
      };
      store.commit('setSemesters', [newSemester]);
      setDoc(doc(fb.semestersCollection, simplifiedUser.email), {
        orderByNewest: true,
        plans: [{ name: 'Plan 1', semesters: [newSemester] }],
        semesters: [newSemester],
        savedCourses: [{ name: 'All', courses: [] }],
      });
    }
    semestersInitialLoadFinished = true;
    orderByNewestInitialLoadFinished = true;
    emitOnLoadWhenLoaded();
  });
  const toggleableRequirementChoiceUnsubscriber = onSnapshot(
    doc(fb.toggleableRequirementChoicesCollection, simplifiedUser.email),
    snapshot => {
      const toggleableRequirementChoices = snapshot.data() || {};
      store.commit('setToggleableRequirementChoices', toggleableRequirementChoices);
      toggleableRequirementChoiceInitialLoadFinished = true;
      emitOnLoadWhenLoaded();
    }
  );
  const overriddenFulfillmentChoiceUnsubscriber = onSnapshot(
    doc(fb.overriddenFulfillmentChoicesCollection, simplifiedUser.email),
    snapshot => {
      const overriddenFulfillmentChoices = snapshot.data() || {};
      store.commit('setOverriddenFulfillmentChoices', overriddenFulfillmentChoices);
      overriddenFulfillmentChoiceInitialLoadFinished = true;
      emitOnLoadWhenLoaded();
    }
  );
  getDoc(doc(fb.subjectColorsCollection, simplifiedUser.email)).then(snapshot => {
    const subjectColors = snapshot.data() || {};
    // Pre-allocate all subject colors during this initialization step.
    const newSubjectColors = allocateAllSubjectColor(subjectColors);
    store.commit('setSubjectColors', newSubjectColors);
    setDoc(doc(fb.subjectColorsCollection, simplifiedUser.email), newSubjectColors);
    subjectColorInitialLoadFinished = true;
    emitOnLoadWhenLoaded();
  });
  const uniqueIncrementerUnsubscriber = onSnapshot(
    doc(fb.uniqueIncrementerCollection, simplifiedUser.email),
    snapshot => {
      const data = snapshot.data();
      store.commit('setUniqueIncrementer', data == null ? 0 : data.uniqueIncrementer);
      uniqueIncrementerInitialLoadFinished = true;
      emitOnLoadWhenLoaded();
    }
  );
  const derivedDataComputationUnsubscriber = autoRecomputeDerivedData();

  const unsubscriber = () => {
    userNameUnsubscriber();
    onboardingDataUnsubscriber();
    toggleableRequirementChoiceUnsubscriber();
    overriddenFulfillmentChoiceUnsubscriber();
    uniqueIncrementerUnsubscriber();
    derivedDataComputationUnsubscriber();
  };
  return unsubscriber;
};

export const updateSubjectColorData = (color: string, code: string): void => {
  const simplifiedUser = store.state.currentFirebaseUser;
  getDoc(doc(fb.subjectColorsCollection, simplifiedUser.email)).then(snapshot => {
    const subjectColors = snapshot.data() || {};
    const newSubjectColors = updateSubjectColor(subjectColors, color, code);
    store.commit('setSubjectColors', newSubjectColors);
    setDoc(doc(fb.subjectColorsCollection, simplifiedUser.email), newSubjectColors);
  });
};

export const isCourseConflict = (uniqueId: string | number): boolean =>
  featureFlagCheckers.isRequirementConflictsEnabled() &&
  store.state.doubleCountedCourseUniqueIDSet.has(uniqueId);

fb.auth.onAuthStateChanged(user => {
  if (user) {
    const simplifiedUser = {
      displayName: checkNotNull(user.displayName),
      email: checkNotNull(user.email),
    };
    store.commit('setCurrentFirebaseUser', simplifiedUser);
  }
});

export default store;
