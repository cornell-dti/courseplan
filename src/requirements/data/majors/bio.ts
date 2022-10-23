import { CollegeOrMajorRequirement } from '../../types';
import { includesWithSubRequirements } from '../checkers-common';
import { AdvisorGroup } from '@/requirements/tools-types';

const bioRequirements: readonly CollegeOrMajorRequirement[] = [
  {
    name: 'Introductory Biology Cluster',
    description:
      'Take 2 of the following 3: BIOMG 1350, BIOG 1440 OR BIOG 1445, BIOEE 1610 OR BIOSM 1610',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=41&poid=19800',
    checker: includesWithSubRequirements(
      ['BIOMG 1350'],
      ['BIOG 1440', 'BIOG 1445'],
      ['BIOEE 1610', 'BIOSM 1610']
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 1, 1],
    slotNames: ['BIOMG 1350', 'BIOG 1440 OR BIOG 1445', 'BIOEE 1610 OR BIOSM 1610'],
    minNumberOfSlots: 2,
  },
  {
    name: 'Investigative Laboratory',
    description: 'BIOG 1500 OR BIOSM 1500',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=41&poid=19800',
    checker: includesWithSubRequirements(['BIOG 1500', 'BIOSM 1500']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'Evolutionary Biology and Diversity',
    description: 'BIOEE 1780 OR BIOEE 1781 OR BIOSM 1780',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=41&poid=19800',
    checker: includesWithSubRequirements(['BIOEE 1780', 'BIOEE 1781', 'BIOSM 1780']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'General Chemistry',
    description: 'Option 1: CHEM 2070 AND CHEM 2080, Option 2: CHEM 2150',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=41&poid=19800',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      'Option 1': {
        description: 'CHEM 2070 AND CHEM 2080',
        checker: includesWithSubRequirements(['CHEM 2070'], ['CHEM 2080']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['CHEM 2070', 'CHEM 2080'],
      },
      'Option 2': {
        description: 'CHEM 2150',
        checker: includesWithSubRequirements(['CHEM 2150']),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Course'],
      },
    },
  },
  {
    name: 'College Mathematics',
    description:
      'Two courses. One semester of calculus (MATH 1106 OR MATH 1110) ' +
      'Another course selected from: (MATH 1120 OR MATH 1910) ' +
      'OR MATH 1105 OR one course in statistics (STSCI 2150 OR BTRY 3010 are preferred)',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=41&poid=19800',
    checker: includesWithSubRequirements(
      ['MATH 1106', 'MATH 1110'],
      [
        'MATH 1120',
        'MATH 1910',
        'MATH 1105',
        'STSCI 2150',
        'BTRY 3010',
        'MATH 1710',
        'AEM 2100',
        'PSYCH 2500',
        'ECON 3130',
        'SOC 3010',
      ]
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 1],
    slotNames: ['MATH 1106 OR MATH 1110', 'Another Course'],
  },
  {
    name: 'Organic Chemistry',
    description: 'CHEM 1570 OR CHEM 3570 & 3580 OR CHEM 3590 & 3600 OR CHEM 3530',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=41&poid=19800',
    checker: includesWithSubRequirements(
      ['CHEM 1570'],
      ['CHEM 3570', 'CHEM 3580'],
      ['CHEM 3590', 'CHEM 3600'],
      ['CHEM 3530']
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 2, 2, 1],
    slotNames: ['CHEM 1570', 'CHEM 3570 or CHEM 3580', 'CHEM 3590 or CHEM 3600', 'CHEM 3530'],
    minNumberOfSlots: 1,
  },
  {
    name: 'Physics',
    description: 'PHYS 1101 & 1102 OR PHYS 2207 & 2208 OR PHY 1112 & 2213',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=41&poid=19800',
    checker: includesWithSubRequirements(
      ['PHYS 1101', 'PHYS 1102'],
      ['PHYS 2207', 'PHYS 2208'],
      ['PHYS 1112', 'PHYS 2213']
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [2, 2, 2],
    slotNames: ['PHYS 1101 & 1102', 'PHYS 2207 & 2208', 'PHY 1112 & 2213'],
    minNumberOfSlots: 1,
  },
  {
    name: 'Genetics and Genomics',
    description:
      'BIOMG 2800 and BIOMG 2801. It is strongly encouraged that these two course requirements be taken prior to senior year.',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=41&poid=19800',
    checker: includesWithSubRequirements(['BIOMG 2800'], ['BIOMG 2801']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 1],
    slotNames: ['BIOMG 2800', 'BIOMG 2801'],
  },
  {
    name: 'Biochemistry and Molecular Biology Part 1',
    description: 'BIOMG 3300 OR BIOMG 3310 and BIOMG 3320 OR BIOMG 3330 OR BIOMG 3350',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=41&poid=19800',
    checker: includesWithSubRequirements(
      ['BIOMG 3300'],
      ['BIOMG 3310', 'BIOMG 3320'],
      ['BIOMG 3330'],
      ['BIOMG 3350']
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 2, 1, 1],
    slotNames: ['BIOMG 3300', 'BIOMG 3310 or BIOMG 3320', 'BIOMG 3330', 'BIOMG 3350'],
    minNumberOfSlots: 1,
  },
  {
    name: 'Concentration',
    description:
      'Requires a minimum of 13 additional credits, which must include (1) one course from each of three different concentrations in biology ' +
      ' (2) a course with a laboratory, (3) a minimum of two 3000-level or above courses of 2+ credits each.',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=41&poid=19800',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      // TODO: fulfill by credits eventually
      'Animal Physiology': {
        description:
          'BIOAP 3110, BIOAP 3160, 3 credits of lecture course, and 4 credits of a laboratory course',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['BIOAP 3110'],
          ['BIOAP 3160'],
          [
            'ANSC 2400',
            'ANSC 3410',
            'ANSC 4270',
            'BIOAP 2140',
            'BIOAP 4140',
            'BIOAP 4580',
            'BIOMG 3850',
            'BIOMG 4000',
            'BIOMG 4370',
            'BIOMS 4150',
            'BIONB 3220',
            'BIONB 3920',
            'NS 3310',
          ],
          ['BIOAP 4130', 'BIOAP 3190', 'BIOMG 4400', 'BIONB 4300']
        ),
        perSlotMinCount: [1, 1, 1, 1],
        slotNames: [
          'BIOAP 3110',
          'BIOAP 3160',
          '3 credits of lecture course',
          '4 credits of a laboratory course',
        ],
      },
      Biochemistry: {
        description:
          '1. Organic Chemistry Lab (CHEM 2510 or CHEM 3010) ' +
          '2. 5 credits of Biochemistry ' +
          '3. BIOMG 4320 ' +
          '4. BIOMG 4400 ' +
          '5. Physical Chemistry ' +
          '6. BIOMG 4380/BIOMG 6310/CHEM 4500/BIOG 4990',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['CHEM 2510', 'CHEM 3010'],
          ['BIOMG 3310', 'BIOMG 3320', 'BIOMG 3300', 'BIOMG 3340'],
          ['BIOMG 4320'],
          ['BIOMG 4400'],
          ['CHEM 2870', 'CHEM 2880', 'CHEM 3890', 'CHEM 3900'],
          ['BIOMG 4380', 'BIOMG 6310', 'CHEM 4500', 'BIOG 4990']
        ),
        perSlotMinCount: [1, 2, 1, 1, 1, 1],
        slotNames: [
          'Organic Chemistry Lab (CHEM 2510 or CHEM 3010) ',
          '5 credits of Biochemistry ',
          'BIOMG 4320 ',
          'BIOMG 4400 ',
          'Physical Chemistry ',
          'BIOMG 4380/BIOMG 6310/CHEM 4500/BIOG 4990',
        ],
      },
      // TODO: fulfill by credit eventually
      'Biodiversity and Systematics': {
        description: '7 credits from Group A, 3 from Group B, and at least 2 lab courses.',
        counting: 'courses',
        checker: includesWithSubRequirements(
          [
            'BIOEE 4500',
            'BIOEE 4700',
            'BIOMI 2900',
            'BIOMI 3310',
            'BIOMI 4140',
            'PLBIO 2300',
            'ENTOM 2150',
            'ENTOM 3150',
            'ENTOM 3310',
            'PLPPM 4490',
          ],
          ['BIOEE 4530', 'BIOEE 4640', 'BIOEE 4790', 'PLBIO 4400', 'PLBIO 4470', 'PLBIO 4480'],
          [
            'BIOEE 2640',
            'BIOEE 2740',
            'BIOEE 4501',
            'BIOEE 4750',
            'BIOEE 4760',
            'BIOEE 2911',
            'PLBIO 2410',
            'PLBIO 2450',
            'PLBIO 2480',
            'ENTOM 2120',
            'ENTOM 3311',
            'PLPPM 3190',
          ]
        ),
        perSlotMinCount: [2, 1, 2],
        slotNames: ['Group A', 'Group B', 'Lab Course'],
      },
      'Computational Biology': {
        description:
          'A. One course in computer programming ' +
          'B. One additional course in mathematics' +
          'C. One of the following bridging courses ' +
          'D. One advanced course',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['CS 1110', 'CS 1112', 'CS 2024'],
          [
            'BTRY 3080',
            'MATH 2210',
            'MATH 2310',
            'MATH 2940',
            'MATH 4200',
            'MATH 4210',
            'MATH 4710',
            'MATH 4740',
          ],
          [
            'BIOEE 3620',
            'BIOMG 4810',
            'BIOMG 4870',
            'BIOMG 6310',
            'BIONB 3300',
            'BIONB 4220',
            'BIONB 4380',
            'BME 3110',
            'BTRY 4381',
            'BTRY 4830',
            'BTRY 4840',
            'ENTOM 4610',
            'NTRES 3100',
            'NTRES 4100',
            'NTRES 4120',
            'PLBIO 4000',
            'PLBIO 4400',
          ],
          [
            'BTRY 3080',
            'BTRY 4090',
            'BTRY 4381',
            'BTRY 4520',
            'CS 2110',
            'CS 4210',
            'CS 4220',
            'MATH 4200',
            'MATH 4210',
            'MATH 4740',
            'ORIE 3500',
            'ORIE 3510',
          ]
        ),
        perSlotMinCount: [1, 1, 1, 1],
        slotNames: ['Computer Programming', 'Mathematics', 'Bridging Course', 'Advanced Course'],
      },
      'Ecology and Evolutionary Biology': {
        description: 'BIOEE 1610 or BIOSM 1610 and at least one course from Groups A, B, and C.',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['BIOEE 1610', 'BIOSM 1610'],
          [
            'BIOEE 3610',
            'BIOEE 4530',
            'BIOEE 4640',
            'BIOEE 4800',
            'BIOMG 4810',
            'ENTOM 4700',
            'PLBIO 4470',
          ],
          [
            'BIOEE 2740',
            'BIOEE 3780',
            'BIOEE 4500',
            'BIOEE 4501',
            'BIOEE 4700',
            'BIOEE 4701',
            'BIOEE 4750',
            'BIOEE 4751',
            'BIOEE 4752',
            'BIOEE 4760',
            'BIOEE 4761',
            'BIOEE 4930',
            'ENTOM 2120',
            'PLPPM 4490',
            'PLBIO 2410',
            'PLBIO 4480',
          ],
          [
            'ANTHR 2750',
            'BIOEE 2525',
            'BIOEE 2640',
            'BIOEE 3611',
            'BIOEE 3620',
            'BIOEE 3690',
            'BIOEE 4460',
            'BIOEE 4461',
            'BIOEE 4550',
            'BIOEE 4560',
            'BIOEE 4570',
            'BIOEE 4571',
            'BIOEE 4620',
            'BIOEE 4660',
            'BIOEE 4661',
            'BIOEE 4690',
            'BIOEE 4780',
            'BIOEE 4790',
            'BIOEE 6680',
            'BIOEE 3690',
            'BIOEE 4460',
            'BIONB 4460',
            'BIONB 4461',
            'BIOSM 3210',
            'BIOSM 3740',
            'EAS 4620',
            'EAS 4790',
            'ENTOM 3690',
            'ENTOM 4550',
            'MATH 3620',
            'NS 2750',
            'NTRES 3100',
            'NTRES 3400',
            'NTRES 4100',
            'NTRES 4200',
            'PLBIO 4400',
            'PLHRT 4730',
            'PLSCS 4660',
          ]
        ),
        perSlotMinCount: [1, 1, 1, 1],
        slotNames: ['BIOEE 1610 or BIOSM 1610', 'Group A', 'Group B', 'Group C'],
      },
      // TODO: this one seems too complicated to try to use includesWithSubRequirements
      // 'General Biology': {
      //   description:
      //     'TODO',
      //   counting: 'credits',
      //   checker: includesWithSubRequirements(
      //     [''],
      //   ),
      //   perSlotMinCount: [13],
      // },
      'Genetics, Genomics and Development': {
        description: '13 credits from the list below',
        counting: 'credits',
        checker: includesWithSubRequirements([
          'BIOMG 3800',
          'BIOMG 4880',
          'BIOMG 6870',
          'BIOMI 4850',
          'BIOMS 6110',
          'BIONB 3950',
          'BIONB 4310',
          'PLBIO 3430',
          'PLBRG 6060',
          'BIOMG 3800',
          'BIOMG 4870',
          'BTRY 4830',
          'BTRY 4840',
          'NTRES 3500',
          'BIOMG 3850',
          'BIOMG 6320',
          'BIOMG 4610',
          'BIOMG 6870',
          'PLBIO 4220',
          'BIOEE 4530',
          'BIOMG 4610',
          'BIOMG 4810',
          'BIOMG 4870',
          'BTRY 4820',
          'BTRY 4830',
          'NTRES 3400',
          'BIOMG 4380',
          'BIOMG 4390',
          'BIOMG 6330',
          'BIOMG 6390',
          'BIOMG 4000',
          'BIOMG 6870',
          'BTRY 4830',
          'NTRES 3500',
          'PLBIO 3430',
          'PLPPM 4250',
        ]),
        perSlotMinCount: [13],
      },
      'Human Nutrition': {
        description: 'NS 3310 and 9 credits from the list below',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['NS 3310'],
          [
            'NS 2750',
            'NS 3030',
            'NS 3060',
            'NS 3150',
            'NS 3320',
            'NS 3410',
            'NS 3420',
            'NS 3450',
            'NS 4200',
            'NS 4300',
            'NS 4410',
            'NS 6140',
            'NS 6310',
            'NS 6320',
          ]
        ),
        perSlotMinCount: [1, 3],
        slotNames: ['NS 3310', '9 credits from the list below'],
      },
      // TODO: need to split into group A and B based on credits
      'Insect Biology': {
        description:
          'ENTOM 2120 and three courses where at least one is from Group A and one is from Group B',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['ENTOM 2120'],
          ['ENTOM 3310', 'ENTOM 3410', 'ENTOM 4440', 'ENTOM 4520', 'ENTOM 4550', 'ENTOM 4830'],
          [
            'ENTOM 3030',
            'ENTOM 3070',
            'ENTOM 3150',
            'ENTOM 3200',
            'ENTOM 3350',
            'ENTOM 3440',
            'ENTOM 3630',
            'ENTOM 3690',
            'ENTOM 3755',
            'ENTOM 4610',
            'ENTOM 4700',
            'ENTOM 4900',
          ]
        ),
        perSlotMinCount: [1, 1, 2],
        slotNames: ['ENTOM 2120', 'Group A', 'Group B'],
      },
      // TODO: need to split into group A and B based on credits
      'Marine Biology': {
        description: 'One introductory course and 12 credits from the list below',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['BIOEE 1540', 'BIOEE 1560', 'BIOEE 1610', 'BIOSM 1500', 'BIOSM 1610'],
          [
            'BIOAP 3300',
            'BIOEE 2740',
            'BIOEE 3730',
            'BIOEE 4760',
            'BIOEE 4930',
            'BIOEE 3500',
            'BIOSM 1780',
            'BIOSM 3210',
            'BIOSM 3330',
            'BIOSM 3450',
            'BIOSM 3830',
            'BIOSM 3830',
            'BIOSM 4650',
            'EAS 3555',
            'BIOEE 4570',
            'BIOEE 4571',
            'BIOEE 4620',
            'BIOEE 4790',
            'BIOEE 4920',
            'BIOSM 2800',
            'BIOSM 3750',
            'BIOSM 4720',
            'NTRES 3110',
            'NTRES 3111',
            'NTRES 4110',
          ]
        ),
        perSlotMinCount: [1, 4],
        slotNames: ['Introductory Course', '12 credits from the list below'],
      },
      Microbiology: {
        description: 'BIOMI 2900, BIOMI 2911, and 7 credits from the list',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['BIOMI 2900'],
          ['BIOMI 2911'],
          [
            'BIOMI 3210',
            'BIOMI 3940',
            'BIOMI 3970',
            'BIOMI 4040',
            'BIOMI 4090',
            'BIOMI 4140',
            'NS 4200',
            'BIOMI 4310',
            'BIOMI 4850',
            'BIOMI 6901',
            'BIOMI 6902',
            'BIOMI 6903',
            'BIOMI 6904',
            'BIOMI 6905',
            'BIOMI 6906',
          ]
        ),
        perSlotMinCount: [1, 1, 3],
        slotNames: ['BIOMI 2900', 'BIOMI 2911', '7 credits from the list below'],
      },
      // TODO: need nested toggleable reqs option, would like to use BIOMG 3***
      'Molecular and Cell Biology': {
        description:
          'A. Organic Chemistry. ' +
          'B. 5 credits of biochemistry. ' +
          'C. BIOMG 4320 ' +
          'D. BIOMG 4400 or BIONB 4300' +
          'E. At least 6 additional credits of courses that have a cell biological or molecular biological orientation.',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['CHEM 3570', 'CHEM 3580', 'CHEM 3590', 'CHEM 3600', 'CHEM 3530'],
          ['BIOMG 3310', 'BIOMG 3320', 'BIOMG 3300', 'BIOMG 3340'],
          ['BIOMG 4320'],
          ['BIOMG 4400', 'BIONB 4300'],
          [
            'BIOMG 3300',
            'BIOMG 3320',
            'BIOMG 3340',
            'BIOMG 3350',
            'BIOMG 3800',
            'BIOMG 3310',
            'BIOMG 3850',
            'BIOMG 4000',
            'BIOMG 4310',
            'BIOMG 4380',
            'BIOMG 4810',
            'BIOMG 4870',
            'BIOMG 4390',
            'BIOMG 4610',
            'BIOMG 4880',
            'BIOMS 4150 ',
            'BIOMI 4090',
            'BIOMI 4850',
            'BIONB 3950',
            'PLBIO 3420',
            'PLBIO 3430',
            'PLBIO 4220',
            'PLBIO 4440',
            'PLBIO 4620',
          ]
        ),
        perSlotMinCount: [1, 2, 1, 1, 2],
        slotNames: ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'],
      },
      'Neurobiology and Behavior': {
        // TODO: doesn't check for 3000 level
        description:
          'A. BIONB 2210 and BIONB 2220 with discussion sections ' +
          'B. 7 additional credits from the list that includes at least one advanced BIONB course of 3 or more credits from the 3000 level or above.',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['BIONB 2210'],
          ['BIONB 2220'],
          [
            'BIONB 1220',
            'BIONB 3215',
            'BIONB 3220',
            'BIONB 3230',
            'BIONB 3240',
            'BIONB 3280',
            'BIONB 3300',
            'BIONB 3690',
            'BIONB 3920',
            'BIONB 3950',
            'BIONB 4140',
            'BIONB 4200',
            'BIONB 4220',
            'BIONB 4260',
            'BIONB 4300',
            'BIONB 4310',
            'BIONB 4320',
            'BIONB 4330',
            'BIONB 4370',
            'BIONB 4380',
            'BIONB 4460',
            'BIONB 4461',
            'BIONB 4530',
            'BIONB 4550',
            'BIONB 4700',
            'BIONB 4910',
            'BIONB 4980',
            'BIONB 7200',
            'BIONB 7201',
            'BIONB 7202',
            'BIONB 7210',
            'BIONB 7212',
            'BIONB 7640',
          ]
        ),
        perSlotMinCount: [1, 1, 2],
        slotNames: ['BIONB 2210', 'BIONB 2220', '7 additional credits from the list'],
      },
      'Plant Biology': {
        description:
          'A. (PLBIO 2410, PLBIO 3420, PLBIO 3421) OR (PLBIO 3430, PLBIO 3431, PLBIO 3420)' +
          'B. Three courses from this list OR C. 7 credits from this list.',
        counting: 'courses',
        checker: includesWithSubRequirements(
          ['PLBIO 2410', 'PLBIO 3420', 'PLBIO 3421'],
          ['PLBIO 3430', 'PLBIO 3431', 'PLBIO 3420'],
          [
            'BIOEE 4460',
            'BIOEE 4461',
            'BIOEE 4660',
            'BIOEE 4661',
            'BIOG 4990',
            'PLBIO 2440',
            'PLBIO 2470',
            'PLBIO 2480',
            'PLBIO 3430',
            'PLBIO 3431',
            'PLBIO 3450',
            'PLBIO 4220',
            'PLBIO 4400',
            'PLBIO 4440',
            'PLBIO 4470',
            'PLBIO 4480',
            'PLBIO 4620',
            'PLBIO 4831',
            'PLBIO 4841',
          ],
          [
            'BIOEE 4460',
            'BIOEE 4461',
            'BIOEE 4990',
            'PLBIO 2410',
            'PLBIO 3420',
            'PLBIO 3421',
            'PLBIO 4220',
            'PLBIO 4440',
            'PLBIO 4470',
            'PLBIO 4470',
            'PLBIO 4620',
            'PLBIO 4831',
            'PLBIO 4841',
            'PLBRG 4030',
            'PLBRG 4070',
          ]
        ),
        perSlotMinCount: [3, 3, 3, 3],
        slotNames: [
          'PLBIO 2410, PLBIO 3420, PLBIO 3421',
          'PLBIO 3430, PLBIO 3431, PLBIO 3420',
          'Three courses from this list',
          '7 credits from this list',
        ],
        minNumberOfSlots: 2,
      },
    },
  },
];

export default bioRequirements;

export const bioAdvisors: AdvisorGroup = {
  advisors: [],
};
