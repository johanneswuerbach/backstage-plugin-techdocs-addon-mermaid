import { CompoundEntityRef, parseEntityRef } from '@backstage/catalog-model';

/**
 * Looks up how to show a catalog entity in a diagram.
 */
export interface EntityNodeLookup {
  /** The entity's display title. */
  title(ref: CompoundEntityRef): Promise<string>;
  /** A link to the entity, or undefined to leave the node unlinked. */
  url(ref: CompoundEntityRef): string | undefined;
}

const labelPrefix = 'bs:';

/**
 * A flowchart node whose label is `bs:<entity ref>`, in any node shape:
 * `api["bs:component:my-api"]`, `db[("bs:resource:my-db")]`, ...
 * Captures the node id, the shape opening and the entity ref.
 */
const entityNodePattern =
  /(^|[\s;&>-])([\w-]+)(\s*[[({>/\\]+)"bs:([^"\s]+)"/gm;

/** Front matter (`---` ... `---`), `%%` directives and comments, blank lines. */
const preamblePattern = /^(?:\s*---\n[\s\S]*?\n---\s*\n)?(?:\s*(?:%%.*)?\n)*/;

const isFlowchart = (text: string) =>
  /^\s*(?:graph|flowchart)\b/.test(text.replace(preamblePattern, ''));

/** Mermaid labels are double-quoted; it encodes `"` and `#` as entities. */
const escapeLabel = (label: string) =>
  label.replace(/#/g, '#35;').replace(/"/g, '#quot;');

/**
 * Turns flowchart nodes labelled `"bs:<entity ref>"` into catalog entities:
 * the label becomes the entity's title and the node links to the entity.
 *
 * Diagrams stay valid mermaid without this step, so they still render in
 * other markdown previews, just with the raw ref as label.
 *
 * Refs use the standard catalog format, `<kind>:[<namespace>/]<name>`, for
 * example `bs:system:my-system`. Refs that don't parse are left as they are.
 */
export async function resolveEntityNodes(
  text: string,
  lookup: EntityNodeLookup,
): Promise<string> {
  if (!text.includes(`"${labelPrefix}`) || !isFlowchart(text)) {
    return text;
  }

  const refs = new Map<string, CompoundEntityRef>();
  for (const match of text.matchAll(entityNodePattern)) {
    const raw = match[4];
    if (!refs.has(raw)) {
      try {
        refs.set(raw, parseEntityRef(raw, { defaultNamespace: 'default' }));
      } catch {
        // Not a valid entity ref (e.g. the kind is missing), leave it alone.
      }
    }
  }
  if (refs.size === 0) {
    return text;
  }

  const titles = new Map(
    await Promise.all(
      [...refs].map(
        async ([raw, ref]) => [raw, await lookup.title(ref)] as const,
      ),
    ),
  );

  const links = new Map<string, string>();
  const resolved = text.replace(
    entityNodePattern,
    (whole, before: string, id: string, shape: string, raw: string) => {
      const ref = refs.get(raw);
      if (!ref) {
        return whole;
      }
      const url = lookup.url(ref);
      // App routes never contain quotes; refuse anything that would break out.
      if (url && !url.includes('"')) {
        links.set(id, url);
      }
      return `${before}${id}${shape}"${escapeLabel(titles.get(raw)!)}"`;
    },
  );

  const clicks = [...links].map(
    ([id, url]) => `  click ${id} href "${url}"`,
  );
  return clicks.length ? `${resolved}\n${clicks.join('\n')}` : resolved;
}
