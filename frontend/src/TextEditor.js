import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import "./textEditor.css";
import FileBar from "./FileBar";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  useStore,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from "reactflow";
import "reactflow/dist/style.css";
import fourHandleNode from "./fourHandleNode";
import imageNode from "./imageNode";

const nodeTypes = {
  fourHandleNode: fourHandleNode,
  selectedNode: {
    border: "2px solid blue",
  },
  imageNode: imageNode,
};

const zoomSelector = (s) => {
  return s.transform;
};

function TextEditor() {
  let offsetProperties = useStore(zoomSelector);

  const quillRef = useRef(null);
  const canvasRef = useRef(null);
  const reactFlowRef = useRef(null);
  let offsetXRef = useRef(0);
  let offsetYRef = useRef(0);
  let scaleRef = useRef(1);
  const [input, setInput] = useState("");
  const [inputList, setInputList] = useState([]);
  const [pageId, setPageId] = useState();
  const [positions, setPositions] = useState({});
  const [addingNode, setAddingNode] = useState(false);

  // react flow

  // should not be able to link to itself.
  const initialEdges = [
    {
      id: "edge-1",
      source: "1",
      target: "2",
      sourceHandle: "top",
      targetHandle: "bottom",
    },
    {
      id: "edge-2",
      source: "1",
      target: "3",
      sourceHandle: "right",
      targetHandle: "left",
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const memoizedNodes = useMemo(() => nodeTypes, []);

  const divRefs = useRef({});
  const boardRef = useRef(null);
  const coordinateRef = useRef({});

  let canvas;
  let context;
  let board;
  let reactFlow;

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

  // coordinates of divs
  let prevPosX;
  let prevPosY;

  useEffect(() => {
    canvas = canvasRef.current;
    board = boardRef.current;
    context = canvas.getContext("2d");
    reactFlow = reactFlowRef.current;
    // reactFlow.addEventListener("wheel", onMouseWheel, false);
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

  const objRef = useRef([]);

  function sizeDiv() {
    for (let i = 0; i < Object.keys(divRefs.current).length; i++) {
      // const currentWidth = parseInt(
      //   getComputedStyle(div).getPropertyValue("width")
      // );
      // const currentHeight = parseInt(
      //   getComputedStyle(div).getPropertyValue("height")
      // );

      if (inputList[i] && positions[inputList[i].key]) {
        let div = divRefs.current[inputList[i].key];
        if (div == null) {
          break;
        }
        const currentX = parseInt(
          getComputedStyle(div).getPropertyValue("left")
        );
        console.log("CURRENT X", currentX);
        const key = inputList[i].key;
        let positionX = positions[inputList[i].key].x;
        let positionY = positions[inputList[i].key].y;
        const x = coordinateRef.current[key].x;
        const y = coordinateRef.current[key].y;

        let originalHeight = 0;
        let originalWidth = 0;
        // if (!objRef.current[i].isOriginal) {
        //   objRef.current[i].isOriginal = true;
        //   objRef.current[i].height = currentHeight;
        //   objRef.current[i].width = currentWidth;

        //   originalHeight = currentHeight;
        //   originalWidth = currentWidth;
        // } else {
        //   originalHeight = objRef.current[i].height;
        //   originalWidth = objRef.current[i].width;
        // }

        // offsetX += positionX - inputList[i].x;
        // offsetY += positionY - inputList[i].y;

        // get coordinates of opposite corner
        let x_corner_scaled =
          (inputList[i].x + originalWidth + offsetX) * scale;
        let y_corner_scaled =
          (inputList[i].y + originalHeight - offsetY) * scale;

        // it was inputList[i].x
        console.log("x: " + x + " y: " + y);
        let x_scaled = (x + offsetX) * scale;
        let y_scaled = (y - offsetY) * scale;
        let newWidth = x_corner_scaled - x_scaled;
        let newHeight = y_corner_scaled - y_scaled;
        // console.log(x_scaled);
        // scale the coordinates
        // get the new height and width
        div.style.bottom = "0px";
        // have to fix the amount it pans and also when the mouse goes over the div.
        div.style.left = "0px";
        // div.style.width = `${50 * scale}px`;
        // div.style.height = `${50 * scale}px`;
        // div.style.width = `${originalWidth * scale}px`;
        // div.style.height = `${originalHeight * scale}px`;

        div.style.fontSize = `${1 * scale}em`;
      }
    }
  }

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

  function onMouseMove(event) {
    const rect = canvas.getBoundingClientRect();

    // get mouse position
    cursorX = event.pageX - rect.left;
    cursorY = event.pageY - rect.top;

    const scaledX = toTrueX(cursorX);
    const scaledY = toTrueY(cursorY);
    const prevScaledX = toTrueX(prevCursorX);
    const prevScaledY = toTrueY(prevCursorY);

    if (leftMouseDown) {
      console.log("entered");
      // add the line to our drawing history
      drawings.push({
        x0: prevScaledX,
        y0: prevScaledY,
        x1: scaledX,
        y1: scaledY,
      });
      // draw a line
      drawLine(prevCursorX, prevCursorY, cursorX, cursorY);
      offsetX += (cursorX - prevCursorX) / scale;
      offsetY += (cursorY - prevCursorY) / scale;
      // think the error is here that it is not accounting for something.
      // ACTUALLY HAVE NO IDEA WHAT THIS IS
      // for (let i = 0; i < divRefs.current.length; i++) {
      //   let div = divRefs.current[i];

      //   let element = div.getBoundingClientRect();
      //   let board = boardRef.current.getBoundingClientRect();
      //   let currentPosX = element.left - board.left;
      //   let currentPosY = board.height - element.top;
      //   if (div == null) {
      //     break;
      //   }
      //   offsetX += (currentPosX - prevPosX) / scale;
      //   offsetY += (currentPosY - prevPosY) / scale;
      //   // console.log("pos y", currentPosY, prevPosY);

      //   prevPosX = currentPosX;
      //   prevPosY = currentPosY;
      // }
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

    // set all the current positions of divs on mouse down.
    // for (let i = 0; i < divRefs.current.length; i++) {
    //   let div = divRefs.current[i];
    //   if (div == null) {
    //     break;
    //   }
    //   let element = div.getBoundingClientRect();
    //   let board = boardRef.current.getBoundingClientRect();
    //   let currentPosX = element.left - board.left;
    //   let currentPosY = board.height - element.top;
    //   prevPosX = currentPosX;
    //   prevPosY = currentPosY;
    // }
  }

  function onMouseUp() {
    leftMouseDown = false;
    rightMouseDown = false;
  }

  // const onMouseWheel = (event) => {
  //   //event.preventDefault();
  //   console.log("wheel");
  //   const deltaY = event.deltaY;
  //   const scaleAmount = -deltaY / 500;
  //   scale = scale * (1 + scaleAmount);

  //   sizeDiv();
  //   // redrawCanvas();
  // };

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
      let key = Math.random().toString();
      setInputList((prevState) => [
        ...prevState,
        {
          key: key,
          value: input,
          x: 50,
          y: 50,
          isOriginal: 0,
          height: 0,
          width: 0,
        },
      ]);

      const newNode = {
        id: key,
        position: { x: 50, y: 50 },
        data: { label: input },
        type: "fourHandleNode",
      };

      setNodes((prevState) => prevState.concat(newNode));

      // do not remember what this is for
      objRef.current.push({ isOriginal: false, height: 0, width: 0 });
      setInput("");

      // hardcoded for now, will get the actual position later.
      setPositions((prevState) => ({
        ...prevState,
        [key]: { x: 50, y: 50 },
      }));
      coordinateRef.current[key] = { x: 50, y: 50 };

      // change orignal x and y values depending on certain factors

      // if (inputList.length != 0) {
      //   const index = divRefs.current.length - 1;
      //   const div = divRefs.current[index];
      //   const rect = div.getBoundingClientRect();
      //   const originalX = rect.left;
      //   const originalY = rect.top;
      //   setInputList(
      //     inputList.map((input, i) => {
      //       if (i === index) {
      //         // Create a *new* object with changes
      //         return { ...input, x: originalX, y: originalY };
      //       } else {
      //         // No changes
      //         return input;
      //       }
      //     })
      //   );
      // }
    }
  };

  const [imageUrl, setImageUrl] = useState(null);

  async function handlePaste() {
    const items = await navigator.clipboard.read();

    const clipboardItem = items[0];
    console.log(clipboardItem);
    if (
      clipboardItem.types.includes("image/png") ||
      clipboardItem.types.includes("image/jpeg")
    ) {
      console.log("handling Paste");

      const blob = await clipboardItem.getType("image/png");
      const url = URL.createObjectURL(blob);
      console.log(url);
      const newNode = {
        id: Math.random().toString(),
        data: {
          imageUrl: url,
        },
        position: { x: 50, y: 50 },
        type: "imageNode",
      };
      setNodes((prevState) => prevState.concat(newNode));
    }

    // for (const item of items) {
    //   for (const type of item.types) {
    //     if (type === "image/png" || type === "image/jpeg") {
    //       const blob = await item.getType(type);
    //       const url = URL.createObjectURL(blob);
    //       setImageUrl(url);
    //       const id = Math.random().toString();
    //       const newNode = {
    //         id: id,
    //         data: {
    //           label: (
    //             <img src={url} style={{ maxWidth: "50%", maxHeight: "50%" }} />
    //           ),
    //         },
    //         position: { x: 50, y: 50 },
    //       };
    //       setNodes((prevState) => prevState.concat(newNode));
    //       return;
    //     }
    //   }
    // }
  }

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
      // console.log(`[${Date.now()}] Data:`, data);
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

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNodeClicked = () => {
    // change the shape of the mouse
    // get position of the mouse
    // where the mouse is clicked, add a node
    setAddingNode(true);
  };

  const handleCanvasClick = (event) => {
    const boundingCanvas = boardRef.current.getBoundingClientRect();
    console.log("offset in click X", offsetXRef.current);

    const offsetXValue = offsetProperties[0];
    const offsetYValue = offsetProperties[1];
    const zoomLevel = offsetProperties[2];
    const position = {
      x: (event.clientX - boundingCanvas.left - offsetXValue) / zoomLevel,
      y: (event.clientY - boundingCanvas.top - offsetYValue) / zoomLevel,
    };
    console.log("zoom", offsetProperties[0], offsetXRef.current);
    if (addingNode) {
      let key = Math.random().toString();

      // console.log(position);

      const newNode = {
        id: key,
        position: position,
        data: { label: "" },
        type: "fourHandleNode",
      };

      setNodes((prevState) => prevState.concat(newNode));

      setAddingNode(false);
    }
  };

  const onMouseWheel = (event) => {
    // alert("entered");
    // console.log(event);
    console.log("hurray");
  };

  // will need to understand this eventually, also only works on backspace, so will have to add the delete button
  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge)
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [nodes, edges]
  );

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
          <button onClick={addNodeClicked}>Add Node</button>
          <button onClick={handlePaste}>Paste Image</button>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            maxZoom={1000}
            minZoom={0.1}
            onPaneClick={handleCanvasClick}
            nodeTypes={memoizedNodes}
            ref={reactFlowRef}
            onNodesDelete={onNodesDelete}
          />

          <canvas className="canvas" ref={canvasRef}></canvas>
        </div>
      </div>
    </>
  );
}

export default TextEditor;
