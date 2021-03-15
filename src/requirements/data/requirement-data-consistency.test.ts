import requirementJson from '.';

const allRequirementsWithIDs = [
  ...requirementJson.university.UNI.requirements.map(it => ({
    id: `College-UNI-${it.name}`,
    requirement: it,
  })),
  ...Object.entries(requirementJson.college)
    .map(([college, collegeReqs]) =>
      collegeReqs.requirements.map(it => ({ id: `College-${college}-${it.name}`, requirement: it }))
    )
    .flat(),
  ...Object.entries(requirementJson.major)
    .map(([major, majorRequirement]) =>
      majorRequirement.requirements.map(it => ({
        id: `Major-${major}-${it.name}`,
        requirement: it,
      }))
    )
    .flat(),
  ...Object.entries(requirementJson.minor)
    .map(([minor, minorRequirement]) =>
      minorRequirement.requirements.map(it => ({
        id: `Minor-${minor}-${it.name}`,
        requirement: it,
      }))
    )
    .flat(),
].sort((a, b) => a.id.localeCompare(b.id));

allRequirementsWithIDs.forEach(({ id, requirement }) => {
  it(`${id}'s checker length and perSlotMinCount length are in sync.`, () => {
    switch (requirement.fulfilledBy) {
      case 'self-check':
        return;
      case 'courses':
      case 'credits':
        expect(requirement.checker.length).toBe(requirement.perSlotMinCount.length);
        return;
      case 'toggleable':
        Object.values(requirement.fulfillmentOptions).forEach(option => {
          expect(option.checker.length).toBe(option.perSlotMinCount.length);
        });
        return;
      default:
        throw new Error();
    }
  });
});
