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
import { waitFor } from '@testing-library/react';
import { screen } from 'shadow-dom-testing-library';
import mermaid from 'mermaid';

import { Mermaid } from '../plugin';
import { selectConfig } from './Mermaid';
import { MermaidProps } from './props';

describe('Mermaid', () => {
  it('renders without exploding', async () => {
    await TechDocsAddonTester.buildAddonsInTechDocs([
      <Mermaid config={{ themeVariables: { lineColor: '#00ff00' } }} />,
    ])
      .withDom(<body>TEST_CONTENT</body>)
      .renderWithEffects();

    expect(screen.getByShadowText('TEST_CONTENT')).toBeInTheDocument();
  });

  it('renders pre blocks with mermaid class', async () => {
    await TechDocsAddonTester.buildAddonsInTechDocs([
      <Mermaid config={{ themeVariables: { lineColor: '#00ff00' } }} />,
    ])
      .withDom(
        <body>
          <pre className="mermaid" data-testid="mermaid-test">
            <code>flowchart LR</code>
          </pre>
        </body>,
      )
      .renderWithEffects();

    expect(screen.getByShadowTestId('mermaid-test')).toHaveStyle(
      'display: none',
    );
  });

  it('renders highlight tables', async () => {
    await TechDocsAddonTester.buildAddonsInTechDocs([
      <Mermaid config={{ themeVariables: { lineColor: '#00ff00' } }} />,
    ])
      .withDom(
        <body>
          <div
            className="highlighttable language-text"
            data-testid="mermaid-test"
          >
            <code>flowchart LR</code>
          </div>
        </body>,
      )
      .renderWithEffects();

    expect(screen.getByShadowTestId('mermaid-test')).toHaveStyle(
      'display: none',
    );
  });

  it('renders div highlights', async () => {
    await TechDocsAddonTester.buildAddonsInTechDocs([
      <Mermaid config={{ themeVariables: { lineColor: '#00ff00' } }} />,
    ])
      .withDom(
        <body>
          <div className="highlight language-text" data-testid="mermaid-test">
            <table />
            <code>flowchart LR</code>
          </div>
        </body>,
      )
      .renderWithEffects();

    expect(screen.getByShadowTestId('mermaid-test')).toHaveStyle(
      'display: none',
    );
  });

  it('renders modern flat mkdocs-material highlights', async () => {
    await TechDocsAddonTester.buildAddonsInTechDocs([<Mermaid />])
      .withDom(
        <body>
          <div className="highlight" data-testid="mermaid-test">
            <pre>
              <code>flowchart LR</code>
            </pre>
            <button className="md-clipboard">Copy</button>
          </div>
        </body>,
      )
      .renderWithEffects();

    expect(screen.getByShadowTestId('mermaid-test')).toHaveStyle(
      'display: none',
    );
  });

  it('renders direct mermaid content without a nested code element', async () => {
    const detectType = jest.spyOn(mermaid, 'detectType');
    const render = jest
      .spyOn(mermaid, 'render')
      .mockResolvedValue({ svg: '<svg />' });
    render.mockClear();

    await TechDocsAddonTester.buildAddonsInTechDocs([<Mermaid />])
      .withDom(
        <body>
          <div className="mermaid" data-testid="mermaid-test">
            futureDiagram A --&gt; B
          </div>
        </body>,
      )
      .renderWithEffects();

    await waitFor(() =>
      expect(render).toHaveBeenCalledWith(
        expect.any(String),
        'futureDiagram A --> B',
      ),
    );
    expect(detectType).not.toHaveBeenCalled();
    detectType.mockRestore();
    render.mockRestore();
  });

  it('removes inline line-number gutters before detection and rendering', async () => {
    const render = jest
      .spyOn(mermaid, 'render')
      .mockResolvedValue({ svg: '<svg />' });
    render.mockClear();

    await TechDocsAddonTester.buildAddonsInTechDocs([<Mermaid />])
      .withDom(
        <body>
          <div className="highlight">
            <pre>
              <code>
                <span className="linenos">1</span>
                {'sequenceDiagram\n'}
                <span className="linenos">2</span>
                {'    Alice->>Bob: Hello'}
              </code>
            </pre>
          </div>
        </body>,
      )
      .renderWithEffects();

    await waitFor(() => {
      expect(render).toHaveBeenCalledWith(
        expect.any(String),
        'sequenceDiagram\n    Alice->>Bob: Hello',
      );
    });
    render.mockRestore();
  });

  it('renders nested legacy candidates only once', async () => {
    const render = jest
      .spyOn(mermaid, 'render')
      .mockResolvedValue({ svg: '<svg />' });
    render.mockClear();

    await TechDocsAddonTester.buildAddonsInTechDocs([<Mermaid />])
      .withDom(
        <body>
          <table className="highlighttable language-text">
            <tbody>
              <tr>
                <td>
                  <div className="highlight">
                    <pre>
                      <code>flowchart LR</code>
                    </pre>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </body>,
      )
      .renderWithEffects();

    await waitFor(() => expect(render).toHaveBeenCalledTimes(1));
    render.mockRestore();
  });

  it('does not render an existing generated diagram again', async () => {
    const render = jest
      .spyOn(mermaid, 'render')
      .mockResolvedValue({ svg: '<svg />' });
    render.mockClear();

    await TechDocsAddonTester.buildAddonsInTechDocs([<Mermaid />])
      .withDom(
        <body>
          <div className="mermaid" data-mermaid-rendered="true">
            <svg>
              <text>Existing diagram</text>
            </svg>
          </div>
        </body>,
      )
      .renderWithEffects();

    expect(render).not.toHaveBeenCalled();
    render.mockRestore();
  });

  it('leaves non-mermaid highlights visible', async () => {
    await TechDocsAddonTester.buildAddonsInTechDocs([<Mermaid />])
      .withDom(
        <body>
          <div className="highlight" data-testid="ordinary-code">
            <pre>
              <code>const answer = 42;</code>
            </pre>
          </div>
        </body>,
      )
      .renderWithEffects();

    expect(screen.getByShadowTestId('ordinary-code')).not.toHaveStyle(
      'display: none',
    );
  });

  describe('error handling', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('restores original element and logs error when render fails', async () => {
      const error = new Error('Parse error');
      jest.spyOn(mermaid, 'render').mockRejectedValue(error);
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await TechDocsAddonTester.buildAddonsInTechDocs([<Mermaid />])
        .withDom(
          <body>
            <pre className="mermaid" data-testid="mermaid-test">
              <code>flowchart LR\ninvalid syntax &&&</code>
            </pre>
          </body>,
        )
        .renderWithEffects();

      const el = screen.getByShadowTestId('mermaid-test');
      expect(el).not.toHaveStyle('display: none');
      expect(el.nextSibling).toBeNull();
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to render mermaid diagram',
        error,
      );
    });
  });

  describe('selectConfig', () => {
    const legacyConfig = { config: { fontFamily: 'legacy-config' } };
    const lightConfig = { lightConfig: { fontFamily: 'light-config' } };
    const darkConfig: MermaidProps = {
      darkConfig: { fontFamily: 'dark-config', theme: 'dark' },
    };

    it('legacy config is preferred for backwards-compatibility', () => {
      let config = selectConfig('light', { ...legacyConfig });
      expect(config).toEqual(legacyConfig.config);

      config = selectConfig('light', { ...legacyConfig, ...lightConfig });
      expect(config).toEqual(legacyConfig.config);
    });

    it('light config is selected for light palette', () => {
      const config = selectConfig('light', { ...lightConfig, ...darkConfig });
      expect(config).toEqual(lightConfig.lightConfig);
    });

    it('dark config is selected for dark palette', () => {
      const config = selectConfig('dark', { ...lightConfig, ...darkConfig });
      expect(config).toEqual(darkConfig.darkConfig);
    });

    it('dark theme is set by default when variant is dark', () => {
      const config = selectConfig('dark', {});
      expect(config).toEqual({ theme: 'dark' });
    });
  });
});
