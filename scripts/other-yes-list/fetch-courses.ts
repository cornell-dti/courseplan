import { genTextContextMatrix } from 'pdf-to-excel';
import { writeFile } from 'fs/promises';
import { getValidCourses } from './parse';

const otherYesListURL =
  'https://apps.engineering.cornell.edu/liberalstudies/ApprovedLiberalStudies.pdf';

// Fetch the other yes list and parse the returned data into a `CourseWithId`
export async function fetchOtherLiberalStudiesCoursesJSON() {
  const pdf = await genTextContextMatrix(otherYesListURL);
  return JSON.stringify(getValidCourses(pdf));
}

export async function fetchOtherLiberalStudiesCourses() {
  const pdf = await genTextContextMatrix(otherYesListURL);
  return getValidCourses(pdf);
}

export async function writeOtherLiberalStudiesCourses(path) {
  const courses = await fetchOtherLiberalStudiesCoursesJSON();
  await writeFile(`${path}otherYesCourses.json`, courses);
}

writeOtherLiberalStudiesCourses('./scripts/other-yes-list/');
