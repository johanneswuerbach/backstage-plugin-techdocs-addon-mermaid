# backstage-plugin-techdocs-addon-mermaid

The `backstage-plugin-techdocs-addon-mermaid` allows rendering of [Mermaid](https://mermaid-js.github.io/) diagrams
within [Backstage TechDocs](https://backstage.io/docs/features/techdocs/techdocs-overview)

This plugin is a [Backstage TechDocs Addon](https://backstage.io/docs/features/techdocs/addons), which requires
Backstage v1.2+

## Getting started

1. Follow [the official documentation for TechDocs Addons](https://backstage.io/docs/features/techdocs/addons#installing-and-using-addons) to enable addons for techdocs.
2. For your backstage instance, make sure you have installed `mkdocs-techdocs-core` >= 1.0.2. Older versions will not render mermaid correctly!
    ```sh
    pip3 install mkdocs-techdocs-core==1.0.2
    ```

3. Install this plugin in your backstage app. Run the following command from the root of your backstage installation:
   ```
   yarn add --cwd packages/app backstage-plugin-techdocs-addon-mermaid
   ```
4. Enable the addon within techdocs viewer's within `App.tsx` and `EntityPage.tsx`
   ```typescript jsx
   // packages/app/src/App.tsx
   // packages/app/src/components/catalog/EntityPage.tsx
   import { Mermaid } from 'backstage-plugin-techdocs-addon-mermaid';
 
   // ...
   {techDocsPage}
   <TechDocsAddons>
     {/*...*/}
     <Mermaid config={{ theme: 'forest', themeVariables: { lineColor: '#000000' } }} />
   </TechDocsAddons>
    ```

## Use Mermaid in your TechDocs

~~~markdown
# Mermaid section

Here is a mermaid graph!

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
~~~

## Auto-Detection vs. Manual Detection

By default, this plugin will autodetect diagrams based on the starting token of the code block. In some cases, however, this auto-detection is not sufficient, for example because of an unrecognized 
diagram type or the use of front matter. In these cases, you can force the use of mermaid on blocks by adding configuration like this to your `mkdocs.yaml` file:

```yaml
markdown_extensions:
  pymdownx.extra:
    pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
```

## Contributors Guide

After making changes to the plugin and having unit tests pass, to do manual end-to-end testing, follow the instructions below.

This plugin can be developed in the context of an existing Backstage deployment or a [new local deployment](https://backstage.io/docs/getting-started/#1-create-your-backstage-app).

1. Fork and clone this repo into the plugins folder of your Backstage codebase.
2. To have yarn link the local version of the addon instead of the version on npm.
  1. Change directories to the new `plugins/backstage-plugin-techdocs-addon-mermaid folder` and run `yarn link`.
  2. Go up to the main Backstage directory and run `yarn link "backstage-plugin-techdocs-addon-mermaid`.
3. Run `yarn install` in the Backstage root.
4. Follow the earlier instructions to add the plugin to your TechDocs pages in your Backstage deployment such as `app.tsx`.

You can either use the [TechDocs CLI](https://backstage.io/docs/features/techdocs/cli/) to test against a local docs folder. You will need to customize the preview app bundle for that to work as the addon is not included in the [standard bundle](https://github.com/backstage/techdocs-cli/blob/main/packages/embedded-techdocs-app/src/App.tsx).

Otherwise, you will need to register a component via URL like any other Backstage component and view that component's TechDocs.

For example, to use the SampleDocs component in this repo:

1. Generate a [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) for *public repos*.
2. Add the [GitHub integration](https://backstage.io/docs/integrations/github/locations) to your `app-config.local.yaml`.
3. `yarn dev` in the root of your Backstage codebase.
4. To register the demo docs, browse to `http://localhost:3000/catalog-import`
5. Register the URL pointing to the SampleDocs/catalog-info.yaml, example: `https://github.com/johanneswuerbach/backstage-plugin-techdocs-addon-mermaid/blob/main/sampledocs/catalog-info.yaml`
6. To iterate:
   1. Create a branch for the addon.
   2. Change the contents of the sampledocs.
   3. Commit and push.
   4. Register the catalog-info.yaml for your branch instead (keep in mind any security changes required for your personal access token).
   5. Iterate changes to markdown and changes to the plugin.