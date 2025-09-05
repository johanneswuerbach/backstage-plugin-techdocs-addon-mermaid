/**
 * A module that provides zoom and pan functionality for SVG elements using D3.js.
 * This is used to enhance the interaction capabilities of Mermaid diagrams in TechDocs.
 */

import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { pointer } from 'd3-selection';
import { zoomIdentity } from 'd3-zoom';
import type { ZoomBehavior } from 'd3-zoom';
import { ZoomOptions } from './props';

/**
 * Represents the internal state of the zoom handler
 */
export interface ZoomState {
  /** Whether the user is currently panning the diagram */
  isPanning: boolean;
  /** X coordinate where the panning started */
  startX: number;
  /** Y coordinate where the panning started */
  startY: number;
  /** Current X translation offset */
  translateX: number;
  /** Current Y translation offset */
  translateY: number;
}

/**
 * Handles zoom and pan interactions for SVG elements.
 * Provides functionality for:
 * - Zooming with mouse wheel (Ctrl/Cmd + wheel)
 * - Panning with mouse drag (Ctrl/Cmd + drag)
 * - Maintaining zoom state and transformations
 */
export class ZoomHandler {
  private state: ZoomState = {
    isPanning: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0,
  };

  /**
   * Creates a new ZoomHandler instance
   * @param container - The SVG element to attach zoom behavior to
   * @param diagram - The group element that will be transformed
   * @param options - Optional configuration for zoom behavior
   */
  constructor(
    private container: HTMLElement,
    private diagram: SVGGElement,
    private options: ZoomOptions = {}
  ) {}

  /**
   * Initializes the zoom handler by setting up zoom behavior and event listeners
   */
  public initialize(): void {
    const zb = this.createZoomBehavior();
    this.attachZoomBehavior(zb);
    this.attachEventListeners(zb);
  }

  /**
   * Creates a D3 zoom behavior with configured scale extent
   * @returns Configured D3 zoom behavior
   */
  private createZoomBehavior(): ZoomBehavior<HTMLElement, unknown> {
    return zoom<HTMLElement, unknown>()
      .scaleExtent(this.options.scaleExtent || [0.1, 10])
      .on('zoom', event => {
        select(this.diagram).attr('transform', event.transform.toString());
      });
  }

  /**
   * Attaches the zoom behavior to the SVG element
   * @param zb - The D3 zoom behavior to attach
   */
  private attachZoomBehavior(zb: ZoomBehavior<HTMLElement, unknown>): void {
    select(this.container).call(zb);
    select(this.container).on('.zoom', null);
  }

  /**
   * Sets up all necessary event listeners for zoom and pan interactions
   * @param zb - The D3 zoom behavior to use for transformations
   */
  private attachEventListeners(zb: ZoomBehavior<HTMLElement, unknown>): void {
    this.attachWheelListener(zb);
    this.attachMouseListeners(zb);
  }

  /**
   * Attaches wheel event listener for zoom functionality
   * Requires Ctrl/Cmd key to be pressed while scrolling
   * @param zb - The D3 zoom behavior to use for scaling
   */
  private attachWheelListener(zb: ZoomBehavior<HTMLElement, unknown>): void {
    this.container.addEventListener('wheel', (event: WheelEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      const factor = event.deltaY > 0 ? 0.9 : 1.1;
      const [px, py] = pointer(event, this.container);
      select(this.container).call(zb.scaleBy, factor, [px, py]);
    }, { passive: false });
  }

  /**
   * Attaches mouse event listeners for panning functionality
   * @param zb - The D3 zoom behavior to use for transformations
   */
  private attachMouseListeners(zb: ZoomBehavior<HTMLElement, unknown>): void {
    this.container.addEventListener('mousedown', (event) => {
      // Allow panning by holding meta, ctrl or the middle mouse button
      if (event.metaKey || event.ctrlKey || event.button == 1) {
        this.handleMouseDown(event);
      }
    });

    document.addEventListener('mousemove', (event) => {
      if (this.state.isPanning) {
        this.handleMouseMove(event, zb);
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.state.isPanning) {
        this.handleMouseUp();
      }
    });

    document.addEventListener('mouseleave', () => {
      if (this.state.isPanning) {
        this.handleMouseUp();
      }
    });
  }

  /**
   * Handles the start of a panning operation
   * @param event - The mouse down event that triggered the pan
   */
  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault()

    this.state.isPanning = true;
    this.state.startX = event.clientX;
    this.state.startY = event.clientY;

    const transform = select(this.diagram).attr('transform');
    if (transform) {
      const translateMatch = transform.match(/translate\(([^)]+)\)/);
      if (translateMatch) {
        const [x, y] = translateMatch[1].split(',').map(Number);
        this.state.translateX = x;
        this.state.translateY = y;
      }
    }

    this.container.style.cursor = 'grabbing';
  }

  /**
   * Handles mouse movement during panning
   * @param event - The mouse move event
   * @param zb - The D3 zoom behavior to use for transformations
   */
  private handleMouseMove(event: MouseEvent, zb: ZoomBehavior<HTMLElement, unknown>): void {
    event.preventDefault();

    // Convert current mouse position to SVG coordinates
    const [currentX, currentY] = pointer(event, this.container);
    // Convert the starting mouse position to SVG coordinates
    const [startX, startY] = pointer(
      { clientX: this.state.startX, clientY: this.state.startY },
      this.container,
    );

    // Calculate the movement delta in SVG coordinate space
    const dx = currentX - startX;
    const dy = currentY - startY;

    const transform = select(this.diagram).attr('transform');
    let currentScale = 1;

    if (transform) {
      const scaleMatch = transform.match(/scale\(([^)]+)\)/);
      if (scaleMatch) {
        currentScale = parseFloat(scaleMatch[1]);
      }
    }

    const newTranslateX = this.state.translateX + dx;
    const newTranslateY = this.state.translateY + dy;

    const newTransform = zoomIdentity
      .translate(newTranslateX, newTranslateY)
      .scale(currentScale);
    select(this.container).call(zb.transform, newTransform);
  }

  /**
   * Handles the end of a panning operation
   */
  private handleMouseUp(): void {
    this.state.isPanning = false;
    this.container.style.cursor = 'auto';
  }
} 
