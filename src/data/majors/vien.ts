import { CollegeOrMajorRequirement } from '../../requirements/types';
import { includesWithSubRequirements } from '../../requirements/checkers';
import { AdvisorGroup } from '../../tools/advisors/types';

// from here
const vienRequirements: readonly CollegeOrMajorRequirement[] = [
  {
    name: 'Physical Science Core',
    description: 'some description',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=55&poid=28379#Coursework',
    checker: includesWithSubRequirements(
      ['BIOMG 1350', 'BIOG 1140', 'BIOG 1440', 'BIOEE 1610', 'BIOEE 1780'],
      ['PLSCI 1420'],
      ['BIOMI 2900']
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 1, 1],
    slotNames: ['Introductory biology courses', 'PLSCI 1420', 'BIOMI 2900'],
  },
  {
    name: 'Chemistry',
    description: 'some description',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=55&poid=28379#Coursework',
    checker: includesWithSubRequirements(
      ['CHEM 1560'],
      ['CHEM 1570'],
      ['BIOMG 3300', 'BIOMG 3310', 'BIOMG 3350', 'NS 3200']
    ),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 1, 1],
    slotNames: ['CHEM 1560', 'CHEM 1570', 'Biochemistry'],
  },
  {
    // TODO: NTRES/STSCI 2200, should I keep both or just replace one with the other?
    name: 'Statistics',
    description: 'some description',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=55&poid=28379#Coursework',
    checker: includesWithSubRequirements(['NTRES 3130', 'STSCI 2200', 'STSCI 2100', 'STSCI 2150']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1],
    slotNames: ['Introductory Statistics Course'],
  },
  {
    name: 'Plant Science',
    description: 'some description',
    source: 'https://courses.cornell.edu/preview_program.php?catoid=55&poid=28379#Coursework',
    checker: includesWithSubRequirements(['PLBIO 2410'], ['PLSCS 2600']),
    fulfilledBy: 'courses',
    perSlotMinCount: [1, 1],
    slotNames: ['PLBIO 2410', 'PLSCS 2600'],
  },
];

export default vienRequirements;

export const vienAdvisors: AdvisorGroup = {
  advisors: [{ name: 'John Doe', email: 'johndoe@cornell.edu' }],
};
