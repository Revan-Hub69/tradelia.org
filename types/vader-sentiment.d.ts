declare module 'vader-sentiment' {
  export interface SentimentScores {
    neg: number;
    neu: number;
    pos: number;
    compound: number;
  }

  export class SentimentIntensityAnalyzer {
    static polarity_scores(text: string): SentimentScores;
  }

  const vader: {
    SentimentIntensityAnalyzer: typeof SentimentIntensityAnalyzer;
  };

  export default vader;
}
