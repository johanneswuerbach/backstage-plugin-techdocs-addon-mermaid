import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { configApiRef, useApiHolder } from '@backstage/core-plugin-api';

/**
 * Turns an app path that may include the app's base path (from
 * `app.baseUrl`) into a path for react-router's navigate.
 *
 * Same as TechDocs' `resolveUrlToRelative`, which handles links in the
 * documentation content but isn't exported.
 */
export function resolveAppPath(path: string, appBaseUrl?: string): string {
  if (!appBaseUrl) {
    return path;
  }
  try {
    const basePath = new URL(appBaseUrl).pathname.replace(/\/$/, '');
    const relative = path.startsWith(`${basePath}/`)
      ? path.slice(basePath.length)
      : path;
    const parsed = new URL(relative, 'http://localhost');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return path;
  }
}

/**
 * Navigates to an app path within the app, like TechDocs does for links in
 * the documentation content.
 */
export const useNavigateToAppPath = () => {
  // A ref keeps the callback stable, so diagrams don't re-render on navigation.
  const navigate = useRef(useNavigate());
  const appBaseUrl = useApiHolder()
    .get(configApiRef)
    ?.getOptionalString('app.baseUrl');

  return useCallback(
    (path: string) => navigate.current(resolveAppPath(path, appBaseUrl)),
    [appBaseUrl],
  );
};

const isAppPath = (href: string) => href.startsWith('/') && !href.startsWith('//');

/**
 * Makes app links in a rendered diagram, such as `click A href "/catalog"`,
 * navigate within the app instead of reloading the page. Links to other
 * sites, links with a target (`_blank`) and modifier-key or middle clicks
 * keep the browser's default behavior.
 */
export function bindAppLinks(
  container: Element,
  navigateToAppPath: (path: string) => void,
) {
  container.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href') ?? link.getAttribute('xlink:href');
      const target = link.getAttribute('target');
      if (
        !href ||
        !isAppPath(href) ||
        (target && target !== '_self') ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      navigateToAppPath(href);
    });
  });
}
