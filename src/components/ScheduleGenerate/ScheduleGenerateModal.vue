<template>
  <div class="schedule-generate" @click="checkClickOutside" ref="modalBackground">
    <div class="schedule-generate-main">
      <div class="schedule-generate-content">
        <div class="schedule-generate-cancel">
          <button @click="cancel">
            <img
              class="schedule-generate-cancel-icon"
              src="@/assets/images/x.svg"
              alt="x to close modal"
            />
          </button>
        </div>
        <div class="schedule-generate-top">
          <div class="schedule-generate-header">
            <span
              ><img
                class="schedule-generate-header-emoji"
                src="@/assets/images/waveEmoji.svg"
                alt="wave"
              />
              Say hello to your generated schedule!</span
            >
          </div>
          <div class="schedule-generate-description">
            Please download before closing or it won't be saved!
          </div>
        </div>
        <div class="schedule-generate-body">
          <div class="schedule-generate-subHeader schedule-generate-subHeader--smallerIndent">
            Your Courses
          </div>
          <div class="schedule-generate-section-courses">
            <schedule-courses
              :total-credits="generatedScheduleOutputs[currentPage - 1]?.totalCredits ?? 0"
              :generated-schedule="generatedScheduleOutputs[currentPage - 1]?.schedule"
              :classes="classes"
            />
          </div>
          <div class="schedule-generate-section-schedule">
            <div class="schedule-generate-subHeader schedule-generate-subHeader--indent">
              {{ season }} {{ year }}
            </div>
            <schedule ref="calendar" :classesSchedule="classesSchedule" />
          </div>
        </div>
        <div class="schedule-generate-bottom">
          <button @click="regenerateSchedule" class="generate-schedules-button">
            <span class="footer-text">Generate New Schedules</span>
          </button>
          <div class="right-footer-container">
            <button
              @click="() => paginate(-1)"
              :disabled="currentPage === 1"
              :class="'footer-button' + (currentPage === 1 ? ' footer-button-disabled' : ' ')"
            >
              <span :class="currentPage === 1 ? 'footer-text-disabled' : 'footer-text'">Prev</span>
            </button>
            <button
              @click="() => paginate(1)"
              :disabled="currentPage === generatedScheduleOutputs.length"
              :class="
                'footer-button' +
                (currentPage === generatedScheduleOutputs.length ? ' footer-button-disabled' : ' ')
              "
            >
              <span
                :class="
                  currentPage === generatedScheduleOutputs.length
                    ? 'footer-text-disabled'
                    : 'footer-text'
                "
                >Next</span
              >
            </button>
            <span class="pagination-text ml-25"
              >Page {{ currentPage }}/{{ generatedScheduleOutputs.length }}</span
            >
          </div>
          <div class="download-button" @click="downloadSchedule">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              class="download-button-icon"
              viewBox="0 0 19 19"
              fill="none"
            >
              <path
                d="M16.625 11.875V15.0417C16.625 15.4616 16.4582 15.8643 16.1613 16.1613C15.8643 16.4582 15.4616 16.625 15.0417 16.625H3.95833C3.53841 16.625 3.13568 16.4582 2.83875 16.1613C2.54181 15.8643 2.375 15.4616 2.375 15.0417V11.875"
                stroke="white"
                stroke-width="1.05556"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M5.54199 7.91699L9.50033 11.8753L13.4587 7.91699"
                stroke="white"
                stroke-width="1.05556"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9.5 11.875V2.375"
                stroke="white"
                stroke-width="1.05556"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>Download</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import Schedule from '@/components/ScheduleGenerate/Schedule.vue';
import ScheduleCourses from '@/components/ScheduleGenerate/ScheduleCourses.vue';
import { generateSchedulePDF } from '@/tools/export-plan';
import GeneratorRequest from '@/schedule-generator/generator-request';
import ScheduleGenerator from '@/schedule-generator/algorithm';
import type { GeneratedScheduleOutput } from '@/schedule-generator/algorithm';
import Course, {
  CourseForFrontend,
  DayOfTheWeek,
  Timeslot,
} from '@/schedule-generator/course-unit';
import Requirement from '@/schedule-generator/requirement';
import _ from 'lodash';

export default defineComponent({
  props: {
    // current semester being generated for
    // current year and season being generated for
    year: { type: Number, required: true },
    season: { type: Object as PropType<FirestoreSemesterSeason>, required: true },
    courses: {
      type: Array as PropType<CourseForFrontend[]>,
      default: () => [],
    },
    creditLimit: {
      type: Number,
      default: 12,
    },
    reqs: {
      type: Array as PropType<(Requirement | undefined)[]>,
      default: () => [],
    },
  },
  components: {
    Schedule,
    ScheduleCourses,
  },
  emits: ['closeScheduleGenerateModal'],
  data() {
    return {
      currentPage: 1,
      generatedScheduleOutputs: [] as GeneratedScheduleOutput[],
    };
  },
  methods: {
    cancel() {
      this.$emit('closeScheduleGenerateModal');
    },
    checkClickOutside(e: MouseEvent) {
      if (e.target === this.$refs.modalBackground) {
        this.cancel();
      }
    },
    async downloadSchedule() {
      const calendarRef = this.$refs.calendar as typeof Schedule;
      generateSchedulePDF(
        this.classes,
        await calendarRef.generatePdfData(),
        this.year,
        this.season
      );
    },
    generateSchedules() {
      const outputs: {
        semester: string;
        schedule: Map<Course, Timeslot[]>;
        fulfilledRequirements: Map<string, Requirement[]>;
        totalCredits: number;
      }[] = [];

      function getRandomDaySet(): DayOfTheWeek[] {
        const daySets = [
          ['Monday', 'Wednesday', 'Friday'],
          ['Tuesday', 'Thursday'],
          ['Saturday', 'Sunday'],
        ] as DayOfTheWeek[][];
        const randomIndex = Math.floor(Math.random() * daySets.length);
        return daySets[randomIndex];
      }

      function genRandomUUID() {
        return (
          Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        );
      }

      /**
       * Checks if two `GeneratedScheduleOutput` objects `first` and `second` are equal.
       */
      function isEqual(first: GeneratedScheduleOutput, second: GeneratedScheduleOutput) {
        if (first.totalCredits !== second.totalCredits || first.semester !== second.semester) {
          return false;
        }
        const firstScheduleEntries = Array.from(first.schedule.entries());
        const secondScheduleEntries = Array.from(first.schedule.entries());
        return firstScheduleEntries.every(([firstKey, firstValue], index) => {
          const [secondKey, secondValue] = secondScheduleEntries[index];
          return _.isEqual(firstKey, secondKey) && _.isEqual(firstValue, secondValue);
        });
      }

      const startTime = Date.now();
      while (outputs.length < 5 && Date.now() - startTime < 1500) {
        const courses = this.courses.map(
          course =>
            new Course(
              course.code,
              // course.credits,
              '#'.concat(course.color),
              course.courseCredits,
              [
                {
                  start: course.timeStart,
                  end: course.timeEnd,
                  daysOfTheWeek: (course.daysOfTheWeek as DayOfTheWeek[]) || getRandomDaySet(),
                },
              ],
              [`${this.year} ${this.season}`],
              [course.fulfilledReq]
            )
        );

        const generatorRequest = new GeneratorRequest(
          courses,
          this.reqs.map(
            req =>
              new Requirement(
                req?.name ?? genRandomUUID(),
                req?.for ?? 'College',
                req?.typeValue ?? '?'
              )
          ),
          this.creditLimit,
          `${this.year} ${this.season}`
        );

        // NOTE: ideally we want to move this to the algorithm itself.
        // But also NOTE that this might not want to be hardcoded — consider e.g. liberal studies.

        const momentary = ScheduleGenerator.generateSchedule(generatorRequest);

        // Basic algorithm: now we want to clean up output.
        // Make it so that for every element of output, we keep track of
        // a Collections.counter-style object of fulfilled requirements.
        const fulfilledRequirementsCount = new Map<string, number>();
        for (const course of momentary.schedule.keys()) {
          const req = course.requirements;
          for (const requirement of req) {
            if (fulfilledRequirementsCount.has(requirement.name)) {
              fulfilledRequirementsCount.set(
                requirement.name,
                fulfilledRequirementsCount.get(requirement.name) !== undefined
                  ? (fulfilledRequirementsCount.get(requirement.name) as number) + 1
                  : 1
              );
            } else {
              fulfilledRequirementsCount.set(requirement.name, 1);
            }
          }
        }
        // Now we can get rid of duplicates in course.requirements by using the counter object.
        // We want to make it so that there is only one requirement count per requirement, globally.
        // We can do this by iterate over schedule.schedule in order of smallest number of course.requirements,
        // and when we encounter a duplicate, remove it.
        const fulfilledReqsSet = new Set<string>();
        const sortedSchedule = Array.from(momentary.schedule.keys()).sort(
          (a, b) => a.requirements.length - b.requirements.length
        );

        for (const course of sortedSchedule) {
          const newRequirements = [];
          // Sort course.requirements according to fulfilledRequirementsCount.
          // Prioritize smaller ones.
          const sortedCourseFullfilledRequirements = course.requirements.sort(
            (a, b) =>
              (fulfilledRequirementsCount.get(a.name) ?? 0) -
              (fulfilledRequirementsCount.get(b.name) ?? 0)
          );

          for (const requirement of sortedCourseFullfilledRequirements) {
            if (!fulfilledReqsSet.has(requirement.name)) {
              fulfilledReqsSet.add(requirement.name);
              newRequirements.push(requirement);
            }
          }
          course.requirements = newRequirements;
        }

        // Remove those courses that have no requirements left.
        momentary.schedule = new Map(
          Array.from(momentary.schedule).filter(obj => obj[0].requirements.length > 0)
        );

        let deltaCredits = 0;
        const usedReqsSet = new Set<string>(); // can use it once

        // Update fulfilledReqs, which is a map of course names -> fulfilled reqs.
        // We want to make it so that for every course name, we delete those requirements
        // that are already in fulfilledReqsSet, and if this causes it to be empty,
        // delete from fulfilledReqs.
        const newFullfilledReqs = new Map<string, Requirement[]>();
        for (const course of momentary.fulfilledRequirements.keys()) {
          const newRequirements = [];
          for (const requirement of momentary.fulfilledRequirements.get(course) ?? []) {
            if (
              !fulfilledReqsSet.has(requirement.name) ||
              (!usedReqsSet.has(requirement.name) && fulfilledReqsSet.has(requirement.name))
            ) {
              newRequirements.push(requirement);
              usedReqsSet.add(requirement.name);
            }
          }
          if (newRequirements.length > 0) {
            newFullfilledReqs.set(course, newRequirements);
          } else {
            deltaCredits -= this.courses.find(c => c.code === course)?.courseCredits ?? 0;
          }
        }

        momentary.fulfilledRequirements = newFullfilledReqs;
        momentary.totalCredits += deltaCredits;

        if (outputs.every(output => !isEqual(output, momentary))) {
          outputs.push(momentary);
        }
      }
      this.generatedScheduleOutputs = outputs;
    },
    regenerateSchedule() {
      this.generateSchedules();
      this.currentPage = 1;
    },
    paginate(direction: number) {
      if (
        (this.currentPage < this.generatedScheduleOutputs.length && direction === 1) ||
        (this.currentPage > 1 && direction === -1)
      ) {
        this.currentPage += direction;
      }
    },
  },
  computed: {
    classes() {
      const returnCourses = Array.from(
        this.generatedScheduleOutputs[this.currentPage - 1]?.schedule.keys() ?? []
      ).map(course => ({
        fulfilledReq: this.courses.find(c => c.code === course.code)?.fulfilledReq,
        title: this.courses.find(c => c.code === course.code)?.title,
        color: '#'.concat(this.courses.find(c => c.code === course.code)?.color ?? ''),
        code: course.code,
        credits: course.credits,
        timeStart: this.courses.find(c => c.code === course.code)?.timeStart,
        timeEnd: this.courses.find(c => c.code === course.code)?.timeEnd,
      }));
      return returnCourses;
    },
    classesSchedule() {
      if (this.generatedScheduleOutputs.length === 0) {
        // Opening for the first time...
        this.generateSchedules();
      }

      type classList = {
        title: string;
        name: string;
        color: string;
        timeStart: string;
        timeEnd: string;
      }[];

      // ScheduleGenerator.prettyPrintSchedule(generatedSchedule);
      const mondayClasses: classList = [];
      const tuesdayClasses: classList = [];
      const wednesdayClasses: classList = [];
      const thursdayClasses: classList = [];
      const fridayClasses: classList = [];
      const saturdayClasses: classList = [];
      const sundayClasses: classList = [];

      this.generatedScheduleOutputs[this.currentPage - 1]?.schedule.forEach((timeslots, course) =>
        timeslots.forEach(timeslot =>
          timeslot.daysOfTheWeek.forEach(day => {
            if (day === 'Monday') {
              mondayClasses.push({
                title: course.code,
                name: course.code,
                color: course.color,
                timeStart: timeslot.start,
                timeEnd: timeslot.end,
              });
            }
            if (day === 'Tuesday') {
              tuesdayClasses.push({
                title: course.code,
                name: course.code,
                color: course.color,
                timeStart: timeslot.start,
                timeEnd: timeslot.end,
              });
            }
            if (day === 'Wednesday') {
              wednesdayClasses.push({
                title: course.code,
                name: course.code,
                color: course.color,
                timeStart: timeslot.start,
                timeEnd: timeslot.end,
              });
            }
            if (day === 'Thursday') {
              thursdayClasses.push({
                title: course.code,
                name: course.code,
                color: course.color,
                timeStart: timeslot.start,
                timeEnd: timeslot.end,
              });
            }
            if (day === 'Friday') {
              fridayClasses.push({
                title: course.code,
                name: course.code,
                color: course.color,
                timeStart: timeslot.start,
                timeEnd: timeslot.end,
              });
            }
            if (day === 'Saturday') {
              saturdayClasses.push({
                title: course.code,
                name: course.code,
                color: course.color,
                timeStart: timeslot.start,
                timeEnd: timeslot.end,
              });
            }
            if (day === 'Sunday') {
              sundayClasses.push({
                title: course.code,
                name: course.code,
                color: course.color,
                timeStart: timeslot.start,
                timeEnd: timeslot.end,
              });
            }
          })
        )
      );

      return {
        Monday: mondayClasses,
        Tuesday: tuesdayClasses,
        Wednesday: wednesdayClasses,
        Thursday: thursdayClasses,
        Friday: fridayClasses,
        Saturday: saturdayClasses,
        Sunday: sundayClasses,
      };
    },
  },
});
</script>

<style scoped lang="scss">
@import '@/assets/scss/_variables.scss';

button:hover {
  opacity: 0.5;
}

input {
  background-color: none;
}

.schedule-generate {
  padding: 1rem;
  width: 100%;

  &-main {
    background: $white;
    border-radius: 9px;
    margin-left: auto;
    margin-right: auto;
    width: 69rem;
  }

  &-cancel {
    cursor: pointer;
    text-align: right;
    position: absolute;
    right: 1rem;
    top: 1rem;
    z-index: 5;

    &-icon {
      margin: 11px 11px 0 0;
    }
  }

  &-header {
    font-weight: bold;
    font-size: 36px;
    color: $onboardingGray;
    text-align: center;

    &-emoji {
      width: 36px;
      height: 36px;
      vertical-align: text-top;
    }
  }

  &-description {
    font-weight: 300;
    font-size: 18px;
    line-height: 36px;
    color: $onboardingGray;
    text-align: center;
  }

  &-content {
    position: relative;
    padding: 2rem;
  }

  &-body {
    padding: 0rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 2rem;
  }

  &-section {
    margin-bottom: 1rem;

    &-courses {
      width: 250px;
      margin-right: 2rem;
      display: flex;
      position: relative;
      z-index: 1;
    }

    &-schedule {
      display: flex;
      position: relative;
      z-index: 1;
    }
  }

  &-subHeader {
    font-weight: 900;
    text-align: center;
    color: $black;
    position: absolute;
    z-index: 2;
    line-height: 22px;
    margin-top: -0.5rem;
    background-color: $white;
    padding: 0rem 0.5rem 0rem 0.5rem;
    &--font {
      color: $black;
      flex-direction: row;
      background-color: $white;
      padding: 0rem 0.5rem 0rem 0.5rem;
    }

    &--review {
      font-weight: normal;
      padding: 5px;
      margin-left: 10px;
      background-color: $white;
      color: $lightPlaceholderGray;
      font-size: 16px;
    }

    &--smallerIndent {
      margin-left: 1.25rem;
      font-size: 18px;
    }

    &--indent {
      margin-left: 2rem;
      font-size: 18px;
    }
  }

  &-bottom {
    display: flex;
    justify-content: flex-start;
    margin-top: 1rem;
  }
}

.download-button {
  margin-left: auto;
  display: flex;
  width: 246px;
  height: 35px;
  font-family: 'ProximaNova';
  padding: 0px 66.603px 0px 62px;
  align-items: center;
  flex-shrink: 0;
  border-radius: 3px;
  background: var(--Button-Color---Sang, $sangBlue);
  color: $white;
  cursor: pointer;

  &-icon {
    margin-right: 21.05px;
    width: 19px;
    height: 19px;
    flex-shrink: 0;
    margin-bottom: 3px;
  }
}

.generate-schedules {
  &-button {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Proxima Nova';
    border-radius: 3px;
    height: 35px;
    padding: 10px 28px;
    border: 1px solid $sangBlue;

    &-disabled {
      border-radius: 3px;
      background: rgba(231, 231, 231, 0.75);
      cursor: not-allowed;
    }
  }
}

.footer {
  &-button {
    display: flex;
    justify-content: center;
    font-family: 'ProximaNova';
    align-items: center;
    border-radius: 3px;
    height: 35px;
    padding: 10px 22px;
    border: 1px solid $sangBlue;

    &-disabled {
      border-radius: 3px;
      background: rgba(231, 231, 231, 0.75);
      border-color: $lightPlaceholderGray;
      opacity: 50%;
      cursor: not-allowed;
    }
  }

  &-text {
    color: $sangBlue;
    text-align: center;
    font-family: 'ProximaNova';
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;

    &-disabled {
      color: $lightPlaceholderGray;
      text-align: center;
      font-family: 'ProximaNova';
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }
  }
}

.right-footer-container {
  display: flex;
  align-items: center;
  margin-left: 2rem;
  justify-content: space-between;
  gap: 10px;
}

.pagination-button {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  height: 35px;
  padding: 10px 20px;
  border: 1px solid $sangBlue;
}

.pagination-text {
  color: $primaryGray;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.ml-25 {
  margin-left: 25px;
}
</style>
