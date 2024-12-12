/**
 * This class represents a requirement for a college, major, minor, grad school, or the university.
 * It is one of the requirements that a student indicates they want to fulfill on the build page.
 *
 * @param name The name of the requirement (e.g. Mathematics).
 * @param forType The type of requirement (e.g. College, Major, Minor, Grad, Uni).
 * @param typeValue The specific 'subtype' of the requirement, for the PDF generator, e.g. 'CoE'.
 */
export default class Requirement {
  name: string;

  for: 'College' | 'Major' | 'Minor' | 'Grad' | 'Uni';

  typeValue: string;

  constructor(
    name: string,
    forType: 'College' | 'Major' | 'Minor' | 'Grad' | 'Uni',
    typeValue: string
  ) {
    this.name = name;
    this.for = forType;
    this.typeValue = typeValue;
  }
}
