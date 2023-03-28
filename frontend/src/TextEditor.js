import { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./textEditor.css";
import Draggable from "react-draggable";

function TextEditor() {
  const quillRef = useRef(null);
  const canvasRef = useRef(null);
  const [input, setInput] = useState("");
  const [inputList, setInputList] = useState([]);
  const divRefs = useRef([]);

  let canvas;
  let context;

  // list of all strokes drawn
  const drawings = [];

  // coordinates of our cursor
  let cursorX;
  let cursorY;
  let prevCursorX;
  let prevCursorY;

  // zoom amoutn
  let scale = 1;
  // distance from origin
  let offsetX = 0;
  let offsetY = 0;

  // mouse functions
  let leftMouseDown = false;
  let rightMouseDown = false;

  useEffect(() => {
    canvas = canvasRef.current;
    context = canvas.getContext("2d");
    // Mouse Event Handlers
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", onMouseMove, false);
    canvas.addEventListener("wheel", onMouseWheel, false);

    canvas.addEventListener("mouseenter", function () {
      window.addEventListener("wheel", disableScroll);
    });

    canvas.addEventListener("mouseleave", function () {
      window.removeEventListener("wheel", disableScroll);
    });

    redrawCanvas();
  });

  function disableScroll(e) {
    if (canvas.contains(e.target)) {
      e.preventDefault();
    }
  }

  // disable right clicking
  document.oncontextmenu = function () {
    return false;
  };

  // if the window changes size, redraw the canvas
  window.addEventListener("resize", (event) => {
    redrawCanvas();
  });

  const redrawCanvas = () => {
    // set the canvas to the size of the canvas
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < drawings.length; i++) {
      const line = drawings[i];
      drawLine(
        toScreenX(line.x0),
        toScreenY(line.y0),
        toScreenX(line.x1),
        toScreenY(line.y1)
      );
    }
  };

  // convert coordinates
  function toScreenX(xTrue) {
    return (xTrue + offsetX) * scale;
  }
  function toScreenY(yTrue) {
    return (yTrue + offsetY) * scale;
  }

  function toTrueX(xScreen) {
    return xScreen / scale - offsetX;
  }
  function toTrueY(yScreen) {
    return yScreen / scale - offsetY;
  }

  const trueWidth = () => {
    return canvas.clientWidth / scale;
  };

  const trueHeight = () => {
    return canvas.clientHeight / scale;
  };

  function onMouseMove(event) {
    const rect = canvas.getBoundingClientRect();

    // get mouse position
    cursorX = event.pageX - rect.left;
    cursorY = event.pageY - rect.top;
    console.log("cursor x:", cursorX);
    console.log("cursor Y:", cursorY);
    const scaledX = toTrueX(cursorX);
    const scaledY = toTrueY(cursorY);
    const prevScaledX = toTrueX(prevCursorX);
    const prevScaledY = toTrueY(prevCursorY);

    if (leftMouseDown) {
      // add the line to our drawing history
      drawings.push({
        x0: prevScaledX,
        y0: prevScaledY,
        x1: scaledX,
        y1: scaledY,
      });
      // draw a line
      drawLine(prevCursorX, prevCursorY, cursorX, cursorY);
    }
    if (rightMouseDown) {
      // move the screen
      offsetX += (cursorX - prevCursorX) / scale;
      offsetY += (cursorY - prevCursorY) / scale;
      redrawCanvas();
    }
    prevCursorX = cursorX;
    prevCursorY = cursorY;
  }

  function onMouseDown(event) {
    const rect = canvas.getBoundingClientRect();

    // detect left clicks
    if (event.button == 0) {
      leftMouseDown = true;
      rightMouseDown = false;
    }
    // detect right clicks
    if (event.button == 2) {
      rightMouseDown = true;
      leftMouseDown = false;
    }

    // update the cursor coordinates
    cursorX = event.pageX - rect.left;
    cursorY = event.pageY - rect.top;
    prevCursorX = event.pageX - rect.left;
    prevCursorY = event.pageY - rect.top;
  }

  function onMouseUp() {
    leftMouseDown = false;
    rightMouseDown = false;
  }

  const onMouseWheel = (event) => {
    const rect = canvas.getBoundingClientRect();

    const deltaY = event.deltaY;
    const scaleAmount = -deltaY / 500;
    scale = scale * (1 + scaleAmount);

    // zoom the page based on where the cursor is
    var distX = (event.pageX - rect.left) / canvas.clientWidth;
    var distY = (event.pageY - rect.top) / canvas.clientHeight;

    // calculate how much we need to zoom
    const unitsZoomedX = trueWidth() * scaleAmount;
    const unitsZoomedY = trueHeight() * scaleAmount;

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    offsetX -= unitsAddLeft;
    offsetY -= unitsAddTop;

    // for (let i = 0; i < divRefs.current.length; i++) {
    //   let div = divRefs.current[i];
    //   if (div == null) {
    //     break;
    //   }
    //   const currentWidth = parseInt(
    //     getComputedStyle(div).getPropertyValue("width")
    //   );
    //   const currentHeight = parseInt(
    //     getComputedStyle(div).getPropertyValue("height")
    //   );

    //   if (deltaY < 0) {
    //     const newWidth = currentWidth + currentWidth * 0.05;
    //     const newHeight = currentHeight + currentWidth * 0.05;
    //     div.style.width = `${newWidth}px`;
    //     div.style.height = `${newHeight}px`;
    //   } else {
    //     const newWidth = currentWidth - currentWidth * 0.05;
    //     const newHeight = currentHeight - currentWidth * 0.05;
    //     div.style.width = `${newWidth}px`;
    //     div.style.height = `${newHeight}px`;
    //   }
    // }

    redrawCanvas();
  };

  function drawLine(x0, y0, x1, y1) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = "#000";
    context.lineWidth = 2;
    context.stroke();
  }

  const deleteNote = (key) => {
    setInputList(inputList.filter((x) => x.key !== key));
    const editor = quillRef.current.getEditor();
    const text = inputList.find((x) => x.key === key).value;
    const cursorIndex = editor.getText().lastIndexOf(text);
    editor.deleteText(cursorIndex, text.length + 1);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      let key = Math.random();
      setInputList(inputList.concat({ key: key, value: input }));
      setInput("");
    }
  };

  const handleChange = (content, delta, source, editor) => {
    const fullText = editor.getText();
    const cursorIndex = editor.getSelection().index;
    let newTextIndex = fullText.lastIndexOf("\n", cursorIndex - 1);

    const textAfter = fullText.substring(newTextIndex + 1, cursorIndex);
    setInput(textAfter);
  };

  return (
    <>
      <div className="parent-div">
        <div className="text-editor">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            onChange={handleChange}
            onKeyDown={handleKeyPress}
          />
        </div>
        <div className="text-editor">
          <canvas className="canvas" ref={canvasRef}></canvas>
          {inputList.map((input, index) => {
            return (
              <Draggable>
                <div
                  ref={(ref) =>
                    ref &&
                    !divRefs.current.includes(ref) &&
                    divRefs.current.push(ref)
                  }
                  key={input.key}
                  className="box"
                >
                  <button onClick={() => deleteNote(input.key)}>X</button>
                  <div>{input.value}</div>
                </div>
              </Draggable>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default TextEditor;
