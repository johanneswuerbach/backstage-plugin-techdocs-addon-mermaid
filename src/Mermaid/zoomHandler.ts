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
   * @param svgEl - The SVG element to attach zoom behavior to
   * @param g - The group element that will be transformed
   * @param options - Optional configuration for zoom behavior
   */
  constructor(
    private svgEl: SVGSVGElement,
    private g: SVGGElement,
    private options: ZoomOptions = {}
  ) {}

  /**
   * Initializes the zoom handler by setting up zoom behavior and event listeners
   */
  public initialize(): void {
    const zb = this.createZoomBehavior();
    this.attachZoomBehavior(zb);
    this.attachEventListeners(zb);
    // Disable text selection permanently
    this.svgEl.style.userSelect = 'none';
  }

  /**
   * Creates a D3 zoom behavior with configured scale extent
   * @returns Configured D3 zoom behavior
   */
  private createZoomBehavior(): ZoomBehavior<SVGSVGElement, unknown> {
    return zoom<SVGSVGElement, unknown>()
      .scaleExtent(this.options.scaleExtent || [0.1, 10])
      .on('zoom', (event) => {
        select(this.g).attr('transform', event.transform.toString());
      });
  }

  /**
   * Attaches the zoom behavior to the SVG element
   * @param zb - The D3 zoom behavior to attach
   */
  private attachZoomBehavior(zb: ZoomBehavior<SVGSVGElement, unknown>): void {
    select(this.svgEl).call(zb);
    select(this.svgEl).on('.zoom', null);
  }

  /**
   * Sets up all necessary event listeners for zoom and pan interactions
   * @param zb - The D3 zoom behavior to use for transformations
   */
  private attachEventListeners(zb: ZoomBehavior<SVGSVGElement, unknown>): void {
    this.attachWheelListener(zb);
    this.attachMouseListeners(zb);
  }

  /**
   * Attaches wheel event listener for zoom functionality
   * Requires Ctrl/Cmd key to be pressed while scrolling
   * @param zb - The D3 zoom behavior to use for scaling
   */
  private attachWheelListener(zb: ZoomBehavior<SVGSVGElement, unknown>): void {
    this.svgEl.addEventListener('wheel', (event: WheelEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      const factor = event.deltaY > 0 ? 0.9 : 1.1;
      const [px, py] = pointer(event, this.svgEl);
      // @ts-ignore: scaleBy is available on the zoom behavior
      (select(this.svgEl) as any).call(zb.scaleBy, factor, [px, py]);
    }, { passive: false });
  }

  /**
   * Attaches mouse event listeners for panning functionality
   * @param zb - The D3 zoom behavior to use for transformations
   */
  private attachMouseListeners(zb: ZoomBehavior<SVGSVGElement, unknown>): void {
    this.svgEl.addEventListener('mousedown', (event) => {
      if (event.metaKey || event.ctrlKey) {
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
    this.state.isPanning = true;
    this.state.startX = event.clientX;
    this.state.startY = event.clientY;

    const transform = select(this.g).attr('transform');
    if (transform) {
      const translateMatch = transform.match(/translate\(([^)]+)\)/);
      if (translateMatch) {
        const [x, y] = translateMatch[1].split(',').map(Number);
        this.state.translateX = x;
        this.state.translateY = y;
      }
    }

    this.svgEl.style.cursor = 'grabbing';
  }

  /**
   * Handles mouse movement during panning
   * @param event - The mouse move event
   * @param zb - The D3 zoom behavior to use for transformations
   */
  private handleMouseMove(event: MouseEvent, zb: ZoomBehavior<SVGSVGElement, unknown>): void {
    if (!event.metaKey && !event.ctrlKey) {
      this.handleMouseUp();
      return;
    }

    event.preventDefault();

    // Convert current mouse position to SVG coordinates
    const [currentX, currentY] = pointer(event, this.svgEl);
    // Convert the starting mouse position to SVG coordinates
    const [startX, startY] = pointer({ clientX: this.state.startX, clientY: this.state.startY }, this.svgEl);

    // Calculate the movement delta in SVG coordinate space
    const dx = currentX - startX;
    const dy = currentY - startY;

    const transform = select(this.g).attr('transform');
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
    select(this.svgEl).call(zb.transform, newTransform);
  }

  /**
   * Handles the end of a panning operation
   */
  private handleMouseUp(): void {
    this.state.isPanning = false;
    this.svgEl.style.cursor = 'default';
  }
} 