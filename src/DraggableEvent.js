import React from "react";
import { useDraggable } from "@dnd-kit/core";

export function DraggableEvent({ id, label }) {
  const duration = parseInt(id.split("::")[1], 10);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  let background = "#ffffff";
  if (/Bride \(Pre-Dress\)/i.test(label)) background = "#fce4ec"; // light pink
  else if (/Bride \(Dress On\)/i.test(label))
    background = "#f8bbd0"; // soft pink
  else if (/Bride & Groom/i.test(label)) background = "#ede7f6"; // lavender
  else if (/Bride:/i.test(label)) background = "#fce4ec";
  else if (/Groom/i.test(label)) background = "#e3f2fd"; // light blue
  else if (/Ceremony/i.test(label)) background = "#fff9c4"; // light yellow
  else if (/Group Photos/i.test(label)) background = "#dcedc8"; // light green
  else if (/Reception/i.test(label)) background = "#ffe0b2"; // peach
  else if (/Details/i.test(label)) background = "#e0f7fa"; // light teal

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    padding: "8px",
    margin: "4px 0",
    background,
    border: "1px solid #ccc",
    borderRadius: "8px",
    cursor: "grab",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <span>{label}</span>
      <span style={{ fontSize: "12px", color: "#555" }}>{duration} min</span>
    </div>
  );
}
