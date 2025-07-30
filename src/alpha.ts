import {
  AddonBlueprint,
  TechDocsAddonOptions,
} from "@backstage/plugin-techdocs-react/alpha";
import { MermaidAddon } from "./Mermaid";
import { createFrontendModule } from "@backstage/frontend-plugin-api";

const mermaidAddonParams: TechDocsAddonOptions = {
  name: "Mermaid",
  location: "Content",
  component: MermaidAddon,
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
