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
import rectangleNode from "./rectangleNode";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import RectangleIcon from "@mui/icons-material/Rectangle";
import debounce from "lodash/debounce";

const nodeTypes = {
  fourHandleNode: fourHandleNode,
  imageNode: imageNode,
  rectangleNode: rectangleNode,
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
  const [pageId, setPageId] = useState();
  const [addingNode, setAddingNode] = useState(false);
  const [addingRect, setAddingRect] = useState(false);
  const [files, setFiles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  let filesRef = useRef([]);
  let pageIdRef = useRef();

  // should not be able to link to itself.
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const modules = {
    clipboard: {
      matchVisual: false,
    },
  };

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
    // context = canvas.getContext("2d");
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
  }, []);

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
              data: { label: file.text, color: file.color },
              position: {
                x: parseInt(file.x),
                y: parseInt(file.y),
              },
              style: file.type === "rectangleNode" && {
                width: parseInt(file.width),
                height: parseInt(file.height),
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
          console.error(error);
        });
    }
  }, [pageIdRef.current]);

  const url = "http://localhost:5000/savePost";

  function sendData(data) {
    axios.post(url, data).then((response) => {});
  }

  const objRef = useRef([]);

  const handleKeyPress = (event) => {
    // if (event.key === "Enter") {
    //   let key = Math.random().toString();
    //   setInputList((prevState) => [
    //     ...prevState,
    //     {
    //       key: key,
    //       value: input,
    //       x: 50,
    //       y: 50,
    //       isOriginal: 0,
    //       height: 0,
    //       width: 0,
    //     },
    //   ]);
    //   const newNode = {
    //     position: { x: 50, y: 50 },
    //     data: { label: input, color: "#000000" },
    //     type: "fourHandleNode",
    //   };
    //   axios
    //     .post("http://localhost:5000/saveNode", {
    //       pageId: pageIdRef.current,
    //       newNode: newNode,
    //     })
    //     .then((response) => {
    //       // setNodes((prevState) => prevState.concat(response.data));
    //     });
    //   // do not remember what this is for
    //   objRef.current.push({ isOriginal: false, height: 0, width: 0 });
    //   setInput("");
    //   // hardcoded for now, will get the actual position later.
    //   setPositions((prevState) => ({
    //     ...prevState,
    //     [key]: { x: 50, y: 50 },
    //   }));
    //   coordinateRef.current[key] = { x: 50, y: 50 };
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
    // }
  };

  async function handlePaste(event) {
    if (event.ctrlKey && event.key === "v") {
      const items = await navigator.clipboard.read();

      const clipboardItem = items[0];
      if (
        clipboardItem.types.includes("image/png") ||
        clipboardItem.types.includes("image/jpeg")
      ) {
        const blob = await clipboardItem.getType("image/png");
        const url = URL.createObjectURL(blob);
        const newNode = {
          id: Math.random().toString(),
          data: {
            imageUrl: url,
            // imageData: blob,
          },
          position: mousePosition,
          type: "imageNode",
        };
        setNodes((prevState) => prevState.concat(newNode));
      }
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

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const saveContent = useCallback(
    debounce((content) => {
      const file = filesRef.current.find(
        (file) => file.file_id === pageIdRef.current
      );
      file.body = content;

      axios
        .post("http://localhost:5000/saveFile", {
          file: file,
        })
        .then((response) => {})
        .catch((error) => {
          console.error(error);
        });
    }, 1000),
    []
  );

  const handleChange = (content, delta, source, editor) => {
    const contents = editor.getContents();
    console.log("Content", contents);
    const firstLine = contents.ops[0].insert.split("\n")[0];
    // const fullText = editor.getHTML();
    const fullText = content.replace(/<br>/gi, "");

    console.log("test", content);
    const originalText = editor.getText();

    // const firstLine = originalText.split("\n")[0];
    if (originalText.trim() !== "") {
      setFiles((prev) =>
        prev.map((file) => {
          return file.file_id === pageIdRef.current
            ? { ...file, title: firstLine, body: content }
            : file;
        })
      );
    } else {
      setFiles((prev) =>
        prev.map((file) => {
          return file.file_id === pageIdRef.current
            ? { ...file, title: "Untitled", body: content }
            : file;
        })
      );
    }

    saveContent(content);

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
      // make sure there is a pageId before saving to database
      // so apparently only this pageId will work, probably something to do with rendering.
      if (old !== data && pageId) {
        sendData({
          doc: data,
          id: pageId,
          nodes: nodes,
          edges: edges,
        });
        old = data;
      }
    }, 500);

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
    },
    [setEdges]
  );

  const addNodeClicked = () => {
    // change the shape of the mouse
    // get position of the mouse
    // where the mouse is clicked, add a node
    setAddingNode(!addingNode);
    setAddingRect(false);
  };

  const addRectClicked = () => {
    setAddingRect(!addingRect);
    setAddingNode(false);
  };

  const getMousePosition = (event) => {
    const boundingCanvas = boardRef.current.getBoundingClientRect();

    const offsetXValue = offsetProperties[0];
    const offsetYValue = offsetProperties[1];
    const zoomLevel = offsetProperties[2];
    const position = {
      x:
        (
          (event.clientX - boundingCanvas.left - offsetXValue) /
          zoomLevel
        ).toFixed(2) - 60,
      y:
        (
          (event.clientY - boundingCanvas.top - offsetYValue) /
          zoomLevel
        ).toFixed(2) - 50,
    };
    setMousePosition(position);
    return position;
  };

  function postNodeToBackend(newNode) {
    axios
      .post("http://localhost:5000/saveNode", {
        pageId: pageIdRef.current,
        newNode: newNode,
      })
      .then((response) => {
        const createdNode = response.data;

        // might have bug here.
        const newNode = {
          id: createdNode.node_id.toString(),
          type: createdNode.type,
          data: {
            label: createdNode.text,
            color: createdNode.color,
            justCreated: true,
          },
          position: {
            x: parseInt(createdNode.x),
            y: parseInt(createdNode.y),
          },
          height: parseInt(createdNode.height),
          width: parseInt(createdNode.width),
          selected: true,
        };
        setNodes((prevState) => prevState.concat(newNode));
      });
  }

  const handleCanvasClick = (event) => {
    const position = getMousePosition(event);
    if (addingRect) {
      const newNode = {
        position: position,
        data: { label: "", color: "#FFF" },
        type: "rectangleNode",
      };

      postNodeToBackend(newNode);
      setAddingRect(false);
    }
    if (addingNode) {
      const newNode = {
        position: position,
        data: { label: "", color: "#FFF" },
        type: "fourHandleNode",
        height: 53,
      };

      postNodeToBackend(newNode);
      setAddingNode(false);
    }
  };

  // will need to understand this eventually, also only works on backspace, so will have to add the delete button
  const onNodesDelete = useCallback(
    (deleted) => {
      console.log("The deleted", deleted);
      const deletedId = deleted[0].id;
      axios.delete("http://localhost:5000/deleteNode", {
        data: {
          deleted: deleted,
        },
      });
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

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

  const onEdgesDelete = (edgesToDelete) => {
    console.log("edges yah", edgesToDelete);
    const uniqueEdges = [...new Set(edgesToDelete)];
    console.log("unique edges", uniqueEdges);
    axios
      .delete("http://localhost:5000/deleteEdge", {
        data: {
          edgesToDelete: uniqueEdges,
        },
      })
      .then((response) => {})
      .catch((error) => {
        console.error(error);
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
        filesRef={filesRef}
      />
      <h1 style={{ margin: 0, display: pageIdRef.current ? "none" : null }}>
        Please add a file to begin
      </h1>
      <div
        className="parent-div"
        style={{ display: pageIdRef.current ? null : "none" }}
      >
        <div className="text-editor">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            className="quill_editor"
            modules={modules}
          />
        </div>
        <div
          tabIndex={0}
          onKeyDown={handlePaste}
          ref={boardRef}
          className="canvas_editor"
        >
          <div className="node_menuBar">
            <button
              className="button_addNode"
              style={{
                backgroundColor: addingNode ? "#b5b2b2" : "#f3f1f1",
              }}
              onClick={addNodeClicked}
            >
              <CropSquareIcon />
            </button>
            <div className="hidden_addNode">Add Node</div>
            <button
              className="button_addNode"
              style={{ backgroundColor: addingRect ? "#b5b2b2" : "#f3f1f1" }}
              onClick={addRectClicked}
            >
              <RectangleIcon />
            </button>
            <div
              className="hidden_addNode"
              style={{
                marginTop: "2rem",
              }}
            >
              Add Rectangle
            </div>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            maxZoom={1000}
            minZoom={0.1}
            onPaneClick={handleCanvasClick}
            onNodeClick={handleCanvasClick}
            nodeTypes={memoizedNodes}
            ref={reactFlowRef}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
          />
        </div>
      </div>
    </>
  );
}

export default TextEditor;
