"use client"

type ToolbarProps = {
    selectedTool: "rect" | "circle" | "text";
    onToolChange: (tool: "rect" | "circle" | "text") => void;
}

export function Toolbar({ selectedTool, onToolChange }: ToolbarProps) {
    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "60px",
            backgroundColor: "#2a2a2a",
            borderBottom: "1px solid #444",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 20px",
            zIndex: 1000
        }}>
            <h3 style={{ margin: 0, marginRight: "20px", color: "white" }}>Canvo Whiteboard</h3>
            
            <button
                onClick={() => onToolChange("rect")}
                style={{
                    padding: "10px 20px",
                    border: selectedTool === "rect" ? "2px solid #0070f3" : "2px solid #555",
                    backgroundColor: selectedTool === "rect" ? "#0070f3" : "#333",
                    color: "white",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: selectedTool === "rect" ? "bold" : "normal"
                }}
            >
                Rectangle
            </button>
            
            <button
                onClick={() => onToolChange("circle")}
                style={{
                    padding: "10px 20px",
                    border: selectedTool === "circle" ? "2px solid #0070f3" : "2px solid #555",
                    backgroundColor: selectedTool === "circle" ? "#0070f3" : "#333",
                    color: "white",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: selectedTool === "circle" ? "bold" : "normal"
                }}
            >
                Circle
            </button>
            
            <button
                onClick={() => onToolChange("text")}
                style={{
                    padding: "10px 20px",
                    border: selectedTool === "text" ? "2px solid #0070f3" : "2px solid #555",
                    backgroundColor: selectedTool === "text" ? "#0070f3" : "#333",
                    color: "white",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: selectedTool === "text" ? "bold" : "normal"
                }}
            >
                Text
            </button>
        </div>
    );
}
