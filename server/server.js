const { Client } = require("pg");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { privateRoutes } = require("./routes/private.js");
const authRoutes = require("./routes/auth.js");
const { PrismaClient } = require("@prisma/client");
// const AWS = require("aws-sdk");
const crypto = require("crypto");
const { encryptData, decryptData } = require("./utils/encryption.js");
dotenv.config();

const hostname = "127.0.0.1";
const port = process.env.port || 5000;

const app = express();

// const s3 = new AWS.S3({
//   region: "us-east-2",
// });

// const sts = new AWS.STS();

// const assumeRoleParams = {
//   RoleArn: process.env.ROLE_ARN,
//   RoleSessionName: process.env.ROLE_NAME,
// };

// sts.assumeRole(assumeRoleParams, function (err, data) {
//   if (err) {
//     console.log("Error assuming IAM role:", err);
//   } else {
//     const s3Params = {
//       Bucket: "<YOUR_BUCKET>",
//       Key: "<OBJECT_KEY>",
//       Body: "<YOUR_IMAGE>",
//       Credentials: data.Credentials,
//     };

//     s3.upload(s3Params, function (err, data) {
//       if (err) {
//         console.log("Error uploading image:", err);
//       } else {
//         console.log("Image uploaded to S3:", data.Location);
//       }
//     });
//   }
// });

const prisma = new PrismaClient();

// cors middleware
app.use(
  cors({
    credentials: true,
    origin: "https://www.getmesh.ca",
    methods: ["GET", "POST", "PUT", "DELETE"], // Add DELETE method here
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/saveFile", async (req, res) => {
  try {
    const existingFile = await prisma.files.findUnique({
      where: {
        file_id: req.body.file.file_id,
      },
    });
    if (existingFile) {
      const updatedFile = await prisma.files.update({
        where: {
          file_id: req.body.file.file_id,
        },
        data: {
          title: encryptData(req.body.file.title),
          body: encryptData(req.body.file.body),
          lastAccessed: new Date(),
        },
      });
      res.status(200).json(updatedFile);
    }
  } catch (error) {
    res.status(500).json({ message: "Error saving file" });
  }
});

app.post("/saveNode", async (req, res) => {
  try {
    const node = req.body.newNode;
    const createdNode = await prisma.nodes.create({
      data: {
        x: node.position.x,
        y: node.position.y,
        type: node.type,
        text: encryptData(node.data.label),
        file_id: req.body.pageId,
        color: node.data.color,
      },
    });
    createdNode.text = "";
    res.status(200).json(createdNode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating node", error: error });
  }
});

app.delete("/deleteNode", async (req, res) => {
  try {
    for (let i = 0; i < req.body.deleted.length; i++) {
      await prisma.nodes.delete({
        where: {
          node_id: parseInt(req.body.deleted[i].id),
        },
      });
    }
    // const deletedNode = await prisma.nodes.delete({
    //   where: {
    //     node_id: parseInt(req.body.deletedId),
    //   },
    // });
    res.status(200).json({ message: "Node deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting node" });
  }
});

app.delete("/deleteEdge", async (req, res) => {
  try {
    for (let i = 0; i < req.body.edgesToDelete.length; i++) {
      await prisma.edges.delete({
        where: {
          id: req.body.edgesToDelete[i].id,
        },
      });
    }
    // await prisma.edges.delete({
    //   where: {
    //     id: req.body.edgeToDelete.id,
    //   },
    // });
    res.status(200).json({ message: "edge deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting edge" });
  }
});

app.post("/savePost", (req, res) => {
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
  const nodeData = await prisma.nodes.findMany({
    where: {
      file_id: parseInt(req.query.pageId),
    },
  });
  try {
    for (let data of nodeData) {
      data.text = decryptData(data.text);
    }
    const edgeData = await prisma.edges.findMany({
      where: {
        file_id: parseInt(req.query.pageId),
      },
    });
    res.send({ nodeData, edgeData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error decrypting data");
  }
});

async function savePost(req) {
  try {
    const nodeArray = req.body.nodes;
    const edgeArray = req.body.edges;

    for (let i = 0; i < nodeArray.length; i++) {
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
            text: encryptData(nodeArray[i].data.label),
            width: nodeArray[i].width,
            height: nodeArray[i].height,
            type: nodeArray[i].type,
            file_id: req.body.id,
            color: nodeArray[i].data.color,
          },
        });
      } else {
        await prisma.nodes.update({
          where: { node_id: parseInt(nodeArray[i].id) },
          data: {
            x: nodeArray[i].position.x,
            y: nodeArray[i].position.y,
            text: encryptData(nodeArray[i].data.label),
            width: nodeArray[i].width,
            height: nodeArray[i].height,
            type: nodeArray[i].type,
            // file_id: req.body.id,
            color: nodeArray[i].data.color,
          },
        });
      }
    }
    for (let i = 0; i < edgeArray.length; i++) {
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
            source: edgeArray[i].source,
            target: edgeArray[i].target,
            source_handle: edgeArray[i].sourceHandle,
            target_handle: edgeArray[i].targetHandle,
          },
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving node" });
  }
}

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
