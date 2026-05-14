export interface YandexFormAnswer {
  id: string;
  created: string;
  data: Array<{
    field: {
      id: string;
      text?: string;
    };
    value?: any;
  }>;
}

export interface YandexFormResponse {
  answers: YandexFormAnswer[];
  columns?: Array<{ id: string; text: string }>;
  next?: {
    next_url: string;
  };
  total?: number;
}