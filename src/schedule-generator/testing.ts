import Requirement from './requirement';
import Course from './course';
import GeneratorRequest from './generator-request';
import ScheduleGenerator from './algorithm';

class Testing {
  public static main(): void {
    // Create some requirements
    const techElective = new Requirement('Technical Elective');
    const engrdReq = new Requirement('ENGRD Requirement');
    const probabilityReq = new Requirement('Probability Requirement');
    const coreClass = new Requirement('Core Class');

    // Courses
    const cs1110 = new Course(
      'CS1110',
      3,
      [
        {
          start: '10:00 AM',
          end: '11:30 AM',
        },
      ],
      ['Fall', 'Spring'],
      [coreClass, techElective]
    );

    const orie3300 = new Course(
      'ORIE3300',
      4,
      [
        {
          start: '11:30 AM',
          end: '1:00 PM',
        },
      ],
      ['Fall', 'Spring'],
      [coreClass, techElective]
    );

    const info4430 = new Course(
      'INFO4430',
      3,
      [
        {
          start: '10:00 AM',
          end: '11:30 AM',
        },
        {
          start: '11:30 AM',
          end: '1:00 PM',
        },
      ],
      ['Fall'],
      [techElective]
    );

    const engrd2700 = new Course(
      'ENGRD2700',
      3,
      [
        {
          start: '1:00 PM',
          end: '2:30 PM',
        },
      ],
      ['Fall', 'Spring'],
      [engrdReq, probabilityReq]
    );

    const additionalCourse1 = new Course(
      'XYZ123',
      3,
      [
        {
          start: '10:00 AM',
          end: '11:30 AM',
        },
      ],
      ['Fall', 'Spring'],
      [coreClass]
    );

    const additionalCourse2 = new Course(
      'ABC456',
      4,
      [
        {
          start: '11:30 AM',
          end: '1:00 PM',
        },
      ],
      ['Spring'],
      [techElective]
    );

    const randomCourse1 = new Course(
      'XYZ789',
      3,
      [
        {
          start: '1:00 PM',
          end: '2:30 PM',
        },
      ],
      ['Fall', 'Spring'],
      [techElective]
    );

    const randomCourse2 = new Course(
      'DEF321',
      4,
      [
        {
          start: '10:00 AM',
          end: '11:30 AM',
        },
      ],
      ['Spring'],
      [coreClass, probabilityReq]
    );

    const randomCourse3 = new Course(
      'PQR987',
      3,
      [
        {
          start: '11:30 AM',
          end: '1:00 PM',
        },
        {
          start: '1:00 PM',
          end: '2:30 PM',
        },
      ],
      ['Fall'],
      [engrdReq, techElective]
    );

    // Enough time to walk to this class.
    const randomCourse4 = new Course(
      'LMN654',
      4,
      [
        {
          start: '8:55 AM',
          end: '9:45 AM',
        },
      ],
      ['Spring'],
      [techElective]
    );

    // Enough time to walk to this class.
    const randomCourse5 = new Course(
      'RAC555',
      2,
      [
        {
          start: '8:55 AM',
          end: '9:45 AM',
        },
      ],
      ['Fall'],
      [techElective, probabilityReq, engrdReq, coreClass]
    );

    const courses: Course[] = [
      cs1110,
      orie3300,
      info4430,
      engrd2700,
      additionalCourse1,
      additionalCourse2,
      randomCourse1,
      randomCourse2,
      randomCourse3,
      randomCourse4,
      randomCourse5,
    ];

    const requirements: Requirement[] = [
      techElective,
      coreClass,
      probabilityReq,
      engrdReq, // Assuming you also want to include this in the requirements as mentioned, though not explicitly added in the original Java code testing request.
    ];

    // Create request
    const interestingRequest = new GeneratorRequest(courses, requirements, 9, 'Fall');

    // Generate schedule with request
    const output = ScheduleGenerator.generateSchedule(interestingRequest);
    ScheduleGenerator.prettyPrintSchedule(output);
  }
}

// Direct call to main to simulate Java's public static void main(String[] args) execution.
// To run this, execute `ts-node src/schedule-generator/testing.ts` from the root of the project.
Testing.main();
