import { MermaidConfig } from 'mermaid';
import { IconLoader } from 'mermaid/dist/rendering-util/icons';

export type MermaidProps = {
    lightConfig?: MermaidConfig,
    darkConfig?: MermaidConfig,
    config?: MermaidConfig,
    iconLoaders?: IconLoader[]
}
