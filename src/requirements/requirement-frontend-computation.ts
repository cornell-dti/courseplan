import { isPlaceholderCourse } from '../utilities';
import { SWIM_TEST_COURSE_ID } from './data/constants';
import userDataToExamCourses from './requirement-exam-utils';
import {
  courseIsAPIB,
  convertFirestoreSemesterCourseToCourseTaken,
  computeFulfillmentCoursesAndStatistics,
} from './requirement-frontend-utils';
import RequirementFulfillmentGraph from './requirement-graph';
import buildRequirementFulfillmentGraphFromUserData from './requirement-graph-builder-from-user-data';

/**
 * Used for total academic credit requirements for all colleges except EN and AR
 * @param course course object with useful information retrived from Cornell courses API.
 * @returns true if the course is not PE or 10** level
 */
const courseIsAllEligible = (course: CourseTaken): boolean => {
  if (courseIsAPIB(course)) return true;
  const [subject, number] = course.code.split(' ');
  return subject !== 'PE' && !number.startsWith('10');
};

const getTotalCreditsFulfillmentStatistics = (
  college: string,
  courses: readonly CourseTaken[]
): RequirementFulfillment | null => {
  const requirementCommon = {
    sourceType: 'College',
    sourceSpecificName: college,
    name: 'Total Academic Credits',
    courses: [[]],
    fulfilledBy: 'credits',
    perSlotMinCount: [120],
  } as const;
  let requirement: RequirementWithIDSourceType;
  switch (college) {
    case 'AG':
      requirement = {
        ...requirementCommon,
        id: 'College-AG-total-credits',
        description:
          '120 academic credits are required for graduation. ' +
          'PE courses and courses numbered 1000-1099 do not count towards the 120 credits. ' +
          'Repeated courses may not apply to this requirement, but we do not check this.',
        source: 'http://courses.cornell.edu/content.php?catoid=41&navoid=11561',
      };
      break;
    case 'AS1':
      requirement = {
        ...requirementCommon,
        id: 'College-AS1-total-credits',
        description:
          '120 academic credits are required. ' +
          'PE courses and courses numbered 1000-1099 do not count towards the 120 credits. ' +
          'Repeated courses may not apply to this requirement, but we do not check this.',
        source: 'http://courses.cornell.edu/content.php?catoid=41&navoid=11570#credit-req',
      };
      break;
    // case 'AS2':
    //   requirement = {
    //     ...requirementCommon,
    //     id: 'College-AS2-total-credits',
    //     description:
    //       '120 academic credits are required. ' +
    //       'PE courses and courses numbered 1000-1099 do not count towards the 120 credits.',
    //     source: 'http://courses.cornell.edu/content.php?catoid=41&navoid=11570#credit-req',
    //   };
    //   break;
    case 'HE':
      requirement = {
        ...requirementCommon,
        id: 'College-HE-total-credits',
        description:
          '120 academic credits are required. ' +
          'PE courses and courses numbered 1000-1099 do not count towards the 120 credits. ' +
          'Repeated courses may not apply to this requirement, but we do not check this.',
        source:
          'http://courses.cornell.edu/content.php?catoid=41&navoid=11600#Cornell_Credit_Requirements',
      };
      break;
    case 'IL':
      requirement = {
        ...requirementCommon,
        id: 'College-IL-total-credits',
        description:
          '120 academic credits are required. ' +
          'PE courses and courses numbered 1000-1099 do not count towards the 120 credits. ' +
          'Repeated courses may not apply to this requirement, but we do not check this.',
        source: 'http://courses.cornell.edu/content.php?catoid=41&navoid=11587',
      };
      break;
    case 'BU':
      requirement = {
        ...requirementCommon,
        id: 'College-BU-total-credits',
        description:
          '120 academic credits are required. ' +
          'PE courses and courses numbered 1000-1099 do not count towards the 120 credits. ' +
          'Repeated courses may not apply to this requirement, but we do not check this.',
        source: 'http://courses.cornell.edu/content.php?catoid=41&navoid=11715',
      };
      break;
    default:
      return null;
  }

  let minCountFulfilled = 0;
  const minCountRequired = 120;
  const eligibleCourses = courses.filter(courseIsAllEligible);

  eligibleCourses.forEach(course => {
    minCountFulfilled += course.credits;
  });

  return {
    requirement,
    fulfillment: {
      fulfilledBy: 'credits',
      safeCourses: [[]],
      dangerousCourses: [[]],
      safeMinCountFulfilled: minCountFulfilled,
      dangerousMinCountFulfilled: minCountFulfilled,
      minCountRequired,
    },
  };
};

const getSwimTestFulfillmentStatistics = (
  college: string,
  courses: readonly CourseTaken[],
  tookSwimTest: boolean
): RequirementFulfillment => {
  const requirement: RequirementWithIDSourceType = {
    id: 'College-UNI-SwimTest',
    sourceType: 'College',
    sourceSpecificName: college,
    name: 'Swim Test',
    description:
      'The Faculty Advisory Committee on Athletics and Physical Education has established a basic swimming ' +
      'and water safety competency requirement for all entering first-year undergraduate students.',
    source: 'http://courses.cornell.edu/content.php?catoid=41&navoid=11637',
    courses: [[SWIM_TEST_COURSE_ID]],
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  };
  const swimClasses = courses.filter(it => it.courseId === SWIM_TEST_COURSE_ID);
  if (tookSwimTest) {
    swimClasses.push({
      courseId: SWIM_TEST_COURSE_ID,
      uniqueId: -1,
      code: 'Swim Test',
      credits: 0,
    });
  }
  const minCountFulfilled = swimClasses.length > 0 ? 1 : 0;
  return {
    requirement,
    fulfillment: {
      fulfilledBy: 'courses',
      safeCourses: [swimClasses],
      dangerousCourses: [swimClasses],
      safeMinCountFulfilled: minCountFulfilled,
      dangerousMinCountFulfilled: minCountFulfilled,
      minCountRequired: 1,
    },
  };
};

export function getCourseCodesArray(
  semesters: readonly FirestoreSemester[],
  onboardingData: AppOnboardingData
): readonly CourseTaken[] {
  const courses: CourseTaken[] = [];
  semesters.forEach(semester => {
    semester.courses.forEach(course => {
      if (!isPlaceholderCourse(course)) {
        courses.push(convertFirestoreSemesterCourseToCourseTaken(course));
      }
    });
  });
  courses.push(...userDataToExamCourses(onboardingData));
  return courses;
}

function mergeRequirementFulfillmentStatisticsWithAdditionalRequirements(
  dangerous: RequirementFulfillmentStatisticsWithCoursesWithAdditionalRequirements,
  safe: RequirementFulfillmentStatisticsWithCoursesWithAdditionalRequirements
): MixedRequirementFulfillmentStatisticsWithAdditionalRequirements {
  function mergeRequirementFulfillmentStatistics(
    {
      fulfilledBy,
      minCountFulfilled: dangerousMinCountFulfilled,
      minCountRequired,
      courses: dangerousCourses,
    }: RequirementFulfillmentStatisticsWithCourses,
    {
      minCountFulfilled: safeMinCountFulfilled,
      courses: safeCourses,
    }: RequirementFulfillmentStatisticsWithCourses
  ): MixedRequirementFulfillmentStatistics {
    return {
      fulfilledBy,
      safeCourses,
      dangerousCourses,
      safeMinCountFulfilled,
      dangerousMinCountFulfilled,
      minCountRequired,
    };
  }

  const base = mergeRequirementFulfillmentStatistics(dangerous, safe);
  if (dangerous.additionalRequirements == null) return base;
  const safeAdditionalRequirements = safe.additionalRequirements || {};
  return {
    ...base,
    additionalRequirements: Object.fromEntries(
      Object.entries(
        dangerous.additionalRequirements
      ).map(([key, dangerousAdditionalRequirement]) => [
        key,
        mergeRequirementFulfillmentStatistics(
          dangerousAdditionalRequirement,
          safeAdditionalRequirements[key]
        ),
      ])
    ),
  };
}

/** Compute everything needed for displaying requirement on the frontend. */
export default function computeGroupedRequirementFulfillmentReports(
  semesters: readonly FirestoreSemester[],
  onboardingData: AppOnboardingData,
  toggleableRequirementChoices: AppToggleableRequirementChoices,
  overriddenFulfillmentChoices: FirestoreOverriddenFulfillmentChoices
): {
  readonly userRequirementsMap: Readonly<Record<string, RequirementWithIDSourceType>>;
  readonly dangerousRequirementFulfillmentGraph: RequirementFulfillmentGraph<string, CourseTaken>;
  readonly safeRequirementFulfillmentGraph: RequirementFulfillmentGraph<string, CourseTaken>;
  readonly doubleCountedCourseUniqueIDSet: ReadonlySet<string | number>;
  readonly groupedRequirementFulfillmentReport: readonly GroupedRequirementFulfillmentReport[];
} {
  const coursesTaken = getCourseCodesArray(semesters, onboardingData);
  const { college } = onboardingData;

  const {
    userRequirements,
    dangerousRequirementFulfillmentGraph,
    safeRequirementFulfillmentGraph,
    doubleCountedCourseUniqueIDSet,
  } = buildRequirementFulfillmentGraphFromUserData(
    coursesTaken,
    onboardingData,
    toggleableRequirementChoices,
    overriddenFulfillmentChoices
  );

  const collegeFulfillmentStatistics: RequirementFulfillment[] = [];
  const totalCreditsFulfillmentStatistics = college
    ? getTotalCreditsFulfillmentStatistics(college, coursesTaken)
    : null;
  if (totalCreditsFulfillmentStatistics != null) {
    collegeFulfillmentStatistics.push(totalCreditsFulfillmentStatistics);
  }
  if (college)
    collegeFulfillmentStatistics.push(
      getSwimTestFulfillmentStatistics(college, coursesTaken, onboardingData.tookSwim === 'yes')
    );
  const majorFulfillmentStatisticsMap = new Map<string, RequirementFulfillment[]>();
  const minorFulfillmentStatisticsMap = new Map<string, RequirementFulfillment[]>();
  const gradFulfillmentStatisticsMap = new Map<string, RequirementFulfillment[]>();
  userRequirements.forEach(requirement => {
    const dangerousRequirementFulfillmentStatistics = computeFulfillmentCoursesAndStatistics(
      requirement,
      dangerousRequirementFulfillmentGraph.getConnectedCoursesFromRequirement(requirement.id),
      toggleableRequirementChoices,
      overriddenFulfillmentChoices
    );
    const safeRequirementFulfillmentStatistics = computeFulfillmentCoursesAndStatistics(
      requirement,
      safeRequirementFulfillmentGraph.getConnectedCoursesFromRequirement(requirement.id),
      toggleableRequirementChoices,
      overriddenFulfillmentChoices
    );
    const fulfillmentStatistics: RequirementFulfillment = {
      requirement,
      fulfillment: mergeRequirementFulfillmentStatisticsWithAdditionalRequirements(
        dangerousRequirementFulfillmentStatistics,
        safeRequirementFulfillmentStatistics
      ),
    };

    switch (requirement.sourceType) {
      case 'College':
        collegeFulfillmentStatistics.push(fulfillmentStatistics);
        break;
      case 'Major': {
        const existingArray = majorFulfillmentStatisticsMap.get(requirement.sourceSpecificName);
        if (existingArray != null) {
          existingArray.push(fulfillmentStatistics);
        } else {
          majorFulfillmentStatisticsMap.set(requirement.sourceSpecificName, [
            fulfillmentStatistics,
          ]);
        }
        break;
      }
      case 'Minor': {
        const existingArray = minorFulfillmentStatisticsMap.get(requirement.sourceSpecificName);
        if (existingArray != null) {
          existingArray.push(fulfillmentStatistics);
        } else {
          minorFulfillmentStatisticsMap.set(requirement.sourceSpecificName, [
            fulfillmentStatistics,
          ]);
        }
        break;
      }
      case 'Grad': {
        const existingArray = gradFulfillmentStatisticsMap.get(requirement.sourceSpecificName);
        if (existingArray != null) {
          existingArray.push(fulfillmentStatistics);
        } else {
          gradFulfillmentStatisticsMap.set(requirement.sourceSpecificName, [fulfillmentStatistics]);
        }
        break;
      }
      default:
        throw new Error();
    }
  });

  const groupedRequirementFulfillmentReport: GroupedRequirementFulfillmentReport[] = [
    ...Array.from(majorFulfillmentStatisticsMap.entries()).map(
      ([majorName, fulfillmentStatistics]) =>
        ({ groupName: 'Major', specific: majorName, reqs: fulfillmentStatistics } as const)
    ),
    ...Array.from(minorFulfillmentStatisticsMap.entries()).map(
      ([minorName, fulfillmentStatistics]) =>
        ({ groupName: 'Minor', specific: minorName, reqs: fulfillmentStatistics } as const)
    ),
    ...Array.from(gradFulfillmentStatisticsMap.entries()).map(
      ([gradName, fulfillmentStatistics]) =>
        ({ groupName: 'Grad', specific: gradName, reqs: fulfillmentStatistics } as const)
    ),
  ];

  // college may be undefined if the user has only selected a grad program
  // note that order matters, so unshift is used to ensure the college group is put at the front of the fulfillment report
  if (college) {
    groupedRequirementFulfillmentReport.unshift({
      groupName: 'College',
      specific: college,
      reqs: collegeFulfillmentStatistics,
    });
  }

  return {
    userRequirementsMap: Object.fromEntries(userRequirements.map(it => [it.id, it])),
    dangerousRequirementFulfillmentGraph,
    safeRequirementFulfillmentGraph,
    doubleCountedCourseUniqueIDSet,
    groupedRequirementFulfillmentReport,
  };
}
