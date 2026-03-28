export interface ResponseSummary {
  id: number;
  questionnaire_title: string;
  submitted_at: string;
}

export interface ResponseAnswer {
  question_text: string;
  choice_text: string;
  weight: number;
}

export interface ResponseDetail {
  id: number;
  questionnaire_title: string;
  submitted_at: string;
  total_score: number;
  answers: ResponseAnswer[];
}
