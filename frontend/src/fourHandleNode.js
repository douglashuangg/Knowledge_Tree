import { useCallback } from "react";
import { Handle, Position } from "reactflow";

function fourHandleNode({ data }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #000",
        borderRadius: 4,
        padding: 10,
        minWidth: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Handle
        type="source"
        position={Position.Top}
        style={{ background: "black" }}
        id="top"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "black" }}
        id="right"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        style={{ background: "black", left: "10" }}
        id="bottom"
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "black" }}
        id="left"
      />
      <div>{data.label}</div>
    </div>
  );
}

export default fourHandleNode;
