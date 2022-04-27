# backstage-plugin-techdocs-addon-mermaid

The backstage-plugin-techdocs-addon-mermaid allows to render [Mermaid](https://mermaid-js.github.io/) diagrams in your [Backstage TechDocs](https://backstage.io/docs/features/techdocs/techdocs-overview)

This plugin is a [Backstage TechDocs Addon](https://backstage.io/docs/features/techdocs/addons), which requires Backstage v1.2+

## Getting started

Follow https://backstage.io/docs/features/techdocs/addons#installing-and-using-addons to use this addon.


```ts
import { Mermaid } from 'backstage-plugin-techdocs-addon-mermaid';

      {techDocsPage}
      <TechDocsAddons>
        ...
        <Mermaid />
      </TechDocsAddons>
```

## Use Mermaid in your TechDocs

~~~
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
~~~
