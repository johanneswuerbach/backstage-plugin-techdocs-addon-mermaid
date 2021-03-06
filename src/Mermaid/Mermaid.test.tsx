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

import { TechDocsAddonTester } from '@backstage/plugin-techdocs-addons-test-utils';

import React from 'react';

import { Mermaid } from '../plugin';

describe('TextSize', () => {
  it('renders without exploding', async () => {
    const { getByText } = await TechDocsAddonTester.buildAddonsInTechDocs([
      <Mermaid config={{ themeVariables: { lineColor: '#00ff00' } }} />,
    ])
      .withDom(<body>TEST_CONTENT</body>)
      .renderWithEffects();

    expect(getByText('TEST_CONTENT')).toBeInTheDocument();
  });
});
