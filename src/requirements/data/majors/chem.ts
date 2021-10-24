import { CollegeOrMajorRequirement } from '../../types';
import { includesWithSubRequirements } from '../checkers-common';

const chemRequirements: readonly CollegeOrMajorRequirement[] = [
  {
    name: 'General Chemistry',
    description: 'CHEM 2070 - CHEM 2080 or CHEM 2150',
    source: 'https://chemistry.cornell.edu/required-core-courses',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      'Option 1': {
        description: 'CHEM 2070 and CHEM 2080',
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
    name: 'Organic Chemistry',
    description: 'CHEM 3570 - 3580 or CHEM 3590 - CHEM 3600 or CHEM 3530',
    source: 'https://chemistry.cornell.edu/required-core-courses',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      'Option 1': {
        description: 'CHEM 3570 and CHEM 3580',
        checker: includesWithSubRequirements(['CHEM 3570'], ['CHEM 3580']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['CHEM 3570', 'CHEM 3580'],
      },
      'Option 2': {
        description: 'CHEM 3590 and CHEM 3600',
        checker: includesWithSubRequirements(['CHEM 3590'], ['CHEM 3600']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['CHEM 3590', 'CHEM 3600'],
      },
      'Option 3': {
        description: 'CHEM 3530',
        checker: includesWithSubRequirements(['CHEM 3530']),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Course'],
      },
    },
  },
  {
    name: 'Physical Chemistry',
    description: 'CHEM 3890 - CHEM 3900 or CHEM 2870',
    source: 'https://chemistry.cornell.edu/required-core-courses',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      'Option 1': {
        description: 'CHEM 3890 and CHEM 3900',
        checker: includesWithSubRequirements(['CHEM 3890'], ['CHEM 3900']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['CHEM 3890', 'CHEM 3900'],
      },
      'Option 2': {
        description: 'CHEM 2870',
        checker: includesWithSubRequirements(['CHEM 2870']),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Course'],
      },
    },
  },
  {
    name: 'Inorganic Laboratory',
    description: 'Only CHEM 4100',
    source: 'https://chemistry.cornell.edu/required-core-courses',
    checker: includesWithSubRequirements(['CHEM 4100']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
  },
  {
    name: 'Laboratory Core',
    description: 'CHEM 2510 and either CHEM 2900 or CHEM 3030',
    source: 'https://chemistry.cornell.edu/required-core-courses',
    checker: includesWithSubRequirements(['CHEM 2510'], ['CHEM 2900', 'CHEM 3030']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 1],
    slotNames: ['CHEM 2510', 'CHEM 2900 or CHEM 3030'],
    minNumberOfSlots: 2,
  },
  {
    // TODO: fulfill by credits eventually, currently only provides other 4 credit options
    name: 'Laboratory Requirement',
    description:
      'A total of 8 credits of laboratory, including core laboratories, is required. This requirement may be met by taking CHEM 3010 and/or CHEM 3020 or by taking laboratory courses outside of chemistry that are listed under electives.',
    source: 'https://chemistry.cornell.edu/required-core-courses',
    checker: includesWithSubRequirements(['CHEM 3010', 'CHEM 3020', 'BIOMG 4400', 'CHEM 4010']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Course'],
    minNumberOfSlots: 1,
  },
  {
    name: 'Mathematics',
    description: 'MATH 1110 - MATH 1120 or MATH 1910 (with AP credits)',
    source: 'https://chemistry.cornell.edu/required-core-courses',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      'Option 1': {
        description: 'MATH 1110 and MATH 1120',
        checker: includesWithSubRequirements(['MATH 1110'], ['MATH 1120']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['MATH 1110', 'MATH 1120'],
      },
      'Option 2': {
        description: 'MATH 1910',
        checker: includesWithSubRequirements(['MATH 1910']),
        counting: 'courses',
        perSlotMinCount: [1],
        slotNames: ['Course'],
      },
    },
  },
  {
    name: 'Physics',
    description: 'PHYS 2207 - PHYS 2208 or PHYS 1112 - PHYS 2213 or PHYS 1116 - PHYS 2217',
    source: 'https://chemistry.cornell.edu/required-core-courses',
    fulfilledBy: 'toggleable',
    fulfillmentOptions: {
      'Option 1': {
        description: 'PHYS 2207 and PHYS 2208',
        checker: includesWithSubRequirements(['PHYS 2207'], ['PHYS 2208']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['PHYS 2207', 'PHYS 2208'],
      },
      'Option 2': {
        description: 'PHYS 1112 and PHYS 2213',
        checker: includesWithSubRequirements(['PHYS 1112'], ['PHYS 2213']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['PHYS 1112', 'PHYS 2213'],
      },
      'Option 3': {
        description: 'PHYS 1116 and PHYS 2217',
        checker: includesWithSubRequirements(['PHYS 1116'], ['PHYS 2217']),
        counting: 'courses',
        perSlotMinCount: [1, 1],
        slotNames: ['PHYS 1116', 'PHYS 2217'],
      },
    },
  },
];

export default chemRequirements;
