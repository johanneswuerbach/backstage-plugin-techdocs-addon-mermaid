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