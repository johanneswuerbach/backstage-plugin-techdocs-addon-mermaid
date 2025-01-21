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

import { useEffect, useState } from 'react';
import { PaletteType, useTheme } from '@material-ui/core';

import { useShadowRootElements } from '@backstage/plugin-techdocs-react';
import mermaid, { MermaidConfig } from 'mermaid'
import { isMermaidCode } from './hooks';
import { MermaidProps } from './props';
import { BackstageTheme } from '@backstage/theme';

export function selectConfig(backstagePalette: PaletteType, properties: MermaidProps): MermaidConfig {
  // Theme set directly in the Mermaid configuration takes
  // precedence for backwards-compatibility
  if(properties.config) {
    return properties.config;
  }

  if(backstagePalette === 'light') {
    return properties.lightConfig || {};
  }

  return Object.assign({ theme: 'dark' }, properties.darkConfig);
}

/**
 * Show report issue button when text is highlighted
 */

let diagramId = 0

const makeDiagram = async (el: HTMLDivElement | HTMLPreElement, diagramText: string) => {
  el.style.display = 'none'

  const diagramElement = document.createElement('div')
  diagramElement.className = "mermaid"

  el.parentNode?.insertBefore(diagramElement, el.nextSibling);

  const id = `mermaid-${diagramId++}`
  const { svg, bindFunctions } = await mermaid.render(id, diagramText);
  diagramElement.innerHTML = svg
  bindFunctions?.(diagramElement);
}

export const MermaidAddon = (properties: MermaidProps) => {
  const highlightTables = useShadowRootElements<HTMLDivElement>(['.highlighttable']);
  const highlightDivs = useShadowRootElements<HTMLDivElement>(['.highlight']);
  const mermaidPreBlocks = useShadowRootElements<HTMLPreElement>(['.mermaid']);
  const theme = useTheme<BackstageTheme>();

  const [ initialized, setInitialized ] = useState(false);

  useEffect(() => {
    if (initialized) {
      return;
    }
    const config = selectConfig(theme.palette.type, properties);
    if ( properties.iconLoaders ) {
      mermaid.registerIconPacks(properties.iconLoaders);
    }
    mermaid.initialize(config);
    setInitialized(true);
  }, [initialized]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

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

      const diagramText = codeBlock.textContent || ''

      // Ideally we could detect mermaid based on some annotation, but use a regex for now
      if (!isMermaidCode(diagramText)) {
        return
      }

      makeDiagram(highlightTable, diagramText)
    });
  }, [initialized, highlightTables]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    highlightDivs.forEach(highlightDiv => {
      if (!highlightDiv.classList.contains('language-text')) {
         return;
      }

      // Skip already processed
      if (highlightDiv.style.display === 'none') {
        return
      }

      // skip mkdocs-material < 9 code blocks (handled above)
      const table = highlightDiv.querySelector('table')
      if (!table) {
        return
      }

      const codeBlock = highlightDiv.querySelector('code')
      if (!codeBlock) {
        return
      }

      const diagramText = codeBlock.textContent || ''

      // Ideally we could detect mermaid based on some annotation, but use a regex for now
      if (!isMermaidCode(diagramText)) {
        return
      }

      makeDiagram(highlightDiv, diagramText)
    });
  }, [initialized, highlightDivs]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    mermaidPreBlocks.forEach(mermaidPreBlock => {
      // Skip already processed
      if (mermaidPreBlock.style.display === 'none') {
        return
      }

      const codeBlock = mermaidPreBlock.querySelector('code')
      if (!codeBlock) {
        return
      }

      const diagramText = codeBlock.textContent || ''

      makeDiagram(mermaidPreBlock, diagramText)
    });
  }, [initialized, mermaidPreBlocks]);

  return null;
};
