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
import mermaid, { MermaidConfig } from 'mermaid';
import { isMermaidCode } from './hooks';
import { MermaidProps } from './props';
import { BackstageTheme } from '@backstage/theme';
import { ZoomHandler } from './zoomHandler';
import { deepMerge } from './utils';

export function selectConfig(
  backstagePalette: PaletteType,
  properties: MermaidProps,
): MermaidConfig {
  // Determine the default config based on palette
  const defaultConfig =
    backstagePalette === 'light'
      ? properties.lightConfig || {}
      : Object.assign({ theme: 'dark' }, properties.darkConfig);

  // If a config is provided, deep merge it with the default config (user values take precedence)
  if (properties.config) {
    return deepMerge(defaultConfig, properties.config);
  }

  return defaultConfig;
}

/**
 * Show report issue button when text is highlighted
 */

let diagramId = 0;

const candidateSelectors = [
  '.highlighttable',
  '.highlight',
  'pre.mermaid',
  '.mermaid',
  '.language-mermaid',
];
const lineNumberSelectors = '.linenos, .linenodiv, .lnt';

const stripLineNumberGutters = (text: string): string => {
  const lines = text.split('\n');
  if (lines.length < 2) {
    return text.trim();
  }

  const stripped: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const expected = String(index + 1);
    const line = lines[index];
    if (line === expected) {
      stripped.push('');
      continue;
    }
    if (line.startsWith(`${expected} `) || line.startsWith(`${expected}\t`)) {
      stripped.push(line.slice(expected.length + 1));
      continue;
    }
    const nextChar = line.charAt(expected.length);
    if (
      line.startsWith(expected) &&
      nextChar !== '' &&
      /[A-Za-z%]/.test(nextChar)
    ) {
      stripped.push(line.slice(expected.length));
      continue;
    }
    return text.trim();
  }
  return stripped.join('\n').trim();
};

const getDiagramSource = (element: HTMLElement): string => {
  const sourceRoot = element.matches('code')
    ? element
    : (element.querySelector('code') ?? element);
  const clone = sourceRoot.cloneNode(true);
  if (clone instanceof HTMLElement) {
    clone
      .querySelectorAll(lineNumberSelectors)
      .forEach((node) => node.remove());
  }
  return stripLineNumberGutters(clone.textContent ?? '');
};

const outermostCandidates = (elements: HTMLElement[]): HTMLElement[] => {
  const unique = [...new Set(elements)];
  return unique.filter((element) =>
    unique.every((other) => other === element || !other.contains(element)),
  );
};

const makeDiagram = async (
  el: HTMLElement,
  diagramText: string,
  properties: MermaidProps,
) => {
  el.style.display = 'none';

  const diagramElement = document.createElement('div');
  diagramElement.className = 'mermaid';
  diagramElement.dataset.mermaidRendered = 'true';
  // Clip the element when outside parent when panning
  diagramElement.style.overflow = 'hidden';

  el.parentNode?.insertBefore(diagramElement, el.nextSibling);

  const id = `mermaid-${diagramId++}`;
  try {
    const { svg, bindFunctions } = await mermaid.render(id, diagramText);
    diagramElement.innerHTML = svg;
    bindFunctions?.(diagramElement);

    if (properties.enableZoom) {
      const svgEl = diagramElement.querySelector('svg');
      const zoomHandler = new ZoomHandler(
        diagramElement,
        svgEl as SVGSVGElement,
        properties.zoomOptions,
      );
      zoomHandler.initialize();
    }
  } catch (e) {
    el.style.display = '';
    diagramElement.remove();
    // eslint-disable-next-line no-console
    console.error('Failed to render mermaid diagram', e);
  }
};

export const MermaidAddon = (properties: MermaidProps) => {
  const candidates = useShadowRootElements<HTMLElement>(candidateSelectors);
  const theme = useTheme<BackstageTheme>();

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) {
      return;
    }
    const config: MermaidConfig = selectConfig(theme.palette.type, properties);
    if (properties.iconLoaders) {
      mermaid.registerIconPacks(properties.iconLoaders);
    }
    if (properties.layoutLoaders) {
      mermaid.registerLayoutLoaders(properties.layoutLoaders);
    }
    mermaid.initialize({ suppressErrorRendering: true, ...config });
    setInitialized(true);
  }, [initialized, properties, theme.palette.type]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    outermostCandidates(candidates).forEach((candidate) => {
      if (
        candidate.style.display === 'none' ||
        candidate.dataset.mermaidRendered === 'true'
      ) {
        return;
      }

      const diagramText = getDiagramSource(candidate);
      if (!diagramText) {
        return;
      }

      const isExplicitMermaid = candidate.matches(
        'pre.mermaid, .mermaid, .language-mermaid',
      );
      if (!isExplicitMermaid && !isMermaidCode(diagramText)) {
        return;
      }

      makeDiagram(candidate, diagramText, properties);
    });
  }, [initialized, candidates, properties]);

  return null;
};
