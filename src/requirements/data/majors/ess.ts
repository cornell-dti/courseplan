import { CollegeOrMajorRequirement } from '../../types';
import { includesWithSingleRequirement, includesWithSubRequirements } from '../checkers-common';
import { AdvisorGroup } from '../../tools-types';

const environmentAndSustainability: readonly CollegeOrMajorRequirement[] = [
  {
    name: 'Foundation Course',
    description: 'Choose one course.',
    source: 'https://cals.cornell.edu/environment-sustainability/education/core-curriculum',
    checker: includesWithSingleRequirement('NTRES 1101', 'NTRES 1201'),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['NTRES 1101 or 1201'],
  },
  {
    name: 'Social Science',
    description: 'NTRES 2201',
    source: 'https://cals.cornell.edu/environment-sustainability/education/core-curriculum',
    checker: includesWithSingleRequirement('NTRES 2201'),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['NTRES 2201'],
  },
  {
    name: 'Biology',
    description: 'Choose one course.',
    source: 'https://cals.cornell.edu/environment-sustainability/education/core-curriculum',
    checker: includesWithSingleRequirement(
      'BIOEE 1610',
      'BIOSM 1610',
      'BIOEE 1780',
      'BIOEE 1781',
      'BIOSM 1780'
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'Chemistry/Physics',
    description: 'Choose one course. AP/IB credit accepted.',
    source: 'https://cals.cornell.edu/environment-sustainability/education/core-curriculum',
    checker: includesWithSingleRequirement('CHEM 1560', 'CHEM 2070', 'EAS 1600'),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
    // Allowed to double count with the concentrations
    allowCourseDoubleCounting: true,
  },
  {
    name: 'Statistics',
    description: 'Choose one course. AP/IB credit accepted.',
    source: 'https://cals.cornell.edu/environment-sustainability/education/core-curriculum',
    checker: includesWithSingleRequirement(
      'AEM 2100',
      'BTRY 3010',
      'STSCI 2200',
      'MATH 1710',
      'STSCI 2100',
      'STSCI 2150'
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'Humanities',
    description: 'Choose one course. ',
    source: 'https://cals.cornell.edu/environment-sustainability/education/core-curriculum',
    checker: includesWithSingleRequirement(
      'ANTHR 2201',
      'ANTHR 2420',
      'ASIAN 2273',
      'BSOC 2061',
      'COML 2036',
      'ENGL 3675',
      'ENGL 3795',
      'HIST 2581',
      'NTRES 2320',
      'NTRES 3320',
      'NTRES 3330',
      'PHIL 1440'
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'Economics',
    description: 'Choose one course. ',
    source: 'https://cals.cornell.edu/environment-sustainability/education/core-curriculum',
    checker: includesWithSingleRequirement('AEM 1500', 'AEM 2500'),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'Field/Engaged Experience',
    description: 'Choose one course. ',
    source: 'https://cals.cornell.edu/environment-sustainability/education/core-curriculum',
    checker: includesWithSingleRequirement(
      'BIOEE 3611',
      'ENTOM 2120',
      'NTRES 2100',
      'NTRES 2400',
      'NTRES 3260',
      'NTRES 4560',
      'BIOSM 2500'
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'Sustainability Science Colloquium',
    description: 'Choose one course. ',
    source: 'https://cals.cornell.edu/environment-sustainability/education/core-curriculum',
    checker: includesWithSingleRequirement('ENVS 2000', 'BEE 2000', 'BEE 2010'),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'Capstone Course',
    description: 'Choose one course. ',
    source: 'https://cals.cornell.edu/environment-sustainability/education/core-curriculum',
    checker: includesWithSingleRequirement(
      'EAS 4443',
      'ENVS 4444',
      'ENVS 4940',
      'NTRES 4600',
      'BIOSM 3750'
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'Concentration',
    description:
      'All students must select one of six concentrations, consisting of six to ten additional courses beyond the core. ' +
      'CoursePlan does not support the Student-Designed (SD) concentration. ',
    source: 'https://cals.cornell.edu/environment-sustainability/education/concentrations',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      'Environmental Economics': {
        description:
          'A. Required Courses, ' +
          'B. Resource/Environmental Economics (choose two), ' +
          'C. Data Analysis/Econometrics (choose one).',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['AEM 2500'],
          ['MATH 1110'],
          ['ECON 1110'],
          ['ECON 1120'],
          ['ECON 3030'],

          ['AEM 4500', 'AEM 4510', 'AEM 4515', 'ECON 3850'],
          [
            'AEM 3100',
            'AEM 4110',
            'ECON 3120',
            'ECON 3140',
            'ILRST 2110',
            'PLSCS 2200',
            'STSCI 4060',
          ]
        ),
        perSlotMinCount: [1, 1, 1, 1, 1, 2, 1],
        slotNames: [
          'A. Course',
          'A. Course',
          'A. Course',
          'A. Course',
          'A. Course',
          'B. Resource/Environmental Economics',
          'C. Data Analysis/Econometrics',
        ],
      },
      // TODO: check 18/26 credits are 3000+ level higher
      'Environmental Humanities': {
        description:
          'Minimum of 26 credits (7-8 courses) selected from the following list. 18 of these 26 credits must be courses at the 3000 level or higher (currently not checked by CoursePlan). ' +
          'Additional courses may be considered including the Society for the Humanities and other one-time course offerings. The same course may not fill both the humanities core requirement and the concentration. (*) marks courses common to both.',
        counting: 'courses',
        checker: includesWithSingleRequirement(
          'ANTHR 2201',
          'ANTHR 2420',
          'ANTHR 3230',
          'ANTHR 3422',
          'ANTHR 4101',
          'ANTHR 4442',
          'ASRC 3010',
          'BSOC 2061',
          'CLASS 2000',
          'CLASS 2729',
          'CLASS 3750',
          'COML 2036',
          'COML 3264',
          'COML 4902',
          'ENGL 3675',
          'ENGL 3795',
          'HIST 2581',
          'ARTH 2255',
          'NTRES 3320',
          'NTRES 3330',
          'RELST 2273',
          'STS 3181',
          'STS 4131',
          'STS 4460',
          'PHIL 1440'
        ),
        perSlotMinCount: [7],
        minNumberOfSlots: 1,
        slotNames: ['Course'],
      },
      'Environmental Policy & Governance': {
        description:
          'A. Foundation Courses, ' +
          'B. Methods/Tools Course (choose one), ' +
          'C. Additional environmental courses (choose two).',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['CRP 4440'],
          ['DSOC 3240'],
          ['NTRES 3311'],
          ['NTRES 4300'],
          [
            'AEM 2770',
            'DSOC 3130',
            'DSOC 3140',
            'CRP 3555',
            'CRP 4080',
            'EAS 2550',
            'GOVT 2169',
            'NTRES 4600',
            'PLSCS 2200',
            'PLSCS 4200',
          ],
          [
            'AEM 2000',
            'AEM 4500',
            'AEM 4510',
            'ANTHR 2420',
            'ANTHR 3422',
            'ANTHR 4410',
            'BSOC 2061',
            'CEE 5970',
            'COMM 2850',
            'COMM 3210',
            'COMM 4860',
            'COML 2036',
            'CRP 3840',
            'CRP 5080',
            'CRP 5460',
            'DEA 1500',
            'DEA 4220',
            'DEA 6610',
            'DSOC 2010',
            'DSOC 2030',
            'DSOC 2050',
            'DSOC 3010',
            'DSOC 3020',
            'DSOC 3150',
            'DSOC 3400',
            'DSOC 4380',
            'GERST 6190',
            'HIST 2581',
            'NS 4450',
            'NTRES 2320',
            'NTRES 3320',
            'NTRES 3330',
            'NTRES 4320',
            'NTRES 4330',
            'PLSCI 3600',
            'SOC 3650',
            'STS 3181',
            'STS 4131',
          ],
          [
            'AEM 2000',
            'AEM 4500',
            'AEM 4510',
            'ANTHR 2420',
            'ANTHR 3422',
            'ANTHR 4410',
            'BSOC 2061',
            'CEE 5970',
            'COMM 2850',
            'COMM 3210',
            'COMM 4860',
            'COML 2036',
            'CRP 3840',
            'CRP 5080',
            'CRP 5460',
            'DEA 1500',
            'DEA 4220',
            'DEA 6610',
            'DSOC 2010',
            'DSOC 2030',
            'DSOC 2050',
            'DSOC 3010',
            'DSOC 3020',
            'DSOC 3150',
            'DSOC 3400',
            'DSOC 4380',
            'GERST 6190',
            'HIST 2581',
            'NS 4450',
            'NTRES 2320',
            'NTRES 3320',
            'NTRES 3330',
            'NTRES 4320',
            'NTRES 4330',
            'PLSCI 3600',
            'SOC 3650',
            'STS 3181',
            'STS 4131',
          ]
        ),
        perSlotMinCount: [1, 1, 1, 1, 1, 1, 1],
        slotNames: [
          'A. Foundation Courses',
          'A. Foundation Courses',
          'A. Foundation Courses',
          'A. Foundation Courses',
          'B. Methods/Tools Course',
          'C. Additional Environmental Courses',
          'C. Additional Environmental Courses',
        ],
      },
      'Land, Air & Water Resources': {
        description:
          'A. Core curriculum (2 courses), ' +
          'B. Additional courses beyond the E&S core requirements (choose four) ' +
          'C. LAWR electives (choose five).',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['BIOEE 1610'],
          ['EAS 1600'],

          ['BIOG 1440', 'BIOEE 1780', 'BIOEE 1781', 'BIOMG 1350'],
          ['CHEM 1560', 'CHEM 2070', 'EAS 1600'],
          ['MATH 1106', 'MATH 1110'],
          ['EAS 3030', 'PLSCS 3650'],

          [
            'BEE 3500',
            'BEE 3710',
            'BEE 4110',
            'BEE 4270',
            'BEE 4710',
            'CEE 3310',
            'CEE 4320',
            'EAS 3530',
            'EAS 4720',
            'NTRES 3240',
            'BEE 4800',
            'EAS 1310',
            'EAS 2680',
            'EAS 3050',
            'EAS 3340',
            'EAS 3420',
            'EAS 2250',
            'EAS 3010',
            'EAS 3030',
            'PLSCS 2600',
            'PLSCS 3210',
            'PLSCS 3630',
            'PLSCS 3650',
          ],

          ['CEE 4110', 'CRP 4080', 'EAS 2900', 'PLSCS 2200', 'PLSCS 4200'],
          [
            'BIOEE 4570',
            'BIOEE 4620',
            'BIOEE 4780',
            'NTRES 3220',
            'NTRES 4200',
            'NTRES 4560',
            'PLHRT 4730',
            'PLSCS 4660',
            'PLSCS 4720',
          ],

          [
            'BEE 3500',
            'BEE 3710',
            'BEE 4110',
            'BEE 4270',
            'BEE 4710',
            'CEE 3310',
            'CEE 4320',
            'EAS 3530',
            'EAS 4720',
            'NTRES 3240',
            'BEE 4800',
            'EAS 1310',
            'EAS 2680',
            'EAS 3050',
            'EAS 3340',
            'EAS 3420',
            'EAS 2250',
            'EAS 3010',
            'EAS 3030',
            'PLSCS 2600',
            'PLSCS 3210',
            'PLSCS 3630',
            'PLSCS 3650',
            'CEE 4110',
            'CRP 4080',
            'EAS 2900',
            'PLSCS 2200',
            'PLSCS 4200',
            'BIOEE 4570',
            'BIOEE 4620',
            'BIOEE 4780',
            'NTRES 3220',
            'NTRES 4200',
            'NTRES 4560',
            'PLHRT 4730',
            'PLSCS 4660',
            'PLSCS 4720',
          ],

          [
            'BEE 3500',
            'BEE 3710',
            'BEE 4110',
            'BEE 4270',
            'BEE 4710',
            'CEE 3310',
            'CEE 4320',
            'EAS 3530',
            'EAS 4720',
            'NTRES 3240',
            'BEE 4800',
            'EAS 1310',
            'EAS 2680',
            'EAS 3050',
            'EAS 3340',
            'EAS 3420',
            'EAS 2250',
            'EAS 3010',
            'EAS 3030',
            'PLSCS 2600',
            'PLSCS 3210',
            'PLSCS 3630',
            'PLSCS 3650',
            'CEE 4110',
            'CRP 4080',
            'EAS 2900',
            'PLSCS 2200',
            'PLSCS 4200',
            'BIOEE 4570',
            'BIOEE 4620',
            'BIOEE 4780',
            'NTRES 3220',
            'NTRES 4200',
            'NTRES 4560',
            'PLHRT 4730',
            'PLSCS 4660',
            'PLSCS 4720',
          ]
        ),
        perSlotMinCount: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        slotNames: [
          'A. Core Course',
          'A. Core Course',
          'B. Biological Sciences Course',
          'B. Chemistry Course',
          'B. Quantitative Course',
          'B. Biogeochemistry Course',
          'C. Chemical/Physical Environmental Science',
          'C. Environmental Informatics',
          'C. Integrated ecosystems/ecology',
          'C. Additional Elective from all Categories',
          'C. Additional Elective from all Categories',
        ],
      },
      // TODO: do not check one more course from either list that must be at the 4000 level or above.
      'Environmental Biology & Applied Ecology': {
        description:
          'A. Core curriculum (2 courses), ' +
          'B. Additional courses beyond the E&S core requirements (choose 10). CoursePlan does not support the Quantitative Course Requirement yet.',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['BIOEE 1610'],
          ['EAS 1600'],

          ['BIOEE 1780', 'BIOEE 1781'],

          ['CHEM 1560', 'CHEM 1570', 'CHEM 2070', 'CHEM 2080'],

          ['MATH 1106', 'MATH 1110'],

          ['NTRES 2830', 'BIOMG 2800', 'BIOMG 2801'],
          ['BIOEE 3610', 'NTRES 3100'],

          [
            'EAS 4720',
            'BIOEE 3610',
            'BIOEE 3690',
            'BIOEE 4570',
            'BIOEE 4620',
            'BIOEE 4690',
            'BIOEE 4780',
            'BIOSM 3650',
            'EAS 3030',
            'LA 3170',
            'NTRES 2670',
            'NTRES 3220',
            'NTRES 3240',
            'NTRES 3250',
            'NTRES 4200',
            'NTRES 4560',
            'PLHRT 4730',
            'PLSCI 3600',
            'PLSCS 3210',
            'PLSCS 4660',
          ],

          [
            'BIOEE 2740',
            'BIOEE 3610',
            'BIOEE 3611',
            'BIOEE 3620',
            'BIOEE 3730',
            'BIOEE 4460',
            'BIOEE 4500',
            'BIOEE 4660',
            'BIOEE 4700',
            'BIOEE 4750',
            'BIOEE 4760',
            'BIOMI 2900',
            'BIOMI 3500',
            'BIOMI 3970',
            'BIOMI 4140',
            'BIOSM 3740',
            'BIOSM 3830',
            'ENTOM 2120',
            'ENTOM 3150',
            'ENTOM 3630',
            'ENTOM 3440',
            'ENTOM 4440',
            'ENTOM 4550',
            'NTRES 3100',
            'NTRES 3110',
            'NTRES 3260',
            'NTRES 4100',
            'NTRES 4110',
            'NTRES 4120',
            'NTRES 4280',
            'PLBIO 2410',
            'PLBIO 2450',
            'PLBIO 3420',
            'PLPPM 3010',
            'PLPPM 4010',
            'PLSCS 3150',
            'PLSCS 4130',
          ],

          [
            'EAS 4720',
            'BIOEE 3610',
            'BIOEE 3690',
            'BIOEE 4570',
            'BIOEE 4620',
            'BIOEE 4690',
            'BIOEE 4780',
            'BIOSM 3650',
            'EAS 3030',
            'LA 3170',
            'NTRES 2670',
            'NTRES 3220',
            'NTRES 3240',
            'NTRES 3250',
            'NTRES 4200',
            'NTRES 4560',
            'PLHRT 4730',
            'PLSCI 3600',
            'PLSCS 3210',
            'PLSCS 4660',
            'BIOEE 2740',
            'BIOEE 3610',
            'BIOEE 3611',
            'BIOEE 3620',
            'BIOEE 3730',
            'BIOEE 4460',
            'BIOEE 4500',
            'BIOEE 4660',
            'BIOEE 4700',
            'BIOEE 4750',
            'BIOEE 4760',
            'BIOMI 2900',
            'BIOMI 3500',
            'BIOMI 3970',
            'BIOMI 4140',
            'BIOSM 3740',
            'BIOSM 3830',
            'ENTOM 2120',
            'ENTOM 3150',
            'ENTOM 3630',
            'ENTOM 3440',
            'ENTOM 4440',
            'ENTOM 4550',
            'NTRES 3100',
            'NTRES 3110',
            'NTRES 3260',
            'NTRES 4100',
            'NTRES 4110',
            'NTRES 4120',
            'NTRES 4280',
            'PLBIO 2410',
            'PLBIO 2450',
            'PLBIO 3420',
            'PLPPM 3010',
            'PLPPM 4010',
            'PLSCS 3150',
            'PLSCS 4130',
          ]
        ),
        perSlotMinCount: [1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        slotNames: [
          'A. Core Course',
          'A. Core Course',
          'B. Biological Sciences',
          'B. Chemistry',
          'B. Calculus',
          'B. Introductory Genetics',
          'B. Advanced Ecology',
          'B. Ecosystems',
          'B. Organisms',
          'B. Additional Elective from Ecosystems and Organisms',
        ],
      },
    },
  },
];

export default environmentAndSustainability;

export const essAdvisors: AdvisorGroup = {
  advisors: [{ name: 'Suzanne Wapner', email: 'sw38@cornell.edu' }],
};
