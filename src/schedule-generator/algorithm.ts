import Course, { Timeslot } from './course-unit';
import GeneratorRequest from './generator-request';
import Requirement from './requirement';

/**
 * The output of the schedule generator.
 *
 * @param semester The semester for which the schedule is generated.
 * @param schedule A map of courses to their respective timeslots.
 * @param fulfilledRequirements A map of course codes to the requirements they fulfill.
 * @param totalCredits The total number of credits in the schedule.
 */
export type GeneratedScheduleOutput = {
  semester: string;
  schedule: Map<Course, Timeslot[]>;
  fulfilledRequirements: Map<string, Requirement[]>; // maps course name to fulfilled requirements
  // (We can no longer use Course keys as there are now duplicates using the new logic.)
  totalCredits: number;
};

/**
 * A class (based off of Java OOP architecture) that generates a valid semester schedule based on a
 * list of courses and their respective timeslots, requirements, and other information.
 */
export default class ScheduleGenerator {
  /**
   * A directly-accessible method that generates a schedule for some desired semester given
   * a list of courses, requirement info, and a credit limit.
   *
   * @param request An instance of a class containing the necessary information to generate a schedule.
   * @returns The generated schedule.
   */
  static generateSchedule(request: GeneratorRequest): GeneratedScheduleOutput {
    const { classes, semester } = request;
    let { creditLimit } = request;

    const schedule: Map<Course, Timeslot[]> = new Map();
    const fulfilledRequirementsByCourse: Map<string, Requirement[]> = new Map(); // used for checking no course duplicates
    const actualFulfilledRequirements: Set<string> = new Set(); // used for checking no requirement duplicates

    // Randomly shuffle the list of available courses
    classes.sort(() => Math.random() - 0.5);

    // Randomly shuffle the course timeslots for more variability
    classes.forEach(course => {
      course.timeslots.sort(() => Math.random() - 0.5);
    });

    let totalCredits = 0;

    classes.forEach(course => {
      if (course.offeredSemesters.includes(semester)) {
        let performAdditionFlag = true; // whether we can use this course or not
        // onlyCourseRequirement serves to doubly-ensure that only one requirement is being mapped
        // to each course (because the courses are being dragged under single requirement groups)
        const onlyCourseRequirement = course.requirements[0].name ?? 'nonsense-requirement';

        // New logic: must be free for *all* time slots.
        if (
          actualFulfilledRequirements.has(onlyCourseRequirement) ||
          fulfilledRequirementsByCourse.has(course.code) ||
          creditLimit - course.credits < 0
        ) {
          performAdditionFlag = false;
        } else {
          for (const timeslot of course.timeslots) {
            if (ScheduleGenerator.isTimeslotOccupied(schedule, timeslot)) {
              performAdditionFlag = false;
            }
          }
        }

        course.timeslots.forEach(timeslot => {
          if (ScheduleGenerator.isTimeslotOccupied(schedule, timeslot)) {
            performAdditionFlag = false;
          }
        });

        if (performAdditionFlag) {
          ScheduleGenerator.addToSchedule(schedule, course, course.timeslots);
          creditLimit -= course.credits;
          totalCredits += course.credits;
          fulfilledRequirementsByCourse.set(course.code, course.requirements);
          for (const requirement of course.requirements) {
            actualFulfilledRequirements.add(requirement.name);
          }
        }
      }
    });

    return {
      semester,
      schedule,
      fulfilledRequirements: fulfilledRequirementsByCourse,
      totalCredits
    };
  }

  /**
   * A helper static function that console.logs a pretty-printed text version of the schedule.
   * Useful for debugging and testing.
   *
   * @param output The output of the schedule generator.
   */
  static prettyPrintSchedule(output: GeneratedScheduleOutput): void {
    console.log('************************');
    console.log(`Generated Schedule for ${output.semester}:`);
    output.schedule.forEach((timeslots, course) => {
      const fulfilledReqs = output.fulfilledRequirements
        .get(course.code)
        ?.map(req => req.name)
        .join(', ');

      console.log(`- ${course.code} (${fulfilledReqs}, ${course.credits} credits)`);

      timeslots.forEach(timeslot => {
        if (timeslot.daysOfTheWeek && timeslot.daysOfTheWeek.length > 0) {
          console.log(
            `\tTime Slot: ${timeslot.start} – ${timeslot.end}. Days: ${timeslot.daysOfTheWeek.join(
              ', '
            )}`
          );
        } else {
          console.log(`\tTime Slot: ${timeslot.start} – ${timeslot.end}. Days: not specified`);
        }
      });
    });
    console.log();
    console.log(`Total Credits in the Schedule: ${output.totalCredits}`);
  }

  /**
   * A helper function to check if a timeslot is occupied in the schedule.
   *
   * @param schedule Information about the currently built-up schedule
   * @param timeslot The timeslot to check for overlap
   * @returns Whether the timeslot is occupied or not
   */
  private static isTimeslotOccupied(
    schedule: Map<Course, Timeslot[]>,
    timeslot: Timeslot
  ): boolean {
    // Check for overlap.
    const gap = 15 * 60 * 1000; // 15 minutes in milliseconds; need a 15 min gap for walking
    const timeslotCopy = { ...timeslot };

    if (!timeslotCopy.start.includes(' ')) {
      timeslotCopy.start = `${timeslotCopy.start.slice(0, -2)} ${timeslotCopy.start.slice(-2)}`;
    }
    if (!timeslotCopy.end.includes(' ')) {
      timeslotCopy.end = `${timeslotCopy.end.slice(0, -2)} ${timeslotCopy.end.slice(-2)}`;
    }

    const timeslotStartMS = new Date(`01/01/1970 ${timeslotCopy.start}`).getTime();
    const timeslotEndMS = new Date(`01/01/1970 ${timeslotCopy.end}`).getTime();
    const timeslotDaysOfTheWeek = new Set(timeslotCopy.daysOfTheWeek);

    for (const slotArray of Array.from(schedule.values())) {
      for (const slot of slotArray) {
        const slotCopy = { ...slot };
        if (!slotCopy.start.includes(' ')) {
          slotCopy.start = `${slotCopy.start.slice(0, -2)} ${slotCopy.start.slice(-2)}`;
        }
        if (!slotCopy.end.includes(' ')) {
          slotCopy.end = `${slotCopy.end.slice(0, -2)} ${slotCopy.end.slice(-2)}`;
        }

        const slotStartMS = new Date(`01/01/1970 ${slotCopy.start}`).getTime();
        const slotEndMS = new Date(`01/01/1970 ${slotCopy.end}`).getTime();

        if (
          timeslotStartMS < slotEndMS + gap &&
          slotStartMS < timeslotEndMS + gap &&
          new Set([...slot.daysOfTheWeek].filter(x => timeslotDaysOfTheWeek.has(x))).size > 0
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * A helper function that adds to our map of courses to timeslots some new
   * course and its respective timeslots.
   *
   * @param schedule The schedule to add the course to
   * @param course The course to add
   * @param timeslots The timeslots to add
   */
  private static addToSchedule(
    schedule: Map<Course, Timeslot[]>,
    course: Course,
    timeslots: Timeslot[]
  ): void {
    schedule.set(course, timeslots);
  }
}
