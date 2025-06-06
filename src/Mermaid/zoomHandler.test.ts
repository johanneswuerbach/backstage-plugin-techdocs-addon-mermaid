import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { ZoomHandler } from './zoomHandler';

// Mock d3-selection
jest.mock('d3-selection', () => ({
  select: jest.fn(),
  pointer: jest.fn().mockReturnValue([100, 100]),
}));

// Mock d3-zoom
jest.mock('d3-zoom', () => ({
  zoom: jest.fn(() => ({
    scaleExtent: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    scaleBy: jest.fn(),
    transform: jest.fn(),
  })),
  zoomIdentity: {
    translate: jest.fn().mockReturnThis(),
    scale: jest.fn().mockReturnThis(),
  },
}));

describe('ZoomHandler', () => {
  let mockSvgEl: SVGSVGElement;
  let mockG: SVGGElement;
  let zoomHandler: ZoomHandler;
  let mockSelect: jest.Mock;
  let mockZoom: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock elements
    mockSvgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Setup mock select
    mockSelect = select as jest.Mock;
    mockSelect.mockReturnValue({
      attr: jest.fn().mockImplementation((attr) => {
        if (attr === 'transform') {
          return 'translate(0,0) scale(1)';
        }
        return mockSelect.mockReturnValue;
      }),
      call: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
    });

    // Setup mock zoom
    mockZoom = zoom as jest.Mock;

    // Create ZoomHandler instance
    zoomHandler = new ZoomHandler(mockSvgEl, mockG);
  });

  describe('initialize', () => {
    it('should create and attach zoom behavior', () => {
      zoomHandler.initialize();

      expect(mockZoom).toHaveBeenCalled();
      expect(mockSelect).toHaveBeenCalledWith(mockSvgEl);
    });
  });

  describe('wheel events', () => {
    it('should handle wheel zoom with ctrl/cmd key', () => {
      zoomHandler.initialize();

      const wheelEvent = new WheelEvent('wheel', {
        ctrlKey: true,
        deltaY: 100,
      });

      mockSvgEl.dispatchEvent(wheelEvent);

      expect(mockSelect).toHaveBeenCalledWith(mockSvgEl);
    });

    it('should not handle wheel zoom without ctrl/cmd key', () => {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100,
        ctrlKey: false,
        metaKey: false,
      });

      jest.clearAllMocks();
      mockSvgEl.dispatchEvent(wheelEvent);

      // The select mock should not be called with scaleBy
      expect(mockSelect).not.toHaveBeenCalled();
    });
  });

  describe('mouse events', () => {
    it('should handle mouse down with ctrl/cmd key', () => {
      zoomHandler.initialize();

      const mouseDownEvent = new MouseEvent('mousedown', {
        ctrlKey: true,
        clientX: 100,
        clientY: 100,
      });

      mockSvgEl.dispatchEvent(mouseDownEvent);

      expect(mockSvgEl.style.cursor).toBe('grabbing');
    });

    it('should handle mouse move during panning', () => {
      zoomHandler.initialize();

      // Start panning
      const mouseDownEvent = new MouseEvent('mousedown', {
        ctrlKey: true,
        clientX: 100,
        clientY: 100,
      });
      mockSvgEl.dispatchEvent(mouseDownEvent);

      // Move mouse
      const mouseMoveEvent = new MouseEvent('mousemove', {
        ctrlKey: true,
        clientX: 150,
        clientY: 150,
      });
      document.dispatchEvent(mouseMoveEvent);

      expect(mockSelect).toHaveBeenCalledWith(mockSvgEl);
    });

    it('should handle mouse up to stop panning', () => {
      zoomHandler.initialize();

      // Start panning
      const mouseDownEvent = new MouseEvent('mousedown', {
        ctrlKey: true,
        clientX: 100,
        clientY: 100,
      });
      mockSvgEl.dispatchEvent(mouseDownEvent);

      // Stop panning
      const mouseUpEvent = new MouseEvent('mouseup');
      document.dispatchEvent(mouseUpEvent);

      expect(mockSvgEl.style.cursor).toBe('default');
    });
  });
}); 