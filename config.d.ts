export interface Config {
  techdocs?: {
    addons?: {
      mermaid?: {
        /**
         * Light theme configuration.
         *
         * @deepVisibility frontend
         */
        lightConfig?: object;

        /**
         * Dark theme configuration.
         *
         * @deepVisibility frontend
         */
        darkConfig?: object;

        /**
         * Shared configuration.
         *
         * @deepVisibility frontend
         */
        config?: object;

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

        /**
         * Custom Iconify icon packs to register with Mermaid, for use with
         * the `icon` diagram syntax (e.g. `icon "custom:my-icon" "Label"`).
         *
         * @visibility frontend
         */
        iconPacks?: {
          /**
           * The icon pack prefix used to reference its icons in diagrams,
           * e.g. `custom` for `icon "custom:my-icon"`.
           *
           * @visibility frontend
           */
          name: string;

          /**
           * An inline Iconify icon set definition. Mutually exclusive with
           * `package`.
           *
           * @deepVisibility frontend
           */
          icons?: object;

          /**
           * An npm package name (optionally including a subpath, e.g.
           * `@iconify-json/logos` or `@iconify-json/logos/icons.json`) or a
           * full `http(s)://` URL pointing at an Iconify JSON icon set.
           * A bare package name is resolved against the unpkg CDN at
           * runtime and fetched as JSON — the package does not need to be
           * installed as a dependency. Mutually exclusive with `icons`.
           *
           * @visibility frontend
           */
          package?: string;
        }[];
      };
    };
  };
}
