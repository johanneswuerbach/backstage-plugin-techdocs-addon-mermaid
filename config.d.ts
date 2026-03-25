export interface Config {
  techdocs?: {
    addons?: {
      mermaid?: {
        /**
         * Whether to enable zoom and pan on mermaid diagrams.
         *
         * @visibility frontend
         */
        enableZoom?: boolean;

        zoomOptions?: {
          /**
           * D3 zoom scale extent as [min, max].
           *
           * @visibility frontend
           */
          scaleExtent?: [number, number];

          /**
           * D3 zoom translate extent as [[x0, y0], [x1, y1]].
           *
           * @visibility frontend
           */
          translateExtent?: [[number, number], [number, number]];
        };
      };
    };
  };
}
