import { useState, useRef, useEffect } from "react";
import { Handle, Position } from "reactflow";
import "./fourHandleNode.css";

function FourHandleNode({ data, selected }) {
  const [value, setValue] = useState(data.label);
  const [color, setColor] = useState(data.color);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [nodeWasClicked, setNodeWasClicked] = useState(false);
  const divRef = useRef(null);

  // let's see if this way of adding cursor works
  useEffect(() => {
    // if (data.justCreated != null && data.justCreated) {
    // divRef.current.focus();
    // divRef.current.contentEditable = true;
    data.justCreated = false;
    // console.log(showColorMenu);
    // }
    if (!selected) {
      setShowColorMenu(false);
      setNodeWasClicked(false);
    }
  });

  //unselect make it not editable.
  const handleClick = (event) => {
    event.target.contentEditable = true;
    event.target.focus();
  };

  const handleBlur = (event) => {
    setShowColorMenu(false);
    event.target.contentEditable = false;
    selected = false;
  };

  const handleChange = (event) => {
    // there are some bugs here that don't render >
    console.log("the value is", event);
    data.label = event.target.innerHTML;
    // setValue(event.target.innerHTML);
    console.log("Data", data);
  };

  const handleColorChange = (colorValue) => {
    data.color = colorValue;
    setColor(colorValue);
  };

  // const handleTextAreaFocus = (event) => {
  //   const length = event.target.value.length;
  //   event.target.setSelectionRange(length, length);
  // };

  const toggleColorSelector = () => {
    setShowColorMenu(!showColorMenu);
  };

  const handleDivFocus = (event) => {
    // how does this work???
    const target = event.target;
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleSelect = () => {
    selected = !selected;
  };

  return (
    <div
      //  style={{ width: 150 }}
      onClick={() => setNodeWasClicked(true)}
      onSelect={handleSelect}
      style={{
        zIndex: 100,
      }}
    >
      {selected && nodeWasClicked ? (
        <>
          <div style={{ position: "absolute" }}>
            <div className="node_editMenu">
              {/* <input
                type="color"
                defaultValue={color}
                onInput={handleColorChange}
              /> */}
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
              <div className="div_colorOptionMenu">
                <div
                  className="div_colorOption"
                  style={{ backgroundColor: "#F51414" }}
                  onClick={() => handleColorChange("#F51414")}
                ></div>
                <div
                  className="div_colorOption"
                  style={{ backgroundColor: "#576BCB" }}
                  onClick={() => handleColorChange("#576BCB")}
                ></div>
                <div
                  className="div_colorOption"
                  style={{ backgroundColor: "#35A650" }}
                  onClick={() => handleColorChange("#35A650")}
                ></div>
                <div
                  className="div_colorOption"
                  style={{ backgroundColor: "#FDEC08" }}
                  onClick={() => handleColorChange("#FDEC08")}
                ></div>
                {/* <div
                  className="div_colorOption"
                  style={{ backgroundColor: "#FF6600" }}
                  onClick={() => handleColorChange("#FF6600")}
                ></div> */}
                <div
                  className="div_colorOption"
                  style={{ backgroundColor: "#856651" }}
                  onClick={() => handleColorChange("#856651")}
                ></div>
                <div
                  className="div_colorOption"
                  style={{ backgroundColor: "#000" }}
                  onClick={() => handleColorChange("#000")}
                ></div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      <div
        className="fourNode_body"
        style={{
          background: "#fff",
          border: `solid ${selected ? "2px" : "1px"} ${color}`,
          borderRadius: 4,
          padding: 5,
          minWidth: 120,
          height: 53,
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
        <div
          ref={divRef}
          style={{
            padding: "10px",
            width: "100%",
            border: "none",
            outline: "0px solid transparent",
            pointerEvents: "auto",
          }}
          onDoubleClick={handleClick}
          onFocus={handleDivFocus}
          onBlur={handleBlur}
          onInput={handleChange}
        >
          {value}
          {/* <img src={data.imageUrl} /> */}
        </div>
      </div>
    </div>
  );
}

export default FourHandleNode;
