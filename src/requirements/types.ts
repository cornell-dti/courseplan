export type Course = Omit<CornellCourseRosterCourse, 'roster'>;

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
  };
};

export type MajorRequirements<R> = {
  readonly [collegeCode: string]: {
    readonly name: string;
    readonly schools: readonly string[];
    readonly requirements: readonly R[];
  };
};

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

export type PlaceholdersForRequirement = {
  /**
   * Acronym representing the unviersity/college/major the requirement is located in.
   * Should be the same acronym used in RequirementsJson.
   */
  readonly reqGroup: string;
  /** Name of the requirement to generate placeholders for within the file with acronym reqGroup */
  readonly name: string;
  /**
   * Semesters for which placeholders representing req name should be placed in, indexed starting at 1.
   * Each element in semestersWithPlaceholders corresponds to the element with the same index in perSlotMinCount.
   */
  readonly semestersWithPlaceholders: number[];
};
