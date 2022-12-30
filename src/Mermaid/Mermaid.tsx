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

import { useEffect } from 'react';
import { PaletteType, useTheme } from '@material-ui/core';

import { useShadowRootElements } from '@backstage/plugin-techdocs-react';
import mermaid from 'mermaid'
import { isMermaidCode } from './hooks';
import { MermaidProps } from './props';
import { BackstageTheme } from '@backstage/theme';
import { MermaidConfig } from 'mermaid';

export function selectConfig(backstagePalette: PaletteType, properties: MermaidProps): MermaidConfig {
  // Theme set directly in the Mermaid configuration takes
  // precedence for backwards-compatibility
  if(properties.config) {
    return properties.config;
  }

  if(backstagePalette === 'light') {
    return properties.lightConfig || {};
  }

  return properties.darkConfig || {};
}

/**
 * Show report issue button when text is highlighted
 */

let diagramId = 0

export const MermaidAddon = (properties: MermaidProps) => {
  const highlightTables = useShadowRootElements<HTMLDivElement>(['.highlighttable']);
  const theme = useTheme<BackstageTheme>();

  useEffect(() => {
    highlightTables.forEach(highlightTable => {
      if (!highlightTable.classList.contains('language-text')) {
         return;
      }

      // Skip already processed
      if (highlightTable.style.display === 'none') {
        return
      }

      const codeBlock = highlightTable.querySelector('code')
      if (!codeBlock) {
        return
      }

      const diagramText = codeBlock.innerText

      // Ideally we could detect mermaid based on some annotation, but use a regex for now
      if (!isMermaidCode(diagramText)) {
        return
      }

      highlightTable.style.display = 'none'

      const diagramElement = document.createElement('div')
      diagramElement.className = "mermaid"

      highlightTable.parentNode?.insertBefore(diagramElement, highlightTable.nextSibling);

      const id = `mermaid-${diagramId++}`

      const config = selectConfig(theme.palette.type, properties);
      if(config) {
        mermaid.initialize(config);
      }

      mermaid.render(id, diagramText, (svgGraph: string) => {
        diagramElement.innerHTML = svgGraph
      });
    });
  }, [highlightTables, properties, theme.palette.type]);

  return null;
};
