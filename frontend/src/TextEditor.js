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
  // let offsetYRef = useRef(0);
  // let scaleRef = useRef(1);
  const [input, setInput] = useState("");
  const [inputList, setInputList] = useState([]);
  const [pageId, setPageId] = useState();
  const [positions, setPositions] = useState({});
  const [addingNode, setAddingNode] = useState(false);
  const [files, setFiles] = useState([]);
  let [listLength, setListLength] = useState(1);
  const [imageUrl, setImageUrl] = useState(null);

  let pageIdRef = useRef();

  // should not be able to link to itself.
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const memoizedNodes = useMemo(() => nodeTypes, []);

  const divRefs = useRef({});
  const boardRef = useRef(null);
  const coordinateRef = useRef({});

  let canvas;
  let context;
  let board;

  useEffect(() => {
    canvas = canvasRef.current;
    board = boardRef.current;
    context = canvas.getContext("2d");
    // reactFlow = reactFlowRef.current;
    // reactFlow.addEventListener("wheel", onMouseWheel, false);
    // Mouse Event Handlers
    // board.addEventListener("mousedown", onMouseDown);
    // board.addEventListener("mouseup", onMouseUp, false);
    // board.addEventListener("mouseout", onMouseUp, false);
    // board.addEventListener("mousemove", onMouseMove, false);
    // board.addEventListener("wheel", onMouseWheel, false);

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
    // window.addEventListener("resize", (event) => {
    //   redrawCanvas();
    // });
    // redrawCanvas();
  });

  const fetchDataUrl = "http://localhost:5000/fetchFileData";

  useEffect(() => {
    if (pageIdRef.current) {
      axios
        .get(fetchDataUrl, {
          params: {
            pageId: pageIdRef.current,
          },
        })
        .then((response) => {
          const savedNodes = response.data.nodeData.map((file) => {
            return {
              id: file.node_id.toString(),
              type: file.type,
              data: { label: file.text, color: "red" },
              position: {
                x: parseInt(file.x),
                y: parseInt(file.y),
                height: file.height,
                width: file.width,
              },
            };
          });

          const savedEdges = response.data.edgeData.map((edge) => {
            return {
              id: edge.id.toString(),
              source: edge.source,
              target: edge.target,
              sourceHandle: edge.source_handle,
              targetHandle: edge.target_handle,
            };
          });
          setNodes(savedNodes);
          setEdges(savedEdges);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [pageIdRef.current]);

  const url = "http://localhost:5000/savePost";

  function sendData(data) {
    axios.post(url, data).then((response) => {
      console.log("DONE");
    });
  }

  const objRef = useRef([]);

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
        position: { x: 50, y: 50 },
        data: { label: input },
        type: "fourHandleNode",
      };

      axios
        .post("http://localhost:5000/saveNode", {
          pageId: pageIdRef.current,
          newNode: newNode,
        })
        .then((response) => {
          // setNodes((prevState) => prevState.concat(response.data));
        });

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
    const firstLine = fullText.split("\n")[0];
    console.log("pageId", pageIdRef);
    if (fullText.trim() !== "") {
      setFiles((prev) =>
        prev.map((file) => {
          return file.file_id === pageIdRef.current
            ? { ...file, title: firstLine, body: fullText }
            : file;
        })
      );
    } else {
      setFiles((prev) =>
        prev.map((file) => {
          return file.file_id === pageIdRef.current
            ? { ...file, title: "Untitled", body: fullText }
            : file;
        })
      );
    }

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
      // make sure there is a pageId before saving to database
      if (old !== data && pageId) {
        sendData({
          doc: data,
          id: pageId,
          nodes: nodes,
          edges: edges,
        });
        old = data;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [nodes, edges]);

  function saveCanvas() {
    // get x and y values
    // get length and width
    // get color
    /* save overall location of the canvas, imagining an origin
        and it would just be how much away from the origin it is. Sounds good.
    */
  }

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
      console.log("edge", params);
    },
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
      x: (
        (event.clientX - boundingCanvas.left - offsetXValue) /
        zoomLevel
      ).toFixed(2),
      y: (
        (event.clientY - boundingCanvas.top - offsetYValue) /
        zoomLevel
      ).toFixed(2),
    };
    console.log("zoom", offsetProperties[0], offsetXRef.current);
    console.log(listLength);
    console.log("X", position.x);
    if (addingNode) {
      const newNode = {
        position: position,
        data: { label: "" },
        type: "fourHandleNode",
      };

      axios
        .post("http://localhost:5000/saveNode", {
          pageId: pageIdRef.current,
          newNode: newNode,
        })
        .then((response) => {
          console.log("RESPONSE", response.data);
          const createdNode = response.data;
          console.log("created", createdNode.x, createdNode.y);
          const newNode = {
            id: createdNode.node_id.toString(),
            type: createdNode.type,
            data: { label: createdNode.text, color: "red" },
            position: {
              x: parseInt(createdNode.x),
              y: parseInt(createdNode.y),
            },
          };
          setNodes((prevState) => prevState.concat(newNode));
        });

      setAddingNode(false);
    }
  };

  // will need to understand this eventually, also only works on backspace, so will have to add the delete button
  const onNodesDelete = useCallback(
    (deleted) => {
      const deletedId = deleted[0].id;
      axios.delete("http://localhost:5000/deleteNode", {
        data: {
          deletedId: deletedId,
        },
      });
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);
          console.log("CONNECTED", connectedEdges);

          // axios statement here.
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

  const test = () => {
    const newNode = {
      id: "900",
      type: "fourHandleNode",
      data: { label: "test", color: "red" },
      position: {
        x: 100,
        y: 100,
      },
    };
    setNodes((prev) => prev.concat(newNode));
  };

  const onEdgesDelete = (edgeToDelete) => {
    axios
      .delete("http://localhost:5000/deleteEdge", {
        data: {
          edgeToDelete: edgeToDelete[0],
        },
      })
      .then((response) => {
        console.log("RESPONSE", response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <FileBar
        quill={quillRef}
        setPageId={setPageId}
        files={files}
        setFiles={setFiles}
        pageIdRef={pageIdRef}
      />
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
          <button onClick={test}>Click it</button>
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
            onEdgesDelete={onEdgesDelete}
          />

          <canvas className="canvas" ref={canvasRef}></canvas>
        </div>
      </div>
    </>
  );
}

export default TextEditor;
