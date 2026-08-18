declare module 'wordcloud' {
  type WordCloudItem = [string, number];

  interface WordCloudOptions {
    list: WordCloudItem[];
    gridSize?: number;
    weightFactor?: number;
    rotateRatio?: number;
    rotationSteps?: number;
    color?: () => string;
    backgroundColor?: string;
    drawOutOfBound?: boolean;
    abortThreshold?: number;
  }

  export default function WordCloud(
    element: HTMLCanvasElement,
    options: WordCloudOptions
  ): void;

  namespace WordCloud {
    function stop(): void;
  }
}
