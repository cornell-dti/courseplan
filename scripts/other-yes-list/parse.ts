import { fullCoursesArray } from '../../src/assets/courses/typed-full-courses';

export type Course = {
  /** Corresponds to the "prefix" column on the PDF */
  subject: string;
  /** Corresponds to the "code" column on the PDF */
  catalogNbr: number;
  /** The liberal studies categories satisfied by the course */
  categories: readonly string[];
};
export type CourseWithId = Course & {
  crseId: number;
};
enum Col {
  CoursePrefix,
  CourseNumber,
  Title,
  College,
  Category,
  Credits,
}

// creates list of course entries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function genCourseEntries(data: any[]) {
  const courseEntries: Course[] = [];
  let c: Col = Col.CoursePrefix as Col;
  let subject = '';
  let catalogNbr = 0;
  let categories = [];

  // find the index of the first course (right after Notes)
  let start = 0;
  for (let i = 0; i < data.length; i += 1) {
    const v = data[i][0].str.trim();
    if (v.slice(0, 5) === 'Notes') {
      start = i + 1;
      break;
    }
  }
  // assumes that the columns are ordered and there are no empty cells
  for (let i = start; i < data.length; i += 1) {
    const v = data[i][0].str.trim();
    switch (c) {
      case Col.CoursePrefix:
        if (v.length <= 5) {
          subject = v;
          c = Col.CourseNumber;
        }
        break;
      case Col.CourseNumber:
        catalogNbr = parseInt(v, 10);
        c = Col.Title;
        break;
      case Col.Title:
        c = Col.College;
        break;
      case Col.College:
        c = Col.Category;
        break;
      case Col.Category:
        categories = v.split(', ');
        c = Col.Credits;
        break;
      case Col.Credits: {
        const course = { subject, catalogNbr, categories };
        courseEntries.push(course);
        c = Col.CoursePrefix;
        break;
      }
      default:
        break;
    }
  }
  return courseEntries.filter(course => !Number.isNaN(course.catalogNbr));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getValidCourses(data: any[]) {
  const courseEntries = genCourseEntries(data);
  const validCourses: CourseWithId[] = [];

  for (const { subject, catalogNbr, crseId } of fullCoursesArray) {
    for (const course of courseEntries) {
      if (subject === course.subject && catalogNbr === course.catalogNbr.toString()) {
        validCourses.push({ ...course, crseId });
        break;
      }
    }
  }
  return validCourses;
}
