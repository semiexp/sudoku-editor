import React, { useState, useRef, useEffect, useCallback } from "react";
import { Box, IconButton, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

export type NumberKeypadProps = {
  onKeyPress: (key: string) => void;
  isVisible: boolean;
  onClose: () => void;
};

export const NumberKeypad = ({
  onKeyPress,
  isVisible,
  onClose,
}: NumberKeypadProps) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const keypadRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    if (keypadRef.current) {
      const rect = keypadRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);

    if (keypadRef.current && e.touches.length > 0) {
      const rect = keypadRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    },
    [isDragging, dragOffset.x, dragOffset.y],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        setPosition({
          x: touch.clientX - dragOffset.x,
          y: touch.clientY - dragOffset.y,
        });
      }
    },
    [isDragging, dragOffset.x, dragOffset.y],
  );

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleDragEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleDragEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove]);

  const handleNumberClick = (number: number) => {
    onKeyPress(number.toString());
  };

  const handleBackspaceClick = () => {
    onKeyPress("Backspace");
  };

  return (
    <>
      {isVisible && (
        <Paper
          ref={keypadRef}
          elevation={4}
          sx={{
            position: "fixed",
            left: position.x,
            top: position.y,
            zIndex: 1001,
            padding: 1,
            minWidth: 180,
            userSelect: "none",
            cursor: isDragging ? "grabbing" : "default",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
              cursor: "grab",
              "&:active": {
                cursor: "grabbing",
              },
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <DragIndicatorIcon sx={{ color: "grey.500", fontSize: 16 }} />
            <IconButton size="small" onClick={onClose} sx={{ p: 0.5 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0.5,
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <IconButton
                key={number}
                onClick={() => handleNumberClick(number)}
                sx={{
                  minWidth: 40,
                  minHeight: 40,
                  border: "1px solid",
                  borderColor: "grey.300",
                  "&:hover": {
                    backgroundColor: "primary.light",
                    borderColor: "primary.main",
                  },
                }}
              >
                {number}
              </IconButton>
            ))}
            <IconButton
              onClick={() => handleNumberClick(0)}
              sx={{
                minWidth: 40,
                minHeight: 40,
                border: "1px solid",
                borderColor: "grey.300",
                gridColumn: 2,
                "&:hover": {
                  backgroundColor: "primary.light",
                  borderColor: "primary.main",
                },
              }}
            >
              0
            </IconButton>
            <IconButton
              onClick={handleBackspaceClick}
              sx={{
                minWidth: 40,
                minHeight: 40,
                border: "1px solid",
                borderColor: "grey.300",
                fontSize: "0.8rem",
                gridColumn: 3,
                "&:hover": {
                  backgroundColor: "secondary.light",
                  borderColor: "secondary.main",
                },
              }}
            >
              ⌫
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};
