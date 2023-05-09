import { useState, useRef, useEffect } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import "./rectangleNode.css";

function RectangleNode({ data, selected }) {
  const [color, setColor] = useState(data.color);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [isResizing, setisResizing] = useState(false);
  const [nodeWasClicked, setNodeWasClicked] = useState(false);
  const rectRef = useRef(null);

  useEffect(() => {
    // a lot of console logs
    const parentDiv = rectRef.current.parentNode;
    parentDiv.style.zIndex = -100;
    if (!selected) {
      setNodeWasClicked(false);
    }
  });
  const e = window.onerror;
  window.addEventListener("error", function (event) {
    console.log(event);
    if (event.message === "ResizeObserver loop limit exceeded") {
      event.stopPropagation();
      console.log(event);
      event.preventDefault();
      return true;
    } else {
      return e(...arguments);
    }
  });

  useEffect(() => {
    if (!selected) {
      setShowColorMenu(false);
    }
  });

  const handleColorChange = (colorValue) => {
    // data.color = event.target.value;
    data.color = colorValue;
    setColor(colorValue);
  };

  const toggleColorSelector = () => {
    setShowColorMenu(!showColorMenu);
  };

  const handleResizeStart = () => {
    setisResizing(true);
  };

  const handleResizeStop = () => {
    setisResizing(false);
  };

  return (
    <div
      ref={rectRef}
      className="node_body"
      onClick={() => setNodeWasClicked(true)}
      onBlur={() => setNodeWasClicked(false)}
      style={{
        height: "100%",
        width: "100%",
        border:
          data.color === "#FFF" ? `3px solid black` : `3px solid ${color}`,
        minHeight: 50,
        minWidth: 50,
        backgroundColor: `${color}`,
        zIndex: -100,
        borderRadius: "0.4rem",
        position: "relative",
      }}
    >
      {selected && !isResizing && nodeWasClicked ? (
        <>
          <div
            className="node_menu"
            style={{
              position: "absolute",
              border: "1px solid black",
              top: "-2.5rem",
            }}
          >
            <div
              style={{
                margin: "4px",
                borderRadius: "50%",
                backgroundColor: `${color}`,
                border: `1px solid ${color}`,
                height: 25,
                width: 25,
                cursor: "pointer",
              }}
              onClick={toggleColorSelector}
            ></div>
          </div>
          {showColorMenu && selected ? (
            <div className="node_menu_color">
              <div
                className="div_colorOption"
                style={{ backgroundColor: "#FFDDD2" }}
                onClick={() => handleColorChange("#FFDDD2")}
              ></div>
              <div
                className="div_colorOption"
                style={{ backgroundColor: "#D2DAFF" }}
                onClick={() => handleColorChange("#D2DAFF")}
              ></div>
              <div
                className="div_colorOption"
                style={{ backgroundColor: "#CEEDC7" }}
                onClick={() => handleColorChange("#CEEDC7")}
              ></div>
              <div
                className="div_colorOption"
                style={{ backgroundColor: "#FAF4B7" }}
                onClick={() => handleColorChange("#FAF4B7")}
              ></div>
              {/* <div
                  className="div_colorOption"
                  style={{ backgroundColor: "#FF6600" }}
                  onClick={() => handleColorChange("#FF6600")}
                ></div> */}
              <div
                className="div_colorOption"
                style={{ backgroundColor: "#D0B8A8" }}
                onClick={() => handleColorChange("#D0B8A8")}
              ></div>
              <div
                className="div_colorOption"
                style={{ backgroundColor: "#FFF" }}
                onClick={() => handleColorChange("#FFF")}
              ></div>
            </div>
          ) : null}
        </>
      ) : null}
      <div>
        <NodeResizer
          isVisible={selected}
          minWidth={50}
          minHeight={50}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeStop}
          // position="relative"
          // lineStyle={{ border: "2px solid #ff0071" }}
          // lineClassName=".rf-node__handle-line"
        />
        {/* <Handle
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
        /> */}
      </div>
    </div>
  );
}

export default RectangleNode;
