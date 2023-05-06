import { useState, useRef, useEffect } from "react";
import { Handle, Position } from "reactflow";
import "./fourHandleNode.css";

function FourHandleNode({ data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(data.label);
  const [color, setColor] = useState(data.color);
  const textAreaRef = useRef(null);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleChange = (event) => {
    data.label = event.target.value;
    setValue(event.target.value);
    console.log("Data", data);
  };
  // if (!data.color) {
  //   data.color = "black";
  // }
  const handleColorChange = (event) => {
    console.log("the color is", data.color);
    data.color = event.target.value;
    setColor(event.target.value);
    console.log("Data", data.color);
  };

  const handleTextAreaFocus = (event) => {
    const length = event.target.value.length;
    event.target.setSelectionRange(length, length);
  };

  return (
    <div
    //  style={{ width: 150 }}
    >
      {selected ? (
        <div className="node_editMenu">
          <input
            type="color"
            defaultValue={color}
            onInput={handleColorChange}
          />
        </div>
      ) : null}
      <div
        style={{
          background: "#fff",
          border: `solid ${selected ? "2px" : "1px"} ${color}`,
          borderRadius: 4,
          padding: 5,
          minWidth: 120,
          // width: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Handle
          type="source"
          position={Position.Top}
          style={{ background: "black", position: "absolute" }}
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
            <img src={data.imageUrl} />
          </div>
        ) : (
          <textarea
            value={value}
            ref={textAreaRef}
            id="text"
            name="text"
            className="nodrag"
            onBlur={handleBlur}
            onChange={handleChange}
            autoFocus
            onFocus={handleTextAreaFocus}
          />
        )}
      </div>
    </div>
  );
}

export default FourHandleNode;
