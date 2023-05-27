import { Handle, Position, NodeResizer } from "reactflow";
import "./imageNode.css";

function ImageNode({ data, selected }) {
  return (
    <div
      style={{
        background: "#fff",
        minWidth: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        position="relative"
        // lineStyle={{ border: "2px solid #ff0071" }}
        keepAspectRatio
        lineClassName=".rf-node__handle-line"
      />
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

      <div
        style={{
          padding: "10px",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          src={data.imageUrl}
        />
      </div>
    </div>
  );
}

export default ImageNode;
