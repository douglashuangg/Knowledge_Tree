import { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import Draggable from "react-draggable";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import "./textEditor.css";
import FileBar from "./FileBar";

function TextEditor() {
  const quillRef = useRef(null);
  const canvasRef = useRef(null);
  const [input, setInput] = useState("");
  const [inputList, setInputList] = useState([]);
  const [pageId, setPageId] = useState();
  const divRefs = useRef([]);
  const boardRef = useRef(null);

  let canvas;
  let context;
  let board;

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
    board = boardRef.current;
    context = canvas.getContext("2d");
    // Mouse Event Handlers
    board.addEventListener("mousedown", onMouseDown);
    board.addEventListener("mouseup", onMouseUp, false);
    board.addEventListener("mouseout", onMouseUp, false);
    board.addEventListener("mousemove", onMouseMove, false);
    board.addEventListener("wheel", onMouseWheel, false);

    // board.addEventListener("mouseenter", function () {
    //   window.addEventListener("wheel", disableScroll);
    // });

    // board.addEventListener("mouseleave", function () {
    //   window.removeEventListener("wheel", disableScroll);
    // });

    // context.drawImage(boardRef, 10, 10);
    // sizeDiv();
    // disable right clicking
    document.oncontextmenu = function () {
      return false;
    };

    // if the window changes size, redraw the canvas
    window.addEventListener("resize", (event) => {
      redrawCanvas();
    });
    redrawCanvas();
  });

  const url = "http://localhost:5000/savePost";

  function sendData(data) {
    axios.post(url, data).then((response) => {
      console.log("DONE");
    });
  }
  // useEffect(() => {
  //   const requestOptions = {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ title: "React Hooks POST Request Example" }),
  //   };
  //   fetch("/home", requestOptions)
  //     .then((res) => res.json())
  //     .then((data) => console.log(data));
  // }, []);

  // function disableScroll(e) {
  //   if (board.contains(e.target)) {
  //     e.preventDefault();
  //   }
  // }

  const redrawCanvas = () => {
    // set the canvas to the size of the canvas
    // board.style.width = `${board.clientWidth}px`;
    // board.style.height = `${board.clientHeight}px`;
    canvas.width = board.clientWidth;
    canvas.height = board.clientHeight;

    // context.fillStyle = "#fff";
    // context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drawings.length; i++) {
      const line = drawings[i];
      // console.log("Original line", line.x0);
      // so it keeps the original line, and then toScreenX scales it.
      drawLine(
        toScreenX(line.x0),
        toScreenY(line.y0),
        toScreenX(line.x1),
        toScreenY(line.y1)
      );
    }

    //sizeDiv();
  };

  function sizeDiv() {
    for (let i = 0; i < divRefs.current.length; i++) {
      let div = divRefs.current[i];
      if (div == null) {
        break;
      }
      const currentWidth = parseInt(
        getComputedStyle(div).getPropertyValue("width")
      );
      const currentHeight = parseInt(
        getComputedStyle(div).getPropertyValue("height")
      );

      const currentY = parseInt(
        getComputedStyle(div).getPropertyValue("bottom")
      );

      const transformation = parseInt(
        getComputedStyle(div).getPropertyValue("transform")
      );
      const currentX = parseInt(getComputedStyle(div).getPropertyValue("left"));
      if (inputList[i]) {
        // div.style.transform = `${"translate(${offsetX}px)"}`;
        div.style.bottom = `${(inputList[i].y - offsetY) * scale}px`;
        // have to fix the amount it pans and also when the mouse goes over the div.
        div.style.left = `${(inputList[i].x + offsetX) * scale}px`;
        div.style.width = `${50 * scale}px`;
        div.style.height = `${50 * scale}px`;
        div.style.fontSize = `${1 * scale}em`;
      }
      //   const newWidth = toScreenX(currentWidth);
      //   const newHeight = toScreenY(currentHeight);
      //   div.style.width = `${newWidth}px`;
      //   div.style.height = `${newHeight}px`;
      //   if (deltaY < 0) {
      //     const newWidth = currentWidth * scale;
      //     const newHeight = currentHeight * scale;
      //     div.style.width = `${newWidth}px`;
      //     div.style.height = `${newHeight}px`;
      //   } else {
      //     const newWidth = currentWidth / scale;
      //     const newHeight = currentHeight / scale;
      //     div.style.width = `${newWidth}px`;
      //     div.style.height = `${newHeight}px`;
      //   }
    }
  }

  // convert coordinates
  function toScreenX(xTrue) {
    // console.log("true:", xTrue + offsetX);

    // console.log("line", xTrue);
    // console.log("line scale", scale);
    // console.log("together", xTrue * scale);
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

    // console.log(cursorX);
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
      // console.log("offset", offsetY);
      sizeDiv();
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
    // console.log(scale);
    // zoom the page based on where the cursor is
    // var distX = (event.pageX - rect.left) / canvas.clientWidth;
    // var distY = (event.pageY - rect.top) / canvas.clientHeight;

    // // calculate how much we need to zoom
    // const unitsZoomedX = trueWidth() * scaleAmount;
    // const unitsZoomedY = trueHeight() * scaleAmount;

    // const unitsAddLeft = unitsZoomedX * distX;
    // const unitsAddTop = unitsZoomedY * distY;

    // offsetX -= unitsAddLeft;
    // offsetY -= unitsAddTop;
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

    //   const newWidth = toScreenX(currentWidth);
    //   const newHeight = toScreenY(currentHeight);
    //   div.style.width = `${newWidth}px`;
    //   div.style.height = `${newHeight}px`;

    //   if (deltaY < 0) {
    //     const newWidth = currentWidth * scale;
    //     const newHeight = currentHeight * scale;
    //     div.style.width = `${newWidth}px`;
    //     div.style.height = `${newHeight}px`;
    //   } else {
    //     const newWidth = currentWidth * scale;
    //     const newHeight = currentHeight * scale;
    //     div.style.width = `${newWidth}px`;
    //     div.style.height = `${newHeight}px`;
    //   }
    // }
    sizeDiv();
    redrawCanvas();
  };

  function drawLine(x0, y0, x1, y1) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    // context.strokeStyle = "#000";
    // context.lineWidth = 2;
    context.stroke();
  }

  const deleteNote = (key) => {
    setInputList(inputList.filter((x) => x.key !== key));
    const editor = quillRef.current.getEditor();
    const text = inputList.find((x) => x.key === key).value;
    const cursorIndex = editor.getText().lastIndexOf(text);
    editor.deleteText(cursorIndex, text.length + 1);
    // Create a new Range object with start and end position of 0
    const range = new Range();
    range.setStart(editor.root, 0);
    range.setEnd(editor.root, 0);

    editor.setSelection(range);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      let key = Math.random();
      setInputList((prevState) => [
        ...prevState,
        { key: key, value: input, x: 50, y: 50 },
      ]);
      setInput("");
    }
  };

  const handleChange = (content, delta, source, editor) => {
    const fullText = editor.getText();
    // Might have to remove this if it screw up with generating boxes
    if (editor.getSelection() != null) {
      const cursorIndex = editor.getSelection().index;
      let newTextIndex = fullText.lastIndexOf("\n", cursorIndex - 1);

      const textAfter = fullText.substring(newTextIndex + 1, cursorIndex);
      setInput(textAfter);
    }
  };

  // Save periodically
  let old;
  useEffect(() => {
    const interval = setInterval(() => {
      let data = quillRef.current.getEditor().getContents()["ops"][0]["insert"];
      console.log(`[${Date.now()}] Data:`, data);
      if (old !== data && pageId) {
        console.log("sent");
        sendData({
          doc: data,
          id: pageId,
        });
        old = data;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  function saveCanvas() {
    // get x and y values
    // get length and width
    // get color
    /* save overall location of the canvas, imagining an origin
        and it would just be how much away from the origin it is. Sounds good.
    */
  }

  return (
    <>
      <FileBar quill={quillRef} setPageId={setPageId} />
      <button onClick={sendData}>CLICK ME</button>
      <div className="parent-div">
        <div className="text-editor">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            onChange={handleChange}
            onKeyDown={handleKeyPress}
          />
        </div>
        <div ref={boardRef} className="canvas_editor">
          <canvas className="canvas" ref={canvasRef}></canvas>
          <div>
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
      </div>
    </>
  );
}

export default TextEditor;
