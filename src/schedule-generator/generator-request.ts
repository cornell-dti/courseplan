import Course from './course-unit';
import Requirement from './requirement';

/**
 * Represents a request to the schedule generator, containing all of the information
 * necessary to construct a valid schedule according to user specification in the
 * /build page.
 *
 * @param classes The list of courses that the student is willing to have fulfill requirements.
 * @param requirements The list of requirements that the student wants to fulfill.
 * @param creditLimit The maximum number of credits that the student is willing to take.
 * @param semester The semester for which the schedule is being generated.
 * @returns A new instance of the GeneratorRequest class that contains this data collated.
 */
export default class GeneratorRequest {
  classes: Course[];

  requirements: Requirement[];

  creditLimit: number;

  semester: string;

  constructor(
    classes: Course[] = [],
    requirements: Requirement[] = [],
    creditLimit = 0,
    semester = ''
  ) {
    this.classes = classes;
    this.requirements = requirements;
    this.creditLimit = creditLimit;
    this.semester = semester;
  }

  addCourse(course: Course): void {
    this.classes.push(course);
  }

  addRequirement(requirement: Requirement): void {
    this.requirements.push(requirement);
  }
}
