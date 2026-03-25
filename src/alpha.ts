import { createElement } from "react";
import {
  AddonBlueprint,
  TechDocsAddonOptions,
} from "@backstage/plugin-techdocs-react/alpha";
import { MermaidAddon } from "./Mermaid";
import {
  createFrontendModule,
  useApi,
  configApiRef,
} from "@backstage/frontend-plugin-api";
import type { MermaidProps } from "./Mermaid/props";

/**
 * Wrapper that reads zoom configuration from app-config.yaml and forwards
 * it as props to MermaidAddon.
 *
 * When no `techdocs.addons.mermaid` config is present, MermaidAddon is
 * rendered with no props — preserving the original behaviour.
 *
 * Supported app-config keys:
 *   techdocs.addons.mermaid.enableZoom              — boolean (default: false)
 *   techdocs.addons.mermaid.zoomOptions.scaleExtent  — [min, max]
 *   techdocs.addons.mermaid.zoomOptions.translateExtent — [[xmin, ymin], [xmax, ymax]]
 */
const ConfiguredMermaidAddon = () => {
  const config = useApi(configApiRef);
  const mermaidConfig = config.getOptionalConfig("techdocs.addons.mermaid");

  const props: MermaidProps = {};

  if (mermaidConfig) {
    props.enableZoom = mermaidConfig.getOptionalBoolean("enableZoom") ?? false;

    const zoomConfig = mermaidConfig.getOptionalConfig("zoomOptions");
    if (zoomConfig) {
      props.zoomOptions = {
        scaleExtent: zoomConfig.getOptional<[number, number]>("scaleExtent"),
        translateExtent: zoomConfig.getOptional<
          [[number, number], [number, number]]
        >("translateExtent"),
      };
    }
  }

  return createElement(MermaidAddon, props);
};

const mermaidAddonParams: TechDocsAddonOptions = {
  name: "Mermaid",
  location: "Content",
  component: ConfiguredMermaidAddon,
};

export const techDocsMermaidAddon = AddonBlueprint.make({
  name: "mermaid",
  params: mermaidAddonParams,
});

export const techDocsMermaidAddonModule = createFrontendModule({
  pluginId: "techdocs",
  extensions: [techDocsMermaidAddon],
});

export { techDocsMermaidAddonModule as default };
