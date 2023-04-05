import React, { useEffect, useState } from "react";
import axios from "axios";
import "./fileBar.css";

function FileBar({ quill, setPageId }) {
  const [files, setFiles] = useState([]);
  const url = "http://localhost:5000/fetchFiles";
  useEffect(() => {
    axios
      .get(url)
      .then((response) => {
        setFiles(response.data);
        console.log("success");
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  async function renderBody(file) {
    const editor = quill.current.getEditor();
    // await editor.setContents([{ insert: "\n" }]);
    editor.setText(file.body);
    editor.setSelection(editor.getLength(), 0);
    setPageId(file.file_id);

    // editor.setText("");
    // editor.insertText(0, body);
    //   const delta = editor.clipboard.convert(body);
    //   editor.setContents(delta);
  }

  return (
    <div className="sidenav">
      <button className="collapse_button">Collapse</button>
      <h2>Files</h2>
      {files.map((file) => {
        return (
          <div className="file_element" onClick={() => renderBody(file)}>
            <p>{file.title}</p>
          </div>
        );
      })}
      <div className="file_element--new">
        <p>+ New Map</p>
      </div>
    </div>
  );
}

export default FileBar;
