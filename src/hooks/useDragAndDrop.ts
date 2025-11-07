// src/hooks/useDragAndDrop.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { Square } from '@/types';

export interface DragState {
  isDragging: boolean;
  draggedPiece: string | null;
  draggedFrom: Square | null;
  dropTarget: Square | null;
}

export interface UseDragAndDropReturn {
  dragState: DragState;
  handleMouseDown: (e: React.MouseEvent, square: Square, piece: string | null) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
  resetDragState: () => void;
}

interface UseDragAndDropProps {
  makeMove?: (from: string, to: string) => boolean;
  flipped?: boolean;
  currentTurn?: string;
}

export function useDragAndDrop(props?: UseDragAndDropProps): UseDragAndDropReturn {
  const { makeMove, flipped = false, currentTurn } = props || {};
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedPiece: null,
    draggedFrom: null,
    dropTarget: null
  });

  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const mouseMoveListener = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseUpListener = useRef<((e: MouseEvent) => void) | null>(null);
  const dragStateRef = useRef(dragState);

  // Mantener una referencia actualizada del estado
  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  // Iniciar arrastre
  const handleMouseDown = useCallback((e: React.MouseEvent, square: Square, piece: string | null) => {
    if (!piece) return;

    e.preventDefault();
    e.stopPropagation();

    // Verificar que es el turno del jugador correcto
    const pieceColor = piece[0];
    if (currentTurn && pieceColor !== currentTurn) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const newDragState = {
      isDragging: true,
      draggedPiece: piece,
      draggedFrom: square,
      dropTarget: null
    };

    setDragState(newDragState);
    dragStateRef.current = newDragState;

    // Agregar listeners globales para mouse move y mouse up
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;

      const boardElement = document.querySelector('[data-board]') as HTMLElement;
      if (!boardElement) return;

      const boardRect = boardElement.getBoundingClientRect();
      const mouseX = e.clientX - boardRect.left;
      const mouseY = e.clientY - boardRect.top;

      const squareSize = boardRect.width / 8;
      const fileIndex = Math.floor(mouseX / squareSize);
      const rankIndex = Math.floor(mouseY / squareSize);

      // Convertir a notación de ajedrez
      const file = String.fromCharCode(97 + (flipped ? 7 - fileIndex : fileIndex));
      const rank = flipped ? rankIndex + 1 : 8 - rankIndex;

      if (rank >= 1 && rank <= 8) {
        const dropTarget: Square = { file, rank };
        setDragState(prev => ({
          ...prev,
          dropTarget
        }));
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging || !dragStateRef.current.draggedFrom) {
        setDragState({
          isDragging: false,
          draggedPiece: null,
          draggedFrom: null,
          dropTarget: null
        });
        dragStateRef.current = {
          isDragging: false,
          draggedPiece: null,
          draggedFrom: null,
          dropTarget: null
        };
        if (mouseMoveListener.current) {
          document.removeEventListener('mousemove', mouseMoveListener.current);
          mouseMoveListener.current = null;
        }
        if (mouseUpListener.current) {
          document.removeEventListener('mouseup', mouseUpListener.current);
          mouseUpListener.current = null;
        }
        return;
      }

      const boardElement = document.querySelector('[data-board]') as HTMLElement;
      if (!boardElement) {
        setDragState({
          isDragging: false,
          draggedPiece: null,
          draggedFrom: null,
          dropTarget: null
        });
        dragStateRef.current = {
          isDragging: false,
          draggedPiece: null,
          draggedFrom: null,
          dropTarget: null
        };
        if (mouseMoveListener.current) {
          document.removeEventListener('mousemove', mouseMoveListener.current);
          mouseMoveListener.current = null;
        }
        if (mouseUpListener.current) {
          document.removeEventListener('mouseup', mouseUpListener.current);
          mouseUpListener.current = null;
        }
        return;
      }

      const boardRect = boardElement.getBoundingClientRect();
      const mouseX = e.clientX - boardRect.left;
      const mouseY = e.clientY - boardRect.top;

      // Verificar que está dentro del tablero
      if (mouseX >= 0 && mouseX <= boardRect.width && mouseY >= 0 && mouseY <= boardRect.height) {
        const squareSize = boardRect.width / 8;
        const fileIndex = Math.floor(mouseX / squareSize);
        const rankIndex = Math.floor(mouseY / squareSize);

        const file = String.fromCharCode(97 + (flipped ? 7 - fileIndex : fileIndex));
        const rank = flipped ? rankIndex + 1 : 8 - rankIndex;

        if (rank >= 1 && rank <= 8) {
          const to: Square = { file, rank };
          const from = dragStateRef.current.draggedFrom;

          // Solo ejecutar el movimiento si es diferente de la casilla de origen
          if (from && (from.file !== to.file || from.rank !== to.rank)) {
            const fromStr = `${from.file}${from.rank}`;
            const toStr = `${to.file}${to.rank}`;
            
            if (makeMove) {
              makeMove(fromStr, toStr);
            }
          }
        }
      }

      setDragState({
        isDragging: false,
        draggedPiece: null,
        draggedFrom: null,
        dropTarget: null
      });
      dragStateRef.current = {
        isDragging: false,
        draggedPiece: null,
        draggedFrom: null,
        dropTarget: null
      };

      if (mouseMoveListener.current) {
        document.removeEventListener('mousemove', mouseMoveListener.current);
        mouseMoveListener.current = null;
      }
      if (mouseUpListener.current) {
        document.removeEventListener('mouseup', mouseUpListener.current);
        mouseUpListener.current = null;
      }
    };

    mouseMoveListener.current = handleGlobalMouseMove;
    mouseUpListener.current = handleGlobalMouseUp;

    document.addEventListener('mousemove', mouseMoveListener.current);
    document.addEventListener('mouseup', mouseUpListener.current);
  }, [makeMove, flipped, currentTurn]);

  // Durante el arrastre - mantener para compatibilidad pero no se usa directamente
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Este handler se mantiene por compatibilidad pero el manejo real está en los listeners globales
  }, []);

  // Soltar pieza - mantener para compatibilidad
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Este handler se mantiene por compatibilidad pero el manejo real está en los listeners globales
  }, []);

  // Reiniciar estado de arrastre
  const resetDragState = useCallback(() => {
    const clearedState = {
      isDragging: false,
      draggedPiece: null,
      draggedFrom: null,
      dropTarget: null
    };
    setDragState(clearedState);
    dragStateRef.current = clearedState;
    
    if (mouseMoveListener.current) {
      document.removeEventListener('mousemove', mouseMoveListener.current);
      mouseMoveListener.current = null;
    }
    if (mouseUpListener.current) {
      document.removeEventListener('mouseup', mouseUpListener.current);
      mouseUpListener.current = null;
    }
  }, []);

  return {
    dragState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetDragState
  };
}
