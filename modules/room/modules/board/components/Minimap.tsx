import { useEffect, useMemo, useRef, useState } from 'react';

import { motion, useMotionValue } from 'framer-motion';

import { CANVAS_SIZE } from '@/common/constants/canvasSize';
import { useViewportSize } from '@/common/hooks/useViewportSize';

import { useRefs } from '../../../hooks/useRefs';
import { useBoardPosition } from '../hooks/useBoardPosition';

const MiniMap = ({ dragging }: { dragging: boolean }) => {
  const { minimapRef } = useRefs();
  const boardPos = useBoardPosition();
  const { width, height } = useViewportSize();

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const [draggingMinimap, setDraggingMinimap] = useState(false);

  useEffect(() => {
    // Create a single update function to handle both x and y changes
    const updatePositionFromBoard = () => {
      setX(boardPos.x.get());
      setY(boardPos.y.get());
    };
    
    // Initial update
    updatePositionFromBoard();
    
    // Subscribe to both x and y changes
    const unsubscribeX = boardPos.x.on("change", updatePositionFromBoard);
    const unsubscribeY = boardPos.y.on("change", updatePositionFromBoard);
    
    // Clean up subscriptions
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [boardPos.x, boardPos.y]);

  const containerRef = useRef<HTMLDivElement>(null);

  const miniX = useMotionValue(0);
  const miniY = useMotionValue(0);

  const divider = useMemo(() => {
    if (width > 1600) return 7;
    if (width > 1000) return 10;
    if (width > 600) return 14;
    return 20;
  }, [width]);

  useEffect(() => {
    const handleMiniXChange = (newX: number) => {
      if (!dragging) boardPos.x.set(Math.floor(-newX * divider));
    };
    
    const handleMiniYChange = (newY: number) => {
      if (!dragging) boardPos.y.set(Math.floor(-newY * divider));
    };
    
    const unsubscribeX = miniX.on("change", handleMiniXChange);
    const unsubscribeY = miniY.on("change", handleMiniYChange);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [boardPos.x, boardPos.y, divider, dragging, miniX, miniY]);

  return (
    <div
      className="absolute right-10 top-10 z-30 overflow-hidden rounded-lg shadow-lg"
      style={{
        width: CANVAS_SIZE.width / divider,
        height: CANVAS_SIZE.height / divider,
      }}
      ref={containerRef}
    >
      <canvas
        ref={minimapRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        className="h-full w-full"
      />
      <motion.div
        drag
        dragConstraints={containerRef}
        dragElastic={0}
        dragTransition={{ power: 0, timeConstant: 0 }}
        onDragStart={() => setDraggingMinimap(true)}
        onDragEnd={() => setDraggingMinimap(false)}
        className="absolute top-0 left-0 cursor-grab rounded-lg border-2 border-red-500"
        style={{
          width: width / divider,
          height: height / divider,
          x: miniX,
          y: miniY,
        }}
        animate={{ x: -x / divider, y: -y / divider }}
        transition={{ duration: 0 }}
      />
    </div>
  );
};

export default MiniMap;