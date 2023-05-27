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
    // }
    if (!selected) {
      setShowColorMenu(false);
      setNodeWasClicked(false);
    }
  });

  useEffect(() => {
    divRef.current.rows = 1;
    divRef.current.style.height = "auto";
    divRef.current.style.height = divRef.current.scrollHeight + "px";
  }, [value]);

  // useEffect(() => {
  //   divRef.current.style.height = "auto";
  //   divRef.current.style.height = `${divRef.current.scrollHeight}px`;
  // }, [value]);

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
    // will have to change how this works.
    data.label = event.target.value;
    setValue(event.target.value);
    // divRef.current.style.height = "auto";
    // divRef.current.style.height = `${divRef.current.scrollHeight + 50}px`;
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
      onClick={() => setNodeWasClicked(true)}
      onSelect={handleSelect}
      style={{
        zIndex: 100,
        width: 180,
        border: selected ? "1px solid #3b65ff" : null,
        padding: 2,
      }}
    >
      {selected && nodeWasClicked ? (
        <>
          <div
            className="node_editMenu"
            style={{
              position: "absolute",
              border: "1px solid black",
              top: "-2.7rem",
            }}
          >
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
              {/* <div
                  className="div_colorOption"
                  style={{ backgroundColor: "#faf20c" }}
                  onClick={() => handleColorChange("#faf20c")}
                ></div> */}
              <div
                className="div_colorOption"
                style={{ backgroundColor: "#856651" }}
                onClick={() => handleColorChange("#856651")}
              ></div>
              <div
                className="div_colorOption"
                style={{ backgroundColor: "#FFF" }}
                onClick={() => handleColorChange("#FFF")}
              ></div>
              <div
                className="div_colorOption"
                style={{ backgroundColor: "#000" }}
                onClick={() => handleColorChange("#000")}
              ></div>
            </div>
          ) : null}
        </>
      ) : null}

      <div
        className="fourNode_body"
        style={{
          background: "#fff",
          border: `solid ${selected ? "1px" : "1.5px"} ${
            color === "#FFF" ? "black" : color
          }`,
          backgroundColor: `${color}`,
          borderRadius: 4,
          padding: 5,
          paddingBottom: 20,
          paddingTop: 20,
          minWidth: 90,
          // height: 53,
          // width: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          paddingRight: 0,
          paddingLeft: 5,
        }}
      >
        <Handle
          type="any"
          position={Position.Top}
          style={{
            background: color === "#FFF" ? "black" : color,
            position: "absolute",
          }}
          id="top"
        />
        <Handle
          type="any"
          position={Position.Right}
          style={{ background: color === "#FFF" ? "black" : color }}
          id="right"
        />
        <Handle
          type="any"
          position={Position.Bottom}
          style={{ background: color === "#FFF" ? "black" : color, left: "10" }}
          id="bottom"
        />
        <Handle
          type="any"
          position={Position.Left}
          style={{ background: color === "#FFF" ? "black" : color }}
          id="left"
        />
        <textarea
          ref={divRef}
          style={{
            width: "90%",
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            border: "none",
            outline: "0px solid transparent",
            pointerEvents: "auto",
            // outline: "none",
            resize: "none",
            // boxSizing: "border-box",
            fontFamily: "Arial",
            fontSize: "1.2rem",
            lineHeight: "1.3rem",
            textAlign: "center",
            // height: "4rem",
            backgroundColor: `${color}`,
            color: color === "#FFF" ? "black" : "#fff",
            overflow: "hidden",
          }}
          onDoubleClick={handleClick}
          onFocus={handleDivFocus}
          onBlur={handleBlur}
          onInput={handleChange}
          value={value}
          onChange={handleChange}
        >
          {/* <img src={data.imageUrl} /> */}
        </textarea>
      </div>
    </div>
  );
}

export default FourHandleNode;
