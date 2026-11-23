/*
 * End-to-end smoke test for the preview bundle.
 *
 * Serves e2e/docs through `techdocs-cli serve` with the built preview app
 * (dist/) and checks in a real browser that diagrams render inside the
 * TechDocs shadow root and that sequence diagram link menus open.
 *
 * Requires: `yarn build` in this workspace, mkdocs with mkdocs-techdocs-core
 * on PATH (served with --no-docker), and Chrome or Chromium. Set CHROME_PATH
 * if the browser isn't in its default location.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(appDir, 'e2e', 'docs');
const bundleDir = join(appDir, 'dist');
const pageUrl = 'http://localhost:3000/docs/default/component/local/';
const expectedDiagrams = 4;

const chromePaths = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function fail(message) {
  throw new Error(message);
}

function startServer() {
  if (!existsSync(join(bundleDir, 'index.html'))) {
    fail(`No preview bundle in ${bundleDir}, run "yarn build" first`);
  }
  const server = spawn(
    'techdocs-cli',
    ['serve', '--no-docker', '--preview-app-bundle-path', bundleDir],
    {
      cwd: docsDir,
      // Own process group, so mkdocs is stopped along with the CLI.
      detached: true,
      env: { ...process.env, BROWSER: 'none' },
    },
  );
  let output = '';
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`techdocs-cli did not start:\n${output}`)),
      120_000,
    );
    const onData = data => {
      output += data;
      if (output.includes('Serving docs in Backstage')) {
        clearTimeout(timer);
        resolve();
      }
    };
    server.stdout.on('data', onData);
    server.stderr.on('data', onData);
    server.on('exit', code => {
      clearTimeout(timer);
      reject(new Error(`techdocs-cli exited with ${code}:\n${output}`));
    });
  });
  return { server, ready };
}

function stopServer(server) {
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    // Already gone.
  }
}

async function run() {
  const { server, ready } = startServer();
  let browser;
  try {
    await ready;

    const executablePath = chromePaths.find(path => existsSync(path));
    if (!executablePath) {
      fail(`No Chrome found, tried: ${chromePaths.join(', ')}`);
    }
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      // GitHub's Ubuntu runners don't allow Chrome's user namespace sandbox.
      args: process.env.CI ? ['--no-sandbox'] : [],
    });
    const page = await browser.newPage();
    page.on('pageerror', error => console.error('[page error]', error));

    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

    // TechDocs renders the page into a shadow root.
    const rendered = await page
      .waitForFunction(
        expected => {
          const root = [...document.querySelectorAll('*')].find(
            element => element.shadowRoot,
          )?.shadowRoot;
          const count =
            root?.querySelectorAll('div.mermaid[data-mermaid-rendered] svg')
              .length ?? 0;
          return count >= expected && count;
        },
        { timeout: 60_000 },
        expectedDiagrams,
      )
      .then(handle => handle.jsonValue())
      .catch(() => 0);
    if (rendered !== expectedDiagrams) {
      fail(`Expected ${expectedDiagrams} rendered diagrams, found ${rendered}`);
    }
    console.log(`✓ ${rendered} diagrams rendered`);

    const visibleSources = await page.evaluate(() => {
      const root = [...document.querySelectorAll('*')].find(
        element => element.shadowRoot,
      ).shadowRoot;
      return [...root.querySelectorAll('pre, .highlight')].filter(
        element =>
          element.style.display !== 'none' &&
          !element.closest('[style*="display: none"]') &&
          /graph|sequenceDiagram/.test(element.textContent),
      ).length;
    });
    if (visibleSources !== 0) {
      fail(`${visibleSources} diagram source block(s) are still visible`);
    }
    console.log('✓ diagram sources hidden');

    // Clicking a participant with `links` opens its menu (#67).
    const actorBox = await page.evaluateHandle(() => {
      const root = [...document.querySelectorAll('*')].find(
        element => element.shadowRoot,
      ).shadowRoot;
      const popup = root.querySelector('g.actorPopupMenu');
      const lifelineId = popup.id.replace(/_popup$/, '');
      return root
        .querySelector(`[id="${lifelineId}"]`)
        .parentElement.querySelector('rect');
    });
    const popupState = () =>
      page.evaluate(() => {
        const root = [...document.querySelectorAll('*')].find(
          element => element.shadowRoot,
        ).shadowRoot;
        const popup = root.querySelector('g.actorPopupMenu');
        return {
          visible: getComputedStyle(popup).display !== 'none',
          // SVG links expose href as an SVGAnimatedString (xlink:href).
          href: popup.querySelector('a')?.href?.baseVal,
        };
      });

    if ((await popupState()).visible) {
      fail('Link menu is open before clicking');
    }
    await actorBox.click();
    const opened = await popupState();
    if (!opened.visible) {
      fail('Link menu did not open after clicking the participant');
    }
    if (opened.href !== 'https://example.com/alice') {
      fail(`Unexpected link in menu: ${opened.href}`);
    }
    console.log('✓ sequence diagram link menu opens');

    // `bs:` nodes link to the catalog. The preview app has no catalog
    // backend, so the title falls back to the name from the entity ref.
    const entityLink = await page.evaluate(() => {
      const root = [...document.querySelectorAll('*')].find(
        element => element.shadowRoot,
      ).shadowRoot;
      const link = [...root.querySelectorAll('div.mermaid a')].find(a =>
        a.href?.baseVal?.startsWith('/catalog/'),
      );
      return link && { href: link.href.baseVal, text: link.textContent.trim() };
    });
    if (entityLink?.href !== '/catalog/default/system/my-system') {
      fail(`Expected a catalog link for bs:system:my-system, found ${JSON.stringify(entityLink)}`);
    }
    if (entityLink.text !== 'my-system') {
      fail(`Unexpected entity node title: ${entityLink.text}`);
    }
    console.log('✓ catalog entity node links to the entity');
  } finally {
    await browser?.close();
    stopServer(server);
  }
}

run().then(
  () => process.exit(0),
  error => {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  },
);
