import Requirement from './requirement';

/**
 * Represents a potential day (or days) in the week that a course might be offered.
 */
export type DayOfTheWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

/**
 * Represents a potential time slot for a course.
 */
export type Timeslot = {
  daysOfTheWeek: DayOfTheWeek[]; // e.g. ['Monday', 'Wednesday', 'Friday']
  start: string; // e.g. '10:00 AM'
  end: string; // e.g. '11:30 AM'
};

/**
 * Represents a course that can be taken by a student, as 'massaged' into a
 * format that is more easily consumed by the frontend (and in particular, the
 * PDF downloader).
 */
export type CourseForFrontend = {
  title: string; // e.g. Linear Algebra for Engineers
  code: string; // e.g. MATH 2940
  color: string;
  courseCredits: number;
  fulfilledReq: Requirement;
  daysOfTheWeek: DayOfTheWeek[];
  timeStart: string;
  timeEnd: string;
};

/**
 * Represents a course that can be taken by a student.
 *
 * @param code The course code (e.g. MATH 2940).
 * @param color The color of the course (for the PDF generator).
 * @param credits The number of credits the course is worth.
 * @param timeslots The timeslots that the course is offered.
 * @param offeredSemesters The semesters in which the course is offered.
 * @param requirements The requirements that the course fulfills.
 */
export default class Course {
  code: string;

  color: string;

  credits: number;

  /*
  *all* of these have to be available for the course to be scheduled.
  will usually just be one, but if there is e.g. a lab or a discussion then it could be two
  */
  timeslots: Timeslot[];

  offeredSemesters: string[];

  requirements: Requirement[];

  constructor(
    code = '',
    color = '',
    credits = 0,
    timeslots: Timeslot[] = [],
    offeredSemesters: string[] = [],
    requirements: Requirement[] = []
  ) {
    this.code = code;
    this.color = color;
    this.credits = credits;
    this.timeslots = timeslots;
    this.offeredSemesters = offeredSemesters;
    this.requirements = requirements;
  }

  /**
   * A helper function that returns a string representation of the course.
   *
   * @returns A string representation of the course.
   */
  toString(): string {
    return `${this.code}: 
          -------------------
          ${this.credits} credits
          `;
  }
}
