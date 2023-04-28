import { useState } from "react";
import { Handle, Position } from "reactflow";
import "./fourHandleNode.css";

function FourHandleNode({ data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(data.label);
  console.log(selected);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div
      style={{
        background: "#fff",
        border: `solid ${selected ? " 2px black" : "1px black"}`,
        borderRadius: 4,
        padding: 5,
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

      {!isEditing ? (
        <div
          style={{ padding: "10px", width: "100%" }}
          onDoubleClick={handleClick}
        >
          {value}
        </div>
      ) : (
        <textarea
          value={value}
          id="text"
          name="text"
          className="nodrag"
          onBlur={handleBlur}
          onChange={handleChange}
        />
      )}
    </div>
  );
}

export default FourHandleNode;
