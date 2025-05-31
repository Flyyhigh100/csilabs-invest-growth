
declare namespace JSX {
  interface IntrinsicElements {
    'wistia-player': {
      'media-id': string;
      aspect?: string;
      autoplay?: string | boolean;
      muted?: string | boolean;
      preload?: string;
      playsinline?: string | boolean;
      controls?: string | boolean;
      className?: string;
      style?: React.CSSProperties;
    };
  }
}
