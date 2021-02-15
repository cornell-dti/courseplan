import store from '../store';
import { CREDITS_COURSE_ID, FWS_COURSE_ID } from './data/constants';
import getCourseEquivalentsFromUserExams from './data/exams/ExamCredit';
import buildRequirementFulfillmentGraphFromUserData from './requirement-graph-builder-from-user-data';
import {
  CourseTaken,
  EligibleCourses,
  DecoratedCollegeOrMajorRequirement,
  RequirementFulfillmentStatistics,
  GroupedRequirementFulfillmentReport,
} from './types';

type FulfillmentStatistics = {
  readonly requirement: RequirementWithIDSourceType;
  readonly courses: readonly (readonly CourseTaken[])[];
} & RequirementFulfillmentStatistics;

/**
 * @param course course object with useful information retrived from Cornell courses API.
 * @returns true if the course is AP/IB equivalent course or credit
 */
const courseIsAPIB = (course: CourseTaken): boolean =>
  [CREDITS_COURSE_ID, FWS_COURSE_ID].includes(course.courseId) ||
  ['AP', 'IB', 'CREDITS'].includes(course.subject);

/**
 * Used for total academic credit requirements for all colleges except EN and AR
 * @param course course object with useful information retrived from Cornell courses API.
 * @returns true if the course is not PE or 10** level
 */
const courseIsAllEligible = (course: CourseTaken): boolean =>
  course.courseId === CREDITS_COURSE_ID ||
  (!courseIsAPIB(course) && course.subject !== 'PE' && !course.number.startsWith('10'));

const getTotalCreditsFulfillmentStatistics = (
  college: string,
  courses: readonly CourseTaken[]
): FulfillmentStatistics | null => {
  const requirementCommon = {
    sourceType: 'College',
    sourceSpecificName: college,
    name: 'Total Academic Credits',
    courses: [],
    subRequirementProgress: 'any-can-count',
    fulfilledBy: 'credits',
    minCount: 120,
  } as const;
  let requirement: RequirementWithIDSourceType;
  switch (college) {
    case 'AG':
      requirement = {
        ...requirementCommon,
        id: 'College-AG-total-credits',
        description:
          '120 academic credits are required for graduation. ' +
          'A minimum of 100 credits must be in courses for which a letter grade was recieved. ' +
          'PE courses do not count.',
        source: 'http://courses.cornell.edu/content.php?catoid=41&navoid=11561',
      };
      break;
    case 'AS':
      requirement = {
        ...requirementCommon,
        id: 'College-AS-total-credits',
        description:
          '120 academic credits are required. ' +
          'PE courses and courses numbered 1000-1099 do not count towards the 120 credits.',
        source: 'http://courses.cornell.edu/content.php?catoid=41&navoid=11570#credit-req',
      };
      break;
    case 'HE':
      requirement = {
        ...requirementCommon,
        id: 'College-HE-total-credits',
        description:
          '120 academic credits are required. ' +
          'PE courses and courses numbered 1000-1099 do not count towards the 120 credits.',
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
          'PE courses and courses numbered 1000-1099 do not count towards the 120 credits.',
        source: 'http://courses.cornell.edu/content.php?catoid=41&navoid=11587',
      };
      break;
    case 'BU':
      requirement = {
        ...requirementCommon,
        id: 'College-BU-total-credits',
        description:
          '120 academic credits are required. ' +
          'PE courses and courses numbered 1000-1099 do not count towards the 120 credits.',
        source: 'http://courses.cornell.edu/content.php?catoid=41&navoid=11715',
      };
      break;
    default:
      return null;
  }

  let minCountFulfilled = 0;
  let minCountRequired = 120;
  const courseCodeSet = new Set<string>();
  const eligibleCourses =
    college === 'AG'
      ? courses.filter(course => course.subject !== 'PE')
      : courses.filter(courseIsAllEligible);

  eligibleCourses.forEach(course => {
    minCountFulfilled += course.credits;
    const code = `${course.subject} ${course.number}`;
    if (courseCodeSet.has(code)) {
      minCountRequired += course.credits;
    } else {
      courseCodeSet.add(code);
    }
  });

  return {
    requirement,
    courses: [],
    fulfilledBy: 'credits',
    minCountFulfilled,
    minCountRequired,
  };
};

function computeFulfillmentStatisticsFromCourses(
  coursesThatFulfilledRequirement: readonly (readonly CourseTaken[])[],
  counting: 'courses' | 'credits',
  subRequirementProgress: 'every-course-needed' | 'any-can-count',
  minCountRequired: number
): RequirementFulfillmentStatistics & { readonly courses: readonly (readonly CourseTaken[])[] } {
  let minCountFulfilled = 0;
  coursesThatFulfilledRequirement.forEach(coursesThatFulfilledSubRequirement => {
    if (coursesThatFulfilledSubRequirement.length === 0) {
      return;
    }

    switch (counting) {
      case 'courses':
        minCountFulfilled +=
          subRequirementProgress === 'any-can-count'
            ? coursesThatFulfilledSubRequirement.length
            : 1;
        break;
      case 'credits':
        minCountFulfilled +=
          subRequirementProgress === 'any-can-count'
            ? coursesThatFulfilledSubRequirement
                .map(course => course.credits)
                .reduce((a, b) => a + b, 0)
            : coursesThatFulfilledSubRequirement
                .map(course => course.credits)
                .reduce((a, b) => a + b);
        break;
      default:
        throw new Error('Fulfillment type unknown.');
    }
  });

  return {
    fulfilledBy: counting,
    minCountFulfilled,
    minCountRequired,
    courses: coursesThatFulfilledRequirement,
  };
}

/**
 * @param coursesTaken a list of all taken courses.
 * @param requirementCourses a list of eligible courses from requirement data.
 * @returns a naively computed list of courses that fulfill the requirement, partitioned into sub-requirement filfillment.
 */
function filterAndPartitionCoursesThatFulfillRequirement(
  coursesTaken: readonly CourseTaken[],
  requirementCourses: readonly EligibleCourses[]
): CourseTaken[][] {
  const coursesThatFulfilledRequirement: CourseTaken[][] = requirementCourses.map(() => []);
  coursesTaken.forEach(courseTaken => {
    const { roster, courseId } = courseTaken;
    requirementCourses.forEach((subRequirementCourses, subRequirementIndex) => {
      if (subRequirementCourses[roster] && subRequirementCourses[roster].includes(courseId)) {
        // add the course to the list of courses used to fulfill that one sub-requirement
        coursesThatFulfilledRequirement[subRequirementIndex].push(courseTaken);
      }
    });
  });
  return coursesThatFulfilledRequirement;
}

type RequirementWithIDSourceType = DecoratedCollegeOrMajorRequirement & {
  readonly id: string;
  readonly sourceType: 'College' | 'Major' | 'Minor';
  readonly sourceSpecificName: string;
};

function computeFulfillmentCoursesAndStatistics(
  requirement: RequirementWithIDSourceType,
  coursesTaken: readonly CourseTaken[]
): RequirementFulfillmentStatistics & { readonly courses: readonly (readonly CourseTaken[])[] } {
  switch (requirement.fulfilledBy) {
    case 'self-check':
      // Give self-check 1 required course and 0 fulfilled to prevent it from being fulfilled.
      return { fulfilledBy: 'self-check', minCountFulfilled: 0, minCountRequired: 1, courses: [] };
    case 'courses':
    case 'credits':
      return computeFulfillmentStatisticsFromCourses(
        filterAndPartitionCoursesThatFulfillRequirement(coursesTaken, requirement.courses),
        requirement.fulfilledBy,
        requirement.subRequirementProgress,
        requirement.minCount
      );
    case 'toggleable': {
      const option =
        requirement.fulfillmentOptions[
          store.state.toggleableRequirementChoices[requirement.id] ||
            Object.keys(requirement.fulfillmentOptions)[0]
        ];
      return computeFulfillmentStatisticsFromCourses(
        filterAndPartitionCoursesThatFulfillRequirement(coursesTaken, option.courses),
        option.counting,
        option.subRequirementProgress,
        option.minCount
      );
    }
    default:
      throw new Error();
  }
}

function getCourseCodesArray(): readonly CourseTaken[] {
  const courses: CourseTaken[] = [];
  store.state.semesters.forEach(semester => {
    semester.courses.forEach(course => {
      const [subject, number] = course.code.split(' ');
      courses.push({
        code: `${course.lastRoster}: ${subject} ${number}`,
        subject,
        courseId: course.crseId,
        number,
        credits: course.credits,
        roster: course.lastRoster,
      });
    });
  });
  courses.push(...getCourseEquivalentsFromUserExams(store.state.onboardingData));
  return courses;
}

/**
 * @param coursesTaken a list of classes taken by the user, with some metadata (e.g. no. of credits)
 * helping to compute requirement progress.
 * @param college user's college.
 * @param majors user's list of majors.
 * @param minors user's list of minors.
 * @returns all requirements fulfillments, grouped by University, College, Major.
 */
export default function computeRequirements(): readonly GroupedRequirementFulfillmentReport[] {
  const coursesTaken = getCourseCodesArray();
  const { college } = store.state.onboardingData;

  const { requirementFulfillmentGraph } = buildRequirementFulfillmentGraphFromUserData(
    coursesTaken
  );

  const collegeFulfillmentStatistics: FulfillmentStatistics[] = [];
  const totalCreditsFulfillmentStatistics = getTotalCreditsFulfillmentStatistics(
    college,
    coursesTaken
  );
  if (totalCreditsFulfillmentStatistics != null) {
    collegeFulfillmentStatistics.push(totalCreditsFulfillmentStatistics);
  }
  const majorFulfillmentStatisticsMap = new Map<string, FulfillmentStatistics[]>();
  const minorFulfillmentStatisticsMap = new Map<string, FulfillmentStatistics[]>();
  requirementFulfillmentGraph.getAllRequirements().forEach(requirement => {
    const courses = requirementFulfillmentGraph.getConnectedCoursesFromRequirement(requirement);
    const fulfillmentStatistics = {
      id: requirement.id,
      requirement,
      ...computeFulfillmentCoursesAndStatistics(requirement, courses),
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
      default:
        throw new Error();
    }
  });

  return [
    { groupName: 'College', specific: college, reqs: collegeFulfillmentStatistics },
    ...Array.from(majorFulfillmentStatisticsMap.entries()).map(
      ([majorName, fulfillmentStatistics]) =>
        ({ groupName: 'Major', specific: majorName, reqs: fulfillmentStatistics } as const)
    ),
    ...Array.from(minorFulfillmentStatisticsMap.entries()).map(
      ([minorName, fulfillmentStatistics]) =>
        ({ groupName: 'Minor', specific: minorName, reqs: fulfillmentStatistics } as const)
    ),
  ];
}
