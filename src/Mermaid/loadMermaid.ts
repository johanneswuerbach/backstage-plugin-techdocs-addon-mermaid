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

type MermaidApi = typeof import('mermaid').default;

let mermaidPromise: Promise<MermaidApi> | undefined;

/**
 * Loads mermaid on first use. Importing it at module top level would put it,
 * at around 500 KB, in the startup bundle of every app that installs this
 * addon, though only TechDocs pages with diagrams need it.
 *
 * A failed load is not cached, so the next render can try again, for example
 * after a network blip.
 */
export function loadMermaid(): Promise<MermaidApi> {
  mermaidPromise ??= import('mermaid').then(
    (module) => module.default,
    (error) => {
      mermaidPromise = undefined;
      throw error;
    },
  );
  return mermaidPromise;
}

export type { MermaidApi };
