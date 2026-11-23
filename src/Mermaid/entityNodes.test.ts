import { CompoundEntityRef } from '@backstage/catalog-model';
import { EntityNodeLookup, resolveEntityNodes } from './entityNodes';

const titles: Record<string, string> = {
  'system:default/my-system': 'My System',
  'component:team-a/my-api': 'My "API" #1',
};

const key = (ref: CompoundEntityRef) =>
  `${ref.kind}:${ref.namespace}/${ref.name}`.toLocaleLowerCase('en-US');

const lookup: EntityNodeLookup = {
  title: jest.fn(async ref => titles[key(ref)] ?? ref.name),
  url: ref => `/catalog/${ref.namespace}/${ref.kind}/${ref.name}`,
};

describe('resolveEntityNodes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('replaces entity labels with titles and links the nodes', async () => {
    const text = [
      'flowchart LR',
      '  sys["bs:system:my-system"]',
      '  api(["bs:component:team-a/my-api"])',
      '  sys --> api',
    ].join('\n');

    expect(await resolveEntityNodes(text, lookup)).toBe(
      [
        'flowchart LR',
        '  sys["My System"]',
        '  api(["My #quot;API#quot; #35;1"])',
        '  sys --> api',
        '  click sys href "/catalog/default/system/my-system"',
        '  click api href "/catalog/team-a/component/my-api"',
      ].join('\n'),
    );
  });

  it('handles nodes declared inline in edges', async () => {
    const text = 'graph TD\n  a["bs:system:my-system"]-->b["Plain"]';

    expect(await resolveEntityNodes(text, lookup)).toBe(
      'graph TD\n  a["My System"]-->b["Plain"]\n  click a href "/catalog/default/system/my-system"',
    );
  });

  it('looks up each entity once', async () => {
    const text = 'graph TD\n  a["bs:system:my-system"]\n  b["bs:system:my-system"]';

    await resolveEntityNodes(text, lookup);

    expect(lookup.title).toHaveBeenCalledTimes(1);
  });

  it('skips front matter and directives when detecting flowcharts', async () => {
    const text = [
      '---',
      'title: Systems',
      '---',
      "%%{init: {'theme': 'dark'}}%%",
      'flowchart LR',
      '  a["bs:system:my-system"]',
    ].join('\n');

    expect(await resolveEntityNodes(text, lookup)).toContain('a["My System"]');
  });

  it('leaves the node unlinked when there is no entity route', async () => {
    const text = 'graph TD\n  a["bs:system:my-system"]';

    expect(
      await resolveEntityNodes(text, { ...lookup, url: () => undefined }),
    ).toBe('graph TD\n  a["My System"]');
  });

  it('leaves refs without a kind alone', async () => {
    const text = 'graph TD\n  a["bs:my-system"]';

    expect(await resolveEntityNodes(text, lookup)).toBe(text);
    expect(lookup.title).not.toHaveBeenCalled();
  });

  it('only changes flowcharts', async () => {
    const text = 'sequenceDiagram\n  participant a as "bs:system:my-system"';

    expect(await resolveEntityNodes(text, lookup)).toBe(text);
  });
});
