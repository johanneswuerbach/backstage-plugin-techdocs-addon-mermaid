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
import type { Config } from "@backstage/config";
import type { IconLoader, MermaidProps } from "./Mermaid/props";
import type { MermaidConfig } from "mermaid";
import type { IconifyJSON } from "@iconify/types";

/**
 * Resolves a configured icon pack's `package` value into a fetchable URL
 * for its Iconify JSON icon set.
 *
 * A full `http(s)://` URL is used as-is. Otherwise the value is treated as
 * an npm package specifier — optionally including a subpath, e.g.
 * `@iconify-json/logos` or `@iconify-json/logos/icons.json` — and resolved
 * against the unpkg CDN, defaulting to the package's `icons.json` file when
 * no subpath is given.
 */
export function resolveIconPackUrl(packageOrUrl: string): string {
  if (/^https?:\/\//.test(packageOrUrl)) {
    return packageOrUrl;
  }

  const segments = packageOrUrl.split("/");
  const hasSubpath = packageOrUrl.startsWith("@")
    ? segments.length > 2
    : segments.length > 1;

  const path = hasSubpath ? packageOrUrl : `${packageOrUrl}/icons.json`;
  return `https://unpkg.com/${path}`;
}

export function readIconLoader(iconPackConfig: Config): IconLoader {
  const name = iconPackConfig.getString("name");
  const icons = iconPackConfig.getOptional<IconifyJSON>("icons");
  const pkg = iconPackConfig.getOptionalString("package");

  if (icons) {
    return { name, icons };
  }

  if (pkg) {
    const url = resolveIconPackUrl(pkg);
    return {
      name,
      loader: async () => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to load icon pack "${name}" from ${url}: ${response.status} ${response.statusText}`,
          );
        }
        return (await response.json()) as IconifyJSON;
      },
    };
  }

  throw new Error(
    `techdocs.addons.mermaid.iconPacks entry "${name}" must specify either "icons" or "package"`,
  );
}

/**
 * Wrapper that reads zoom configuration from app-config.yaml and forwards
 * it as props to MermaidAddon.
 *
 * When no `techdocs.addons.mermaid` config is present, MermaidAddon is
 * rendered with no props — preserving the original behaviour.
 *
 * Supported app-config keys:
 *   techdocs.addons.mermaid.lightConfig             — MermaidConfig
 *   techdocs.addons.mermaid.darkConfig              — MermaidConfig
 *   techdocs.addons.mermaid.config                  — MermaidConfig
 *   techdocs.addons.mermaid.enableZoom              — boolean (default: false)
 *   techdocs.addons.mermaid.zoomOptions.scaleExtent  — [min, max]
 *   techdocs.addons.mermaid.zoomOptions.translateExtent — [[xmin, ymin], [xmax, ymax]]
 *   techdocs.addons.mermaid.iconPacks               — [{ name, icons? , package? }]
 */
const ConfiguredMermaidAddon = () => {
  const config = useApi(configApiRef);
  const mermaidConfig = config.getOptionalConfig("techdocs.addons.mermaid");

  const props: MermaidProps = {};

  if (mermaidConfig) {
    props.lightConfig = mermaidConfig.getOptional<MermaidConfig>("lightConfig");
    props.darkConfig = mermaidConfig.getOptional<MermaidConfig>("darkConfig");
    props.config = mermaidConfig.getOptional<MermaidConfig>("config");
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

    const iconPacksConfig = mermaidConfig.getOptionalConfigArray("iconPacks");
    if (iconPacksConfig) {
      props.iconLoaders = iconPacksConfig.map(readIconLoader);
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
