import { OrgReviewQuestions } from "../types/organization";

export const mapToReviewQuestions = (data: OrgReviewQuestions[]) => {
  const normalized = data.slice(0, 3); // take max 3

  const result: any = {};

  for (let i = 0; i < 3; i++) {
    const item = normalized[i];

    result[`q${i + 1}_id`] = item?.id || '';
    result[`q${i + 1}_text`] = item?.question || '';
    result[`show_q${i + 1}`] = !!item;
  }

  return result;
};