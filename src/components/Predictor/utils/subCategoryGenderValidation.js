const FEMALE_ONLY_SUB_CATEGORY_REGEX = /GIRL|(^|[\s_(])GL(?=[\s)_]|$)/i;

export const hasInvalidSubCategoryGenderCombination = ({
  subCategory,
  gender,
}) => {
  const normalizedGender = String(gender || "").trim().toUpperCase();
  if (normalizedGender !== "MALE") {
    return false;
  }

  const normalizedSubCategory = String(subCategory || "").trim().toUpperCase();
  if (
    !normalizedSubCategory ||
    normalizedSubCategory === "NOT APPLICABLE" ||
    normalizedSubCategory === "NONE"
  ) {
    return false;
  }

  return FEMALE_ONLY_SUB_CATEGORY_REGEX.test(normalizedSubCategory);
};
