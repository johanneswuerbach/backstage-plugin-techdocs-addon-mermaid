import { bindAppLinks, resolveAppPath } from './links';

describe('resolveAppPath', () => {
  it('keeps paths when the app is served at the root', () => {
    expect(resolveAppPath('/catalog/default/system/a', 'https://bs.example.com')).toBe(
      '/catalog/default/system/a',
    );
  });

  it('removes the base path of apps served under a subpath', () => {
    expect(
      resolveAppPath('/portal/catalog/default/system/a?x=1#y', 'https://example.com/portal/'),
    ).toBe('/catalog/default/system/a?x=1#y');
  });

  it('keeps paths without app.baseUrl', () => {
    expect(resolveAppPath('/catalog', undefined)).toBe('/catalog');
  });
});

describe('bindAppLinks', () => {
  const setup = (attributes: Record<string, string>) => {
    const container = document.createElement('div');
    const link = document.createElementNS('http://www.w3.org/2000/svg', 'a');
    for (const [name, value] of Object.entries(attributes)) {
      link.setAttribute(name, value);
    }
    container.appendChild(link);
    const navigate = jest.fn();
    bindAppLinks(container, navigate);
    const click = (init: MouseEventInit = {}) => {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        ...init,
      });
      link.dispatchEvent(event);
      return event;
    };
    return { navigate, click };
  };

  it('navigates within the app for app paths', () => {
    const { navigate, click } = setup({ href: '/catalog/default/system/a' });

    expect(click().defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith('/catalog/default/system/a');
  });

  it('supports xlink:href', () => {
    const { navigate, click } = setup({ 'xlink:href': '/catalog' });

    click();
    expect(navigate).toHaveBeenCalledWith('/catalog');
  });

  it.each([
    ['other sites', { href: 'https://example.com/' }],
    ['protocol-relative URLs', { href: '//example.com/' }],
    ['links with a target', { href: '/catalog', target: '_blank' }],
  ])('leaves %s to the browser', (_, attributes) => {
    const { navigate, click } = setup(attributes);

    expect(click().defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each([
    ['ctrl', { ctrlKey: true }],
    ['meta', { metaKey: true }],
    ['shift', { shiftKey: true }],
    ['middle', { button: 1 }],
  ])('leaves %s clicks to the browser', (_, init) => {
    const { navigate, click } = setup({ href: '/catalog' });

    expect(click(init).defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
