import examData, { ExamRequirements } from './data/exams/ExamCredit';
import { NO_EQUIVALENT_COURSES_COURSE_ID, CREDITS_COURSE_ID } from './data/constants';

type ExamTaken = {
  readonly subject: string;
  readonly score: number;
};
export type ExamsTaken = Record<'AP' | 'IB', ExamTaken[]>;

type ExamSubjects = Record<TransferExamType, readonly string[]>;

function userDataToCourses(
  college: string | undefined,
  major: string | undefined,
  userData: ExamsTaken,
  examType: 'AP' | 'IB'
): CourseTaken[] {
  // If there is no college, that means that the user only has a grad program, so they cannot get any course credit.
  if (!college) return [];

  const userExams = userData[examType];
  const exams = examData[examType];
  const courses: CourseTaken[] = [];
  userExams.forEach(userExam => {
    // match exam to user-taken exam
    const exam = exams.reduce((prev: ExamRequirements | undefined, curr: ExamRequirements) => {
      // check if exam name matches and score is high enough
      if (curr.name.includes(userExam.subject) && userExam.score >= curr.fulfillment.minimumScore) {
        // update exam variable if this exam has a higher minimum score
        if (!prev || prev.fulfillment.minimumScore < curr.fulfillment.minimumScore) {
          return curr;
        }
      }
      return prev;
    }, undefined);
    // generate the equivalent course(s)
    // multiple equivalent courses for the same exam can share a unique id, i.e., the unique id represents the exam id
    let courseEquivalentsExist = false;
    const name = `${examType} ${userExam.subject}`;
    if (exam) {
      const courseEquivalents =
        (exam.fulfillment.courseEquivalents &&
          (exam.fulfillment.courseEquivalents[college] ||
            exam.fulfillment.courseEquivalents.DEFAULT)) ||
        [];
      const excludedMajor =
        major && exam.fulfillment.majorsExcluded && exam.fulfillment.majorsExcluded.includes(major);
      if (!excludedMajor) {
        // AP/IB credit can be potentially applied towards the user's requirements
        courseEquivalentsExist = true;
        if (courseEquivalents.length === 1) {
          const courseId = courseEquivalents[0];
          courses.push({
            courseId,
            uniqueId: name,
            code: name,
            credits: exam.fulfillment.credits,
          });
        } else {
          // separate credits from equivalent course
          courses.push({
            courseId: CREDITS_COURSE_ID,
            uniqueId: name,
            code: name,
            credits: exam.fulfillment.credits,
          });
          courseEquivalents.forEach(courseId => {
            courses.push({
              courseId,
              uniqueId: name,
              code: name,
              credits: 0,
            });
          });
        }
      }
    }
    if (!courseEquivalentsExist) {
      courses.push({
        courseId: NO_EQUIVALENT_COURSES_COURSE_ID,
        uniqueId: name,
        code: name,
        credits: 0,
      });
    }
  });
  return courses;
}

export function getCourseEquivalentsFromOneMajor(
  college: string | undefined,
  major: string | undefined,
  userData: ExamsTaken
): readonly CourseTaken[] {
  const APCourseEquivalents = userDataToCourses(college, major, userData, 'AP');
  const IBCourseEquivalents = userDataToCourses(college, major, userData, 'IB');
  return APCourseEquivalents.concat(IBCourseEquivalents);
}

export default function getCourseEquivalentsFromUserExams(
  user: AppOnboardingData
): readonly CourseTaken[] {
  const examCourseCodeSet = new Set<string>();
  const { college, major: majors } = user;
  const userExamData: ExamsTaken = { AP: [], IB: [] };
  user.exam.forEach((exam: FirestoreAPIBExam) => {
    const examTaken: ExamTaken = { subject: exam.subject, score: exam.score };
    userExamData[exam.type].push(examTaken);
  });
  if (majors.length === 0) {
    return getCourseEquivalentsFromOneMajor(college, undefined, userExamData);
  }
  return [
    ...majors.map((major: string) =>
      getCourseEquivalentsFromOneMajor(college, major, userExamData).filter(({ code }) => {
        if (!examCourseCodeSet.has(code)) {
          examCourseCodeSet.add(code);
          return true;
        }
        return false;
      })
    ),
  ].flat();
}

function toSubjects(data: ExamRequirements[]) {
  const exams = data.map(({ name }) => name);
  const subjects = [...new Set(exams)];
  subjects.sort();
  return subjects;
}

export const examSubjects: ExamSubjects = {
  AP: toSubjects(examData.AP),
  IB: toSubjects(examData.IB),
  CASE: ['Computer Science', 'Chemistry', 'Physics', 'Foreign Language'], // stub in for now
};

export const getExamCredit = (examTaken: FirestoreAPIBExam): number => {
  const examsWithSameName: ExamRequirements[] = examData[examTaken.type].filter(
    it => it.name === examTaken.subject
  );
  const mostPossibleCredit = examsWithSameName.reduce((credit, exam) => {
    if (examTaken.score >= exam.fulfillment.minimumScore) {
      return Math.max(credit, exam.fulfillment.credits);
    }
    return credit;
  }, 0);
  return mostPossibleCredit;
};
