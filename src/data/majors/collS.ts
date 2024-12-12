import { CollegeOrMajorRequirement } from '../../requirements/types';
import {
  courseIsFWS,
  includesWithSingleRequirement,
  includesWithSubRequirements,
} from '../../requirements/checkers';
import { AdvisorGroup } from '../../tools/advisors/types';

const collSRequirements: readonly CollegeOrMajorRequirement[] = [
  {
    name: 'Core Courses',
    description: 'COLLS 3001, COLLS 3970, COLLS 4990, COLLS 4991',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=55&poid=28173',
    checker: includesWithSubRequirements(
      ['COLLS 3001'],
      ['COLLS 3970'],
      ['COLLS 4990'],
      ['COLLS 4991']
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 1, 1, 1],
    slotNames: ['COLLS 3001', 'COLLS 3970', 'COLLS 4990', 'COLLS 4991'],
  },
 
  {
    name: 'First-Year Writing Seminars (FWS)',
    description:
      'One First-Year Writing Workshop (FWS). (A score of 5 on the AP English Language exam is accepted.)',
    source: 'https://as.cornell.edu/education/degree-requirements',
    checker: [courseIsFWS],
    fulfilledBy: 'credits',
    perSlotMinCount: [3],
    allowCourseDoubleCounting: true,
  },
];

export default collSRequirements;

export const collSAdvisors: AdvisorGroup = {
  advisors: [{ name: 'Meg Elliott', email: 'mme3@cornell.edu' }],
};