# schedule-generator

This folder contains everything necessary to the functionality of the schedule-generation _algorithm_, for the new semesterly schedule-generation feature launching SP24. This is for use by the components in the `src/components/ScheduleGenerate` folder.

Below is a detailed file-by-file breakdown:

## `algorithm.ts`

This is essentially what is imported and used by the frontend. It takes in a request (type `GeneratorRequest`, see `generator-request.ts`) and outputs a meaningful value of type `GeneratedScheduleOutput` which can be used to see what courses fulfill what requirements and are at what times.

Currently the algorithm functions by randomly shuffling potential courses the user inputted, and then generating the first valid schedule that can be constructed by iterating through this randomly shuffled list. A "valid schedule" is one that is under the credit limit and does not duplicate courses. Valid schedules are constructed by iterating through the shuffled list of courses and adding them to the schedule if:

- they do not fulfill a requirement that has already been fulfilled
- they are not some duplicate of a course already in the generated schedule
- they do not push the schedule over the credit limit
- the course is offered in the upcoming semester
- there is enough time to get to (one of) the course's offered timeslots given the current schedule and including a 15-minute gap between classes

If a course is added to the schedule, the requirement it fulfills is marked as fulfilled and the course is marked as taken, and the current number of credits is alos updated. The algorithm continues until the credit limit is reached or all courses have been iterated through.

Please note that the frontend generates five schedules at once, for paging through. This is done by calling the algorithm five times, but with a different random seed, as JavaScript's `Random` library uses system time. However, especially for smaller problems, this means that some generated schedules might be the same — a potential avenue for improvement down the line would be to have a somewhat more sophisticated algorithm that allows for the generation of `n` unique solutions, though `<n` might occur if `n` are not found (after some `>n` number of iterations).

There are a couple of specificities that one should be aware of in relation to the algorithm's functionality:

- a `Set` is used to guarantee that no course is duplicated
  - if a user wants to take a course twice (e.g. CS 4999), they should make two separate requirement groups and add the course to each group
- another `Set` is used to guarantee that no _requirement_ is fulfilled multiple times
  - previously there was no cap on this, but now we guarantee that an outputted schedule has <= 1 fulfillment of each requirement
  - if a user wants to fulfill the same requirement multiple times (e.g. take multiple liberal studies, potentially), then they should follow the procedure above of duplicating requirement groups

Please note that GitHub Actions may complain about some `console.log` functions inside of `algorithm.ts`. This can be safely ignored — these `console.log`s are necessary and only called in the context of the `prettyPrintSchedule` function in a backend test.

## `course-unit.ts`

A `CourseUnit` is a class that represents a single course.

As shown in `testing.ts`, constructing a `CourseUnit` is somewhat involved due to all the associated frontend parameters, especially for the PDF generator. These include color, time, offered semesters, etc.

```typescript
new Course(
  L,
  '#FFFFF',
  3,
  [
    {
      daysOfTheWeek: ['Monday', 'Wednesday'],
      start: '10:00 AM',
      end: '11:30 AM'
    }
  ],
  ['Fall', 'Spring'],
  [coreClass, techElective]
);
```

## `generator-request.ts`

Just a narrow wrapper around the information you send to `algorithm.ts` for schedule generation. It stores the user's inputted courses to fulfill requirements, desired requirements to be fulfilled, the name of the semester, and a maximum amount of credits.

## `requirement.ts`

A simple class that just stores the "`name`" of a class, as well as the `type` of the requirement (e.g. `"College"`) and its `typeValue` (e.g. `"CS"`).

These parameters are required to:

- track which requirements are being fulfilled
- pass to the PDF downloader enough information to generate tables with requirement fulfillment information — see `src/tools/export-plan/pdf-schedule-generator.ts`

## `testing.ts`

Through some custom Node configuration (see `tsconfig.json`), we can run this file to test the algorithm. It will generate a schedule and print it to the console using the `ScheduleGenerator.prettyPrintSchedule` function. Current testing is done with a manually-written static set of requirements, courses, credit limit, etc.

You can run `testing.ts` with the following command:

```bash
ts-node testing.ts
```

If you get some complaint about `ts-node` not being defined you should just install it globally:

```bash
`npm install -g ts-node typescript "@types/node"`
```

Eventually, once we have frontend tests or whatnot, we can remove this file (as well as `testing.ts`
for that matter).
