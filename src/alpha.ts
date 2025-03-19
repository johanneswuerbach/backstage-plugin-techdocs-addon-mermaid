import { AddonBlueprint } from "@backstage/plugin-techdocs-react/alpha";
import { MermaidAddon } from "./Mermaid";
import { createFrontendModule } from "@backstage/frontend-plugin-api";

export const techDocsMermaidAddon = AddonBlueprint.make({
  name: "mermaid",
  params: {
    name: "Mermaid",
    location: "Content",
    component: MermaidAddon,
  },
});

export const techDocsMermaidAddonModule = createFrontendModule({
  pluginId: "techdocs",
  extensions: [techDocsMermaidAddon],
});
