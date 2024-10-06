import { fetchOtherLiberalStudiesCourses } from './fetch-courses';
import { coursesCollection, availableRostersForCourseCollection } from '../firebase-config';
import { CourseWithId } from './parse';

export default async function populateYesCategories() {
  const yesCourses: CourseWithId[] = await fetchOtherLiberalStudiesCourses();

  Promise.all(
    yesCourses.map(async course => {
      /* Computing a mapping that maps a course to a list of semesters it is offered in */
      const courseAndRostersDoc = await availableRostersForCourseCollection
        .doc(`${course.subject} ${course.catalogNbr.toString()}`)
        .get();

      if (courseAndRostersDoc.exists) {
        const roster = courseAndRostersDoc.data()?.rosters;
        await coursesCollection
          .doc(roster)
          .collection(course.subject)
          .doc(course.catalogNbr.toString())
          .update({ yesCategories: course.categories });
      }
    })
  );
}

populateYesCategories();
