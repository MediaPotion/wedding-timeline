// Functional wedding timeline builder with drag-and-drop event blocks, header info, and TXT export
import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours < 12 ? "AM" : "PM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return {
    hour: displayHour.toString(),
    minute: minutes.toString().padStart(2, "0"),
    period,
  };
}

function parseTimeInput(hourStr, minuteStr, period) {
  const hours = parseInt(hourStr, 10) % 12;
  const minutes = parseInt(minuteStr, 10);
  let totalMinutes = hours * 60 + minutes;
  if (period === "PM") totalMinutes += 720;
  return totalMinutes;
}

function DraggableEvent({ id, label }) {
  const duration = parseInt(id.split("::")[1], 10);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  let background = "#ffffff";
  if (/Bride \(Pre-Dress\)/i.test(label)) background = "#ffe4e1";
  else if (/Bride \(Dress On\)/i.test(label)) background = "#ffccd5";
  else if (/Bride & Groom:/i.test(label)) background = "#f5e1ff";
  else if (/Bride:/i.test(label)) background = "#fcd5ce";
  else if (/Groom:/i.test(label)) background = "#d0f4de";
  else if (/Ceremony:/i.test(label)) background = "#f0efeb";
  else if (/Reception:/i.test(label)) background = "#e0f7fa";
  else if (/Group Photos:/i.test(label)) background = "#fde2e4";
  else if (/Details:/i.test(label)) background = "#fff1e6";
  else if (/Evening:/i.test(label)) background = "#ff8100";

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

function TimelineRow({ row, index, onChange, onBlur, onDelete }) {
  const timeParts = formatTime(row.time);
  const { setNodeRef } = useDroppable({ id: `row-${index}` });
  return (
    <div
      ref={setNodeRef}
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 2fr 4fr 2fr 1fr",
        alignItems: "center",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div style={{ padding: "4px" }}>
        <textarea
          placeholder="Enter location"
          value={row.location}
          onChange={(e) => onChange(index, "location", e.target.value)}
          rows={2}
          style={{ width: "100%", fontSize: "14px" }}
        />
      </div>
      <div style={{ textAlign: "center", padding: "4px" }}>
        <input
          type="text"
          value={timeParts.hour}
          onChange={(e) => onChange(index, "time", e.target.value, "hour")}
          onBlur={() => onBlur(index)}
          style={{ width: "30px", fontSize: "14px", textAlign: "center" }}
        />
        :
        <input
          type="text"
          value={timeParts.minute}
          onChange={(e) => onChange(index, "time", e.target.value, "minute")}
          onBlur={() => onBlur(index)}
          style={{ width: "30px", fontSize: "14px", textAlign: "center" }}
        />
        <select
          value={timeParts.period}
          onChange={(e) => onChange(index, "time", e.target.value, "period")}
          onBlur={() => onBlur(index)}
          style={{ fontSize: "14px", marginLeft: "4px" }}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      <div style={{ padding: "4px" }}>
        <input
          type="text"
          placeholder="Enter event"
          value={row.event}
          onChange={(e) => onChange(index, "event", e.target.value)}
          onBlur={() => onBlur(index)}
          style={{ width: "100%", fontSize: "14px" }}
        />
      </div>
      <div style={{ padding: "4px", display: "flex", alignItems: "center" }}>
        <input
          type="number"
          min="5"
          step="5"
          value={row.duration}
          onChange={(e) => onChange(index, "duration", e.target.value)}
          onBlur={() => onBlur(index)}
          style={{ width: "60px", fontSize: "14px", marginRight: "4px" }}
        />
        <span style={{ fontSize: "14px" }}>Minutes</span>
      </div>
      <button
        onClick={() => onDelete(index)}
        style={{
          background: "none",
          border: "none",
          color: "red",
          cursor: "pointer",
        }}
        title="Delete row"
      >
        ✕
      </button>
    </div>
  );
}

export default function App() {
  const [rows, setRows] = useState([
    { location: "", time: 9 * 60, event: "", duration: 30 },
  ]);
  const [date, setDate] = useState("");
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [startHour, setStartHour] = useState("9");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("AM");

  // TXT export: double-spaced lines
  const exportTXT = () => {
    const lines = [];
    lines.push(`Date: ${date}`);
    lines.push("");
    lines.push(`Start Time: ${startHour}:${startMinute} ${startPeriod}`);
    lines.push("");
    lines.push(`Bride: ${bride}`);
    lines.push("");
    lines.push(`Groom: ${groom}`);
    lines.push("");
    lines.push("Timeline:");
    lines.push("");
    rows.forEach((r) => {
      if (r.location.trim()) {
        lines.push(r.location.trim());
        lines.push("");
      }
      const t = formatTime(r.time);
      const timeStr = `${t.hour}:${t.minute} ${t.period}`;
      lines.push(`${timeStr} | ${r.event || "(no event)"} | ${r.duration} min`);
      lines.push("");
    });
    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const eventBlocks = [
    "Details: Drone & Venue Shots::20",
    "Details: Rings/Invitations/Accessories::20",
    "Details: Dress Shots::10",
    "Bride (Pre-Dress): Bridemaids Group Shots::10",
    "Bride (Pre-Dress): Bridemaids Individual Shots::10",
    "Bride (Pre-Dress): Hair & Makeup Details::10",
    "Bride (Pre-Dress): Putting Dress On::10",
    "Bride (Dress On): Accessory Shots::10",
    "Bride (Dress On): Bride Portraits::15",
    "Bride (Dress On): Bridemaids Group Shots::10",
    "Bride (Dress On): Bridemaids Individual Shots::10",
    "Bride (Dress On): First Look with Parent::10",
    "Bride (Dress On): First Look with Bridemaids::10",
    "Bride (Dress On): First Look with Groom::10",
    "Narration: Bride Record Narration::15",
    "Narration: Groom Record Narration::15",
    "Groom: Assisted with Tie & Jacket::10",
    "Groom: Portraits::15",
    "Groom: Groomsmen Group Shots::10",
    "Groom: Groomsmen Individual Shots::10",
    "Ceremony: Average::30",
    "Ceremony: Catholic::60",
    "Group Photos: Family (5 Groups)::20",
    "Group Photos: Family (10 Groups)::45",
    "Group Photos: Wedding Party Shots::15",
    "Bride & Groom: Portraits::20",
    "Reception: Grand Entrances::10",
    "Reception: Cake Cutting::5",
    "Reception: Bride & Groom Dance::5",
    "Reception: Bride & Parent Dance::5",
    "Reception: Groom & Parent Dance::5",
    "Reception: Special Dance::5",
    "Reception: Dinner::30",
    "Reception: Speeches (Per Speaker)::10",
    "Evening: Bride & Groom Golden Hour Portraits::20",
    "Evening: Open Dance Floor::20",
    "Evening: Garder Belt Toss::15",
    "Evening: Boquette Toss::15",
  ].map((e) => {
    const [label, dur] = e.split("::");
    return { id: `${label}::${dur}`, label, duration: parseInt(dur, 10) };
  });

  const updateTimesFromIndex = (startIdx, updatedRows) => {
    for (let i = startIdx + 1; i < updatedRows.length; i++) {
      updatedRows[i].time =
        updatedRows[i - 1].time + updatedRows[i - 1].duration;
    }
    return updatedRows;
  };

  const handleChange = (idx, field, val, sub = null) => {
    const newRows = [...rows];
    if (field === "duration") {
      newRows[idx][field] = parseInt(val, 10);
      setRows(updateTimesFromIndex(idx, newRows));
    } else if (field === "time") {
      const curr = formatTime(newRows[idx].time);
      const nt = parseTimeInput(
        sub === "hour" ? val : curr.hour,
        sub === "minute" ? val : curr.minute,
        sub === "period" ? val : curr.period
      );
      newRows[idx].time = nt;
      setRows(updateTimesFromIndex(idx, newRows));
    } else {
      newRows[idx][field] = val;
      setRows(newRows);
    }
  };

  const handleBlur = (idx) => {
    const newRows = [...rows];
    if (idx === newRows.length - 1) {
      const { time, duration } = newRows[idx];
      newRows.push({
        location: "",
        time: time + duration,
        event: "",
        duration: 30,
      });
      setRows(newRows);
    } else {
      setRows(updateTimesFromIndex(idx, newRows));
    }
  };

  const handleDelete = (idx) => {
    const newRows = rows.filter((_, i) => i !== idx);
    setRows(updateTimesFromIndex(Math.max(0, idx - 1), newRows));
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || !over.id.startsWith("row-")) return;
    const i = parseInt(over.id.replace("row-", ""), 10);
    const [lbl, dur] = active.id.split("::");
    const newRows = [...rows];
    newRows[i].event = lbl;
    newRows[i].duration = parseInt(dur, 10);
    if (i === newRows.length - 1) {
      const last = newRows[newRows.length - 1];
      newRows.push({
        location: "",
        time: last.time + last.duration,
        event: "",
        duration: 30,
      });
    }
    setRows(updateTimesFromIndex(i, newRows));
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ flex: 3, padding: "1rem", overflowY: "auto" }}>
          <button onClick={exportTXT} style={{ marginBottom: "1rem" }}>
            Export as TXT
          </button>
          <h1
            style={{
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "2rem",
              color: "#6b4c3b",
              marginBottom: "1rem",
            }}
          >
            Wedding Timeline Builder
          </h1>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <label style={{ marginRight: "8px" }}>Date:</label>
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ fontSize: "14px" }}
              />
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label style={{ marginRight: "8px" }}>
                Start Time for Media Potion:
              </label>
              <input
                type="text"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                style={{ width: "30px", fontSize: "14px", textAlign: "center" }}
              />{" "}
              :{" "}
              <input
                type="text"
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
                style={{ width: "30px", fontSize: "14px", textAlign: "center" }}
              />{" "}
              <select
                value={startPeriod}
                onChange={(e) => setStartPeriod(e.target.value)}
                style={{ fontSize: "14px", marginLeft: "4px" }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <div>
              <label style={{ marginRight: "8px" }}>Bride's Full Name:</label>
              <input
                type="text"
                value={bride}
                onChange={(e) => setBride(e.target.value)}
                style={{ fontSize: "14px", marginRight: "16px" }}
              />
              <label style={{ marginRight: "8px" }}>Groom's Full Name:</label>
              <input
                type="text"
                value={groom}
                onChange={(e) => setGroom(e.target.value)}
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
            Timeline
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 2fr 4fr 2fr 1fr",
              fontWeight: "bold",
              borderBottom: "1px solid #ccc",
              paddingBottom: "8px",
              marginBottom: "8px",
            }}
          >
            <div>Location</div>
            <div style={{ textAlign: "center" }}>Time</div>
            <div>Event</div>
            <div>Duration</div>
            <div></div>
          </div>
          {rows.map((row, index) => (
            <TimelineRow
              key={index}
              row={row}
              index={index}
              onChange={handleChange}
              onBlur={handleBlur}
              onDelete={handleDelete}
            />
          ))}
        </div>
        <div style={{ width: "300px", padding: "1rem", background: "#f3f4f6" }}>
          <h3 style={{ fontWeight: "bold" }}>Event Blocks</h3>
          {eventBlocks.map((block) => (
            <DraggableEvent key={block.id} id={block.id} label={block.label} />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
