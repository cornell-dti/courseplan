// Convention:
// - all the types describing data in Firestore is prefixed with Firestore.
// - all the data describing data converted from Firestore to be used by the app is prefixed with App.

export type FirestoreUserName = {
  readonly firstName: string;
  readonly middleName?: string;
  readonly lastName: string;
};

export type FirestoreSemesterCourse = {
  readonly crseId: number;
  readonly lastRoster: string;
  readonly uniqueID: number;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly credits: number;
  readonly creditRange: readonly [number, number];
  readonly semesters: readonly string[];
  readonly prereqs: string;
  readonly enrollment: readonly string[];
  readonly lectureTimes: readonly string[];
  readonly instructors: readonly string[];
  readonly distributions: readonly string[];
  readonly color: string;
};

export type FirestoreSemesterType = 'Fall' | 'Spring' | 'Summer' | 'Winter';
export type FirestoreSemester = {
  readonly year: number;
  readonly type: FirestoreSemesterType;
  readonly courses: readonly FirestoreSemesterCourse[];
};

export type FirestoreCollegeOrMajorOrMinor = { readonly acronym: string };
export type FirestoreAPIBExam = {
  readonly type: 'AP' | 'IB';
  readonly score: number;
  readonly subject: string;
};
export type FirestoreTransferClass = {
  readonly class: string;
  readonly course: CornellCourseRosterCourse;
  readonly credits: number;
};
export type FirestoreOnboardingUserData = {
  readonly class: readonly FirestoreTransferClass[];
  readonly colleges: readonly FirestoreCollegeOrMajorOrMinor[];
  readonly majors: readonly FirestoreCollegeOrMajorOrMinor[];
  readonly minors: readonly FirestoreCollegeOrMajorOrMinor[];
  readonly exam: readonly FirestoreAPIBExam[];
  readonly tookSwim: 'yes' | 'no';
};

export type FirestoreUserData = {
  readonly name: FirestoreUserName;
  readonly semesters: readonly FirestoreSemester[];
  readonly toggleableRequirementChoices: AppToggleableRequirementChoices;
  readonly subjectColors: { readonly [subject: string]: string };
  readonly uniqueIncrementer: number;
  readonly userData: FirestoreOnboardingUserData;
};

export type CornellCourseRosterCourse = {
  readonly crseId: number;
  readonly subject: string;
  readonly catalogNbr: string;
  readonly titleLong: string;
  readonly description: string;
  readonly enrollGroups: readonly {
    readonly unitsMinimum: number;
    readonly unitsMaximum: number;
    readonly classSections: readonly {
      readonly ssrComponent: string;
      readonly meetings: readonly {
        readonly pattern: unknown;
        readonly timeStart: unknown;
        readonly timeEnd: unknown;
        readonly instructors: readonly {
          readonly netid: string;
          readonly firstName: string;
          readonly lastName: string;
        }[];
      }[];
    }[];
  }[];
  readonly catalogWhenOffered?: string;
  readonly catalogPrereqCoreq?: string;
  readonly catalogDistr?: string;
  readonly roster: string;
};

export type AppOnboardingData = {
  readonly college: string;
  readonly major: readonly string[];
  readonly minor: readonly string[];
  readonly exam: readonly FirestoreAPIBExam[];
  readonly transferCourse: readonly FirestoreTransferClass[];
  readonly tookSwim: 'yes' | 'no';
};

export type AppBottomBarCourse = {
  readonly subject: string;
  readonly number: string;
  readonly name: string;
  readonly credits: number;
  readonly semesters: string;
  color: string;
  readonly latestSem: string;
  readonly instructors: string;
  readonly distributionCategories: readonly string[];
  readonly enrollmentInfo: string;
  readonly latestLecInfo: readonly string[];
  overallRating: number;
  difficulty: number;
  workload: number;
  readonly prerequisites: string;
  readonly description: string;
  readonly uniqueID: number;
};

// map from requirement ID to option chosen
export type AppToggleableRequirementChoices = Readonly<Record<string, string>>;
