const { Client } = require("pg");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { privateRoutes } = require("./routes/private.js");
const authRoutes = require("./routes/auth.js");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

dotenv.config();

const hostname = "127.0.0.1";
const port = 5000;

const app = express();

// cors middleware
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

// cookie parser middleware
app.use(cookieParser());

// body parser middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// authentication and routes that are private
app.use("/auth", authRoutes);
app.use("/private", privateRoutes);

app.post("/saveNode", async (req, res) => {
  try {
    const node = req.body.newNode;
    console.log(node);
    const createdNode = await prisma.nodes.create({
      data: {
        x: node.position.x,
        y: node.position.y,
        type: node.type,
        text: node.data.label,
        file_id: req.body.pageId,
      },
    });
    console.log("created", createdNode);
    res.status(200).json(createdNode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating node" });
  }
});

app.delete("/deleteNode", async (req, res) => {
  console.log(req.body);
  try {
    const deletedNode = await prisma.nodes.delete({
      where: {
        node_id: parseInt(req.body.deletedId),
      },
    });
    res.status(200).json({ message: "Node deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting node" });
  }
});

app.delete("/deleteEdge", async (req, res) => {
  console.log("THESE EDGES", req.body);
  try {
    await prisma.edges.delete({
      where: {
        id: req.body.edgeToDelete.id,
      },
    });
    res.status(200).json({ message: "edge deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting edge" });
  }
});

app.post("/savePost", (req, res) => {
  // console.log("your post data", req.body);
  // post to postgres
  savePost(req)
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
  res.send({ status: "success" });
});

app.get("/fetchFileData", async (req, res) => {
  // this req.query looks like it can cause errors very easily
  console.log("ID", req.query.pageId);
  const nodeData = await prisma.nodes.findMany({
    where: {
      file_id: parseInt(req.query.pageId),
    },
  });
  // console.log("nodes", nodeData);

  const edgeData = await prisma.edges.findMany({
    where: {
      file_id: parseInt(req.query.pageId),
    },
  });
  // console.log(edgeData);
  res.send({ nodeData, edgeData });
});

async function savePost(req) {
  const existingFile = await prisma.files.findUnique({
    where: {
      file_id: req.body.id,
    },
  });
  const nodeArray = req.body.nodes;
  const edgeArray = req.body.edges;

  console.log(edgeArray);

  for (let i = 0; i < nodeArray.length; i++) {
    // check if node exists in current file
    const existingNode = await prisma.nodes.findUnique({
      where: {
        node_id: parseInt(nodeArray[i].id),
      },
    });
    if (!existingNode) {
      await prisma.nodes.create({
        data: {
          node_id: parseInt(nodeArray[i].id),
          x: nodeArray[i].position.x,
          y: nodeArray[i].position.y,
          text: nodeArray[i].data.label,
          width: nodeArray[i].width,
          height: nodeArray[i].height,
          type: nodeArray[i].type,
          file_id: req.body.id,
          color: "black",
        },
      });
    } else {
      await prisma.nodes.update({
        where: { node_id: parseInt(nodeArray[i].id) },
        data: {
          x: nodeArray[i].position.x,
          y: nodeArray[i].position.y,
          text: nodeArray[i].data.label,
          width: nodeArray[i].width,
          height: nodeArray[i].height,
          type: nodeArray[i].type,
          file_id: req.body.id,
          color: "black",
        },
      });
    }
  }

  for (let i = 0; i < edgeArray.length; i++) {
    console.log(edgeArray[i]);
    const existingEdge = await prisma.edges.findUnique({
      where: {
        id: edgeArray[i].id,
      },
    });

    if (!existingEdge) {
      await prisma.edges.create({
        data: {
          id: edgeArray[i].id,
          source: edgeArray[i].source,
          target: edgeArray[i].target,
          source_handle: edgeArray[i].sourceHandle,
          target_handle: edgeArray[i].targetHandle,
          file_id: req.body.id,
        },
      });
    } else {
      await prisma.edges.update({
        where: { id: edgeArray[i].id },
        data: {
          id: edgeArray[i].id,
          source: edgeArray[i].source,
          target: edgeArray[i].target,
          source_handle: edgeArray[i].sourceHandle,
          target_handle: edgeArray[i].targetHandle,
          file_id: req.body.id,
        },
      });
    }
  }

  // if existing file, update file
}

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
