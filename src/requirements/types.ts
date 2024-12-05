import { AdvisorGroup } from '../tools/advisors/types';

export type Course = Omit<CornellCourseRosterCourse, 'roster'>;

export type CourseFullDetail = CornellCourseRosterCourseFullDetail;

export type BaseRequirement = RequirementCommon & RequirementFulfillmentInformation;

export type RequirementChecker = (course: Course) => boolean;
export type CollegeOrMajorRequirement = RequirementCommon &
  RequirementFulfillmentInformation<{
    readonly checker: readonly RequirementChecker[];
  }>;

export type CollegeRequirements<R> = {
  readonly [collegeCode: string]: {
    readonly name: string;
    readonly requirements: readonly R[];
    readonly advisors?: AdvisorGroup;
    readonly abbrev?: string;
  };
};

export type typeOfMigration = 'Modify' | 'Delete' | 'Add';

export type RequirementMigration = {
  entryYear: number /** This migration applies to students with an entryYear equal to or EARLIER this entry year */;
  type: typeOfMigration /** Modify, Delete, or Add Migration? This field must already exist in requirements file */;
  fieldName: string;
  newValue?: CollegeOrMajorRequirement /** Required for modify and add migrations */;
};

export type Major<R> = Readonly<{
  name: string;
  schools: readonly string[];
  requirements: readonly R[];
  /** College requirements that have been "specialized" for this major */
  specializations?: readonly R[];
  advisors?: AdvisorGroup;
  migrations?: RequirementMigration[];
  readonly abbrev?: string;
}>;

export type MutableMajorRequirements<R> = {
  [majorCode: string]: Major<R>;
};

export type MajorRequirements<R> = Readonly<MutableMajorRequirements<R>>;

type GenericRequirementsJson<R> = {
  readonly university: CollegeRequirements<R>;
  readonly college: CollegeRequirements<R>;
  readonly major: MajorRequirements<R>;
  readonly minor: MajorRequirements<R>;
  // We are treating grad programs at the same level as a major/minor.
  readonly grad: MajorRequirements<R>;
};

export type RequirementsJson = GenericRequirementsJson<CollegeOrMajorRequirement>;

export type DecoratedRequirementsJson = {
  readonly university: CollegeRequirements<DecoratedCollegeOrMajorRequirement>;
  readonly college: CollegeRequirements<DecoratedCollegeOrMajorRequirement>;
  readonly major: MajorRequirements<DecoratedCollegeOrMajorRequirement>;
  readonly minor: MajorRequirements<DecoratedCollegeOrMajorRequirement>;
  // We are treating grad programs at the same level as a major/minor.
  readonly grad: MajorRequirements<DecoratedCollegeOrMajorRequirement>;
};

/* Type that represents a set of placeholders for a given requirement */
type PlaceholdersForRequirement = {
  /**
   * Acronym representing the university/college/major the requirement is located in.
   * Should be the same acronym used in RequirementsJson.
   */
  readonly reqGroup: string;
  /** Name of the requirement to generate placeholders for within the file with acronym reqGroup */
  readonly name: string;
  /**
   * Semesters for which placeholders representing req name should be placed in, indexed starting at 1.
   * Each element in placeholderSemesters corresponds to the element with the same index in perSlotMinCount.
   */
  readonly placeholderSemesters: number[];
};

export type Template = readonly PlaceholdersForRequirement[];
