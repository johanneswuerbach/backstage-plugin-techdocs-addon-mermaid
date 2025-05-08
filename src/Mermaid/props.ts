import {LayoutLoaderDefinition, MermaidConfig} from 'mermaid';
import { IconLoader } from 'mermaid/dist/rendering-util/icons';

/**
 * Configuration options for controlling D3 zoom and pan behavior in Mermaid diagrams.
 * These options allow fine-tuning of the interactive zoom and pan capabilities.
 */
export interface ZoomOptions {
    /** 
     * Defines the minimum and maximum zoom scale limits.
     * Example: [0.1, 10] allows zooming out to 10% and in to 1000%
     */
    scaleExtent?: [number, number];
    /** 
     * Defines the boundaries for panning the diagram.
     * Format: [[xmin, ymin], [xmax, ymax]]
     * Example: [[-1000, -1000], [1000, 1000]] limits panning to a 2000x2000 area
     */
    translateExtent?: [[number, number], [number, number]];
    /** 
     * Controls whether double-clicking should trigger zoom-to-fit behavior.
     * Defaults to true if not specified.
     */
    enableDoubleClickZoom?: boolean;
}

/**
 * Configuration properties for the Mermaid diagram component.
 * These props allow customization of the diagram's appearance and behavior
 * in both light and dark themes, as well as control over zoom functionality.
 */
export type MermaidProps = {
    lightConfig?: MermaidConfig,
    darkConfig?: MermaidConfig,
    config?: MermaidConfig,
    iconLoaders?: IconLoader[]
    layoutLoaders?: LayoutLoaderDefinition[]
    /** 
     * Enables or disables pan and zoom functionality for all diagrams.
     * When true, users can interact with diagrams using mouse/touch gestures.
     */
    enableZoom?: boolean;
    /** 
     * Configuration options for zoom and pan behavior.
     * Only used when enableZoom is set to true.
     */
    zoomOptions?: ZoomOptions;
}
