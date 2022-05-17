/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createPlugin } from '@backstage/core-plugin-api';
import {
  createTechDocsAddonExtension,
  TechDocsAddonLocations,
} from '@backstage/plugin-techdocs-react';

import { MermaidAddon, MermaidProps } from './Mermaid';

/**
 * The TechDocs addons mermaid plugin
 *
 * @public
 */


export const techdocsAddonMermaidPlugin = createPlugin({
  id: 'techdocs-addon-mermaid',
});

/**
 * TechDocs addon that lets you render Mermaid diagrams
 *
 * @public
 */

 export const Mermaid = techdocsAddonMermaidPlugin.provide(
  createTechDocsAddonExtension<MermaidProps>({
    name: 'MermaidDiagram',
    location: TechDocsAddonLocations.Content,
    component: MermaidAddon,
  }),
);
