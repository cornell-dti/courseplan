import { Course, CollegeOrMajorRequirement } from '../../requirements/types';
import { courseMatchesCodeOptions, includesWithSubRequirements } from '../../requirements/checkers';
import { AdvisorGroup } from '../../tools/advisors/types';

const hbhsRequirements: readonly CollegeOrMajorRequirement[] = [
  {
    name: 'HBHS Introductory Course',
    description: 'NS 1400 Introduction to Human Biology, Health, and Society',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    checker: includesWithSubRequirements(['NS 1400']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'HBHS Survey Course',
    description: 'NS 1150 or NS 1220',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    checker: includesWithSubRequirements(['NS 1150', 'NS 1220']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'Introductory Chemistry',
    description:
      'Students in the major must take CHEM 2070 & CHEM 2080 or CHEM 2150 with AP Chemistry credit. ' +
      'Students, especially those on the pre-health track, are recommended to take CHEM 2070 - CHEM 2080 and forfeit AP credit.',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    fulfilledBy: 'courses',
    checker: includesWithSubRequirements(['CHEM 2070'], ['CHEM 2080', 'CHEM 2150']),
    perSlotMinCount: [1, 1],
    slotNames: ['CHEM 2070 or AP credit', 'CHEM 2080 or CHEM 2150'],
  },
  {
    name: 'Introductory Biology',
    description: 'BIOG 1500 or BIOSM 1500',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    checker: includesWithSubRequirements(['BIOG 1500', 'BIOSM 1500']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['BIOG 1500 or BIOSM 150'],
  },
  {
    name: 'Introductory Biology Lecture',
    description:
      'Students must take 2 lectures coming from two of the three categories (Cell and Development, Comparative Physiology, and Ecology and Evolutionary).' +
      'Also, students may use an AP Biology score of 5 or IB HL Biology score of 7 to place out of one introductory biology lecture. Pre-health students should not use AP scores to fulfill biology requirements.',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      'Option 1': {
        description:
          'Lectures in Cell and Development and Comparative Physiology or Ecology and Evolutionary',
        checker: includesWithSubRequirements(
          ['BIOMG 1350'],
          ['BIOG 1440, BIOG 1445, BIOEE 1610, BIOEE 1780']
        ),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['BIOMG 1350', 'BIOG 1440, BIOG 1445, BIOEE 1610, or BIOEE 1780'],
      },
      'Option 2': {
        description: 'Lectures in Comparitive Physiology and Ecology and Evolutionary',
        checker: includesWithSubRequirements(['BIOG 1440, BIOG 1445'], ['BIOEE 1610, BIOEE 1780']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['BIOG 1440 or BIOG 1445', 'BIOEE 1610 or BIOEE 1780'],
      },
      'Option 3': {
        description:
          'AP Credit and one lecture in Cell and Development, Comparative Physiology, or Ecology and Evolutionary',
        checker: includesWithSubRequirements([
          'BIOMG 1350, BIOG 1440, BIOG 1445, BIOEE 1610, BIOEE 1780',
        ]),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Introductory Biology Lecture'],
      },
    },
  },
  {
    name: 'Physics',
    description:
      'PHYS 1101 or PHYS 2207. Students interested in pre-health tracks should also take PHYS 1102 or PHYS 2208.',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    checker: includesWithSubRequirements(['PHYS 1101', 'PHYS 2207']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['PHYS 1101 or PHYS 2207'],
  },
  {
    name: 'Organic Chemistry Lecture',
    description:
      'Students in the major must take one of the following sequences. Students interested in pre-health tracks should take a two-course sequence of organic chemistry lectures' +
      'Students taking a two-course sequence must take both courses in the sequence as one course alone will not fulfill the requirement.',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      'Option 1': {
        description: 'CHEM 1570',
        checker: includesWithSubRequirements(['CHEM 1570']),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Course'],
      },
      'Option 2': {
        description: 'CHEM 3530',
        checker: includesWithSubRequirements(['CHEM 3530']),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Course'],
      },
      'Option 3': {
        description: 'CHEM 3570 AND CHEM 3580',
        checker: includesWithSubRequirements(['CHEM 3570'], ['CHEM 3580']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['CHEM 3570', 'CHEM 3580'],
      },
      'Option 4': {
        description: 'CHEM 3590 AND CHEM 3600',
        checker: includesWithSubRequirements(['CHEM 3590'], ['CHEM 3600']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['CHEM 3590', 'CHEM 3600'],
      },
    },
  },
  {
    name: 'Organic Chemistry Lab',
    description: 'CHEM 2510 or CHEM 3010',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    checker: includesWithSubRequirements(['BIOG 2510', 'BIOSM 3010']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['BIOG 2510 or BIOSM 3010'],
  },
  {
    name: 'Physiology',
    description:
      'NS 3410 or BIOAP 3110. Pre-health students might also consider taking NS 3420 Human Anatomy and Physiology Lab (2 cr), which also counts toward advanced biology elective requirement',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    checker: includesWithSubRequirements(['NS 3410', 'BIOAP 3110']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['NS 3410 or BIOAP 3110'],
  },
  {
    name: 'Biochemistry',
    description: 'Students in the major must take one of the following sequences.',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      'Option 1': {
        description: 'NS 3200',
        checker: includesWithSubRequirements(['NS 3200']),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Course'],
      },
      'Option 2': {
        description: 'BIOMG 3300',
        checker: includesWithSubRequirements(['BIOMG 3300']),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Course'],
      },
      'Option 3': {
        description: 'BIOMG 3310 AND BIOMG 3320',
        checker: includesWithSubRequirements(['BIOMG 3310'], ['BIOMG 3320']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['BIOMG 3310', 'BIOMG 3320'],
      },
      'Option 4': {
        description: 'BIOMG 3310 AND BIOMI 2900',
        checker: includesWithSubRequirements(['BIOMG 3310'], ['BIOMI 2900']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['BIOMG 3310', 'BIOMI 2900'],
      },
      'Option 5': {
        description: 'BIOMG 3330',
        checker: includesWithSubRequirements(['BIOMG 3330']),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Course'],
      },
      'Option 6': {
        description: 'BIOMG 3350',
        checker: includesWithSubRequirements(['BIOMG 3350']),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Course'],
      },
    },
  },
  {
    name: 'Biology Electives',
    description:
      '6 additional credits selected from didactic courses that relate to human biology. Any course that requires one year of introductory' +
      'biology or above (e.g. another advanced biology course) as a pre-requisite fulfills this category; the below list only provides examples.' +
      'Course work taken for Biology Electives may not also count for Biochemistry or HBHS Selectives. May not include Special Studies or' +
      'independent research credits (e.g., NS 4000, 4010, 4020, 4030, or 4990 or non-DNS equivalent). If a student takes an elective in Biochemistry, the following classes do not count: BIOMG 3300, 3310, or 3320, 3350, or NS 3200',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    checker: [
      (course: Course): boolean =>
        !courseMatchesCodeOptions(course, ['NS 4000']) &&
        !courseMatchesCodeOptions(course, ['NS 4010']) &&
        !courseMatchesCodeOptions(course, ['NS 4010']) &&
        !courseMatchesCodeOptions(course, ['NS 4020']) &&
        !courseMatchesCodeOptions(course, ['NS 4030']) &&
        !courseMatchesCodeOptions(course, ['NS 4990']) &&
        !courseMatchesCodeOptions(course, ['BIOMG 3300']) &&
        !courseMatchesCodeOptions(course, ['BIOMG 3310']) &&
        !courseMatchesCodeOptions(course, ['BIOMG 3320']) &&
        !courseMatchesCodeOptions(course, ['BIOMG 3350']) &&
        !courseMatchesCodeOptions(course, ['NS 3200']),
    ],
    checkerWarning: 'We do not check that the courses are approved Biology Electives.',
    fulfilledBy: 'credits',
    perSlotMinCount: [6],
  },
  {
    name: 'Social Science Perspective on Health Selectives',
    description:
      'Courses should cover some aspect of health (including nutrition) from a social science perspective. More than half of the course content' +
      'must be devoted to consideration of health/life course/disease issues from a social science (e.g. sociology, anthropology, psychology,' +
      'economics, communications, and other social science disciplines). Courses with a focus on public policy related to health or' +
      'education/counseling related to health are included in this category. See the Requirements for HBHS majors for regular updates to course' +
      'options and information; new options are available to all class years.',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    // Unsure how to check for this
    checker: [],
    checkerWarning: 'We do not check that the courses are approved electives.',
    fulfilledBy: 'credits',
    perSlotMinCount: [6],
  },
  {
    name: 'Natural Science Perspective on Health Selectives',
    description:
      'Courses should cover some aspect of health (including nutrition) from a life science perspective. More than half of the course content must' +
      'be devoted to consideration of health/life course/disease issues from a life science/biological perspective (e.g. biochemistry, molecular' +
      'biology, physiology, neuroscience, evolution, animal science, food science, plant sciences, and other natural science disciplines). Course' +
      'work taken for HBHS Selectives may not also count for Biology Electives. See the Requirements for HBHS majors for regular updates to' +
      'course options and information; new options are available to all class years.',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    // Unsure how to check for this
    checker: [],
    checkerWarning: 'We do not check that the courses are approved electives.',
    fulfilledBy: 'credits',
    perSlotMinCount: [6],
  },
  {
    name: 'Nutritional Science Perspective on Health Selectives',
    description:
      'Courses should cover some aspect of health (including nutrition) from a nutritional science perspective. More than half of the course' +
      'content must be devoted to consideration of health/life course/disease issues from a nutritional science perspective. Course work taken' +
      'for HBHS Selectives may not also count for Biology Electives. See the Requirements for HBHS majors for regular updates to course options' +
      'and information; new options are available to all class years.',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    // Unsure how to check for this
    checker: [],
    checkerWarning: 'We do not check that the courses are approved electives.',
    fulfilledBy: 'credits',
    perSlotMinCount: [3 || 4],
  },
  {
    name: 'Social Sciences',
    description:
      'Choose one course in any two of the following four areas: Anthropology, Economics, Psychology, and Sociology',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    // Unsure how to check for this
    checker: [],
    checkerWarning:
      'We do not check that the courses are approved electives. We also do not check whether they come from two of the four areas.',
    fulfilledBy: 'credits',
    perSlotMinCount: [6],
  },
  {
    name: 'Humanities',
    description:
      'Choose any course with the Course Distribution Historical Analysis (HA), Literature and the Arts (LA), or Cultural Analysis (CA).',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    checker: [
      (course: Course): boolean =>
        (course.catalogDistr?.includes('CA-') ?? false) ||
        (course.catalogDistr?.includes('HA-') ?? false) ||
        (course.catalogDistr?.includes('LA-') ?? false),
    ],
    fulfilledBy: 'credits',
    perSlotMinCount: [3 || 4],
  },
  {
    name: 'Calculus/Advanced Math',
    description:
      'MATH 1105, MATH 1106, MATH 1110, or MATH 1120. A score of 4 or 5 on AB or BC Calculus AP Exam can be used as credit for this requirement. DNS students must take either Calculus/Advanced Math' +
      'or Statistics at Cornell unless they have earned a score of 4 or 5 on the BC' +
      'Calculus AP Exam. Students in this case may use AP credit for both Calculus/Advanced Math and Statistics.',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    checker: includesWithSubRequirements(['MATH 1105', 'MATH 1106', 'MATH 1110', 'MATH 1120']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['MATH 1105, MATH 1106, MATH 1110, or MATH 1120'],
  },
  {
    name: 'Statistics',
    description:
      'STSCI 2150, PAM 2100, AEM 2100, BTRY 3010, ILRST 2100, STSCI 2100, MATH 1710, PSYCH 2500, or SOC 3010. A score of 4 or 5 on the Statisitcs AP Exam can be used as credit for this requirement. DNS students must take either Calculus/Advanced Math' +
      'or Statistics at Cornell unless they have earned a score of 4 or 5 on the BC' +
      'Calculus AP Exam. Students in this case may use AP credit for both Calculus/Advanced Math and Statistics.',
    source:
      'https://www.human.cornell.edu/sites/default/files/DNS/HBHS/HBHS%20Curriculum%20Sheet%202022-2023%20(1).pdf',
    checker: includesWithSubRequirements([
      'STSCI 2150',
      'PAM 2100',
      'AEM 2100',
      'BTRY 3010',
      'ILRST 2100',
      'STSCI 2100',
      'MATH 1710',
      'PSYCH 2500',
      'SOC 3010',
    ]),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: [
      'STSCI 2150, PAM 2100, AEM 2100, BTRY 3010, ILRST 2100, STSCI 2100, MATH 1710, PSYCH 2500, or SOC 3010',
    ],
  },
  {
    name: 'Electives',
    description: 'Any courses that are not applied to the requirements above count as Electives.',
    source:
      'https://www.human.cornell.edu/sites/default/files/Academics/Registrar/Curriculum%20sheets/2021-2022/HBHS%20Curriculum%20Sheet%202021-2022.pdf',
    fulfilledBy: 'self-check',
  },
];

export default hbhsRequirements;

export const hbhsAdvisors: AdvisorGroup = {
  advisors: [],
};
