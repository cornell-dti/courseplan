import { CollegeOrMajorRequirement } from '../../types';
import { includesWithSubRequirements } from '../checkers-common';

const mpaRequirements: readonly CollegeOrMajorRequirement[] = [
  {
    name: 'Core Competency Foundation Coursework',
    description:
      'Two courses in each of the three foundation areas listed below with one course in each of the foundation sub-areas.',
    source: 'https://www.human.cornell.edu/cipa/academics/curriculum/guide',
    checker: includesWithSubRequirements(
      ['PADM 5110', 'PADM 5410', 'PADM 5450', 'PADM 5414'],
      ['PADM 5130', 'PADM 5380', 'PADM 5619', 'PADM 5570', 'PADM 5634'],
      ['PADM 5210', 'PADM 5470'],
      ['PADM 5220', 'PAM 5130', 'PAM 5170', 'PAM 5400'],
      ['PADM 5310', 'PAM 5690'],
      ['PADM 5320', 'PADM 5340', 'PADM 5345', 'PAM 5300']
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 1, 1, 1, 1, 1],
    slotNames: [
      'Administrative, Political and Policy Processes 1',
      'Administrative, Political and Policy Processes 2',
      'Economic Analysis and Public Sector Economics 1',
      'Economic Analysis and Public Sector Economics 2',
      'Quantitative Methods and Analytics 1',
      'Quantitative Methods and Analytics 2',
    ],
    minNumberOfSlots: 6,
  },
  {
    name: 'Additional Foundation Coursework',
    description:
      'Three additional semester-length courses (or equivalent) in any of the three Foundation Areas',
    source: 'https://www.human.cornell.edu/cipa/academics/curriculum/guide',
    checker: includesWithSubRequirements([
      'ANTH 4462',
      'ANTH 6461',
      'COMM 4200',
      'CRP 5460',
      'CRP 6011',
      'CRP 6120',
      'CRP 6150',
      'GOVT 4403',
      'GOVT 6121',
      'GOVT 6171',
      'GOVT 6222',
      'GOVT 6274',
      'GOVT 6603',
      'ILRLR 6011',
      'LAW 6161',
      'LAW 6701',
      'LAW 6791',
      'LAW 6844',
      'NS 4450',
      'PADM 5114',
      'PADM 5118',
      'PADM 5418',
      'PADM 5431',
      'PADM 5449',
      'PADM 5455',
      'PADM 5456',
      'PADM 5472',
      'PADM 5612',
      'PADM 5730',
      'PADM 5734',
      'AEM 4140',
      'AEM 4545',
      'AEM 6300',
      'AEM 6320',
      'CRP 5040',
      'ECON 3040',
      'ECON 4020',
      'ECON 4210',
      'ECON 4220',
      'ECON 4290',
      'ECON 4510',
      'ILRIC 6350',
      'NS 6480',
      'NS 6850',
      'PAM 4280',
      'PAM 5210',
      'PAM 5334',
      'PAM 5440',
      'PAM 5970',
      'DEA 6560',
      'DSOC 6001',
      'DSOC 6150',
      'INFO 6750',
      'PAM 3120',
      'SOC 5080',
      'AEM 4060',
      'AEM 4120',
      'CEE 5970',
      'CEE 5980',
      'CRP 5250',
      'ORIE 4300',
      'ORIE 4820',
      'SYSEN 5100',
      'SYSEN 5200',
      'SYSEN 5300',
      'AEM 4110',
      'AEM 6125',
      'AEM 6390',
      'DSOC 6190',
      'ECON 3120',
      'GOVT 6029',
      'GOVT 6053',
      'ECON 4110',
      'NS 6850',
      'PAM 4100',
      'PAM 5210',
      'PAM 6050',
      'PAM 6060',
      'PAM 6090',
      'CRP 5080',
      'CRP 6270',
      'CRP 6290',
      'DSOC 3140',
      'DSOC 5600',
      'PAM 6950',
      'PADM 5110',
      'PADM 5130',
      'PADM 5210',
      'PADM 5220',
      'PADM 5310',
      'PADM 5320',
      'PADM 5340',
      'PADM 5345',
      'PADM 5380',
      'PADM 5410',
      'PADM 5450',
      'PADM 5570',
      'PADM 5619',
      'PADM 5634',
      'PAM 5130',
      'PAM 5170',
      'PAM 5400',
      'PAM 5470',
      'PAM 5690',
      'PADM 5414',
      'PAM 5550',
    ]),
    fulfilledBy: 'courses',
    perSlotMinCount: [3],
    slotNames: ['Course'],
  },
  // // Five courses within one of the eight concentration areas offered in the program.
  // {
  //   name: 'Concentration Coursework',
  //   description: 'Must take BTRY 3080, CS 4850, ECE 3100, ECON 3130, ENGRD 2700, or MATH 4710.',
  //   source: 'https://www.cs.cornell.edu/undergrad/csmajor',
  //   allowCourseDoubleCounting: true,
  //   checker: includesWithSubRequirements([
  //     'BTRY 3080',
  //     'CS 4850',
  //     'ECE 3100',
  //     'ECON 3130',
  //     'ENGRD 2700',
  //     'MATH 4710',
  //   ]),
  //   fulfilledBy: 'courses',
  //   perSlotMinCount: [1],
  //   slotNames: ['Course'],
  // },
  // {
  //   name: 'Professional Development Coursework',
  //   description: 'Must take BTRY 3080, CS 4850, ECE 3100, ECON 3130, ENGRD 2700, or MATH 4710.',
  //   source: 'https://www.cs.cornell.edu/undergrad/csmajor',
  //   allowCourseDoubleCounting: true,
  //   checker: includesWithSubRequirements([
  //     'BTRY 3080',
  //     'CS 4850',
  //     'ECE 3100',
  //     'ECON 3130',
  //     'ENGRD 2700',
  //     'MATH 4710',
  //   ]),
  //   fulfilledBy: 'courses',
  //   perSlotMinCount: [1],
  //   slotNames: ['Course'],
  // },

  // {
  //   name: 'Professional Development Coursework',
  //   description:
  //     "Two courses to strengthen professional preparation, which may include statistical, analytical or mathematical skills, professional writing or speaking, leadership or management, or additional skills or knowledge needed for a fellow's selected concentration. CIPA Fellows may also want to consider including a course from the list of General Concentration courses, or from the list of Public and Nonprofit Management courses as one of their two specialized/professional development courses",
  //   source: 'https://www.human.cornell.edu/cipa/academics/curriculum/guide',
  //   checker: includesWithSubRequirements(
  //     ['CS 1110', 'CS 1112', 'CS 1114', 'CS 1115'],
  //     ['CS 2110', 'CS 2112']
  //   ),
  //   fulfilledBy: 'courses',
  //   perSlotMinCount: [1, 1],
  //   slotNames: ['CS 111x', 'CS 2110 or CS 2112'],
  // },
  {
    name: 'Colloquium Coursework',
    description: 'PADM 5009, PADM 5011, and PADM 5012 (must be taken twice)',
    source: 'https://www.human.cornell.edu/cipa/academics/curriculum/guide',
    checker: includesWithSubRequirements(['PADM 5009'], ['PADM 5011'], ['PADM 5012']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 1, 1],
    slotNames: ['PADM 5009', 'PADM 5011', 'PADM 5012'],
  },
];

export default mpaRequirements;
