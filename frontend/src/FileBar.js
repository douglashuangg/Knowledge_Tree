import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import axios from "axios";
import "./fileBar.css";

function FileBar({ quill, setPageId }) {
  const [files, setFiles] = useState([]);
  const [popUpMenu, setPopUpMenu] = useState(false);
  const [thisFile, setThisFile] = useState();

  const buttonContainerRef = useRef([]);

  const indexRef = useRef(0);

  const url = "http://localhost:5000/private/fetchFiles";
  useEffect(() => {
    axios
      .get(url, {
        withCredentials: true,
      })
      .then((response) => {
        setFiles(response.data);
        console.log("success");
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const addNewFile = () => {
    const newFile = {
      title: "New Page",
      body: "",
      file_id: files.length + 1,
    };
    setFiles((prevState) => [...prevState, newFile]);
    renderBody(newFile);
  };

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

  const handleDelete = (id) => {
    console.log("deleted");
    const updatedItems = files.filter((file) => file.file_id !== id);
    setFiles(updatedItems);
    setPopUpMenu(false);
  };

  function PopUpMenu(id) {
    console.log("popup");
    return (
      <ul
        className="popupMenu"
        onClick={(event) => {
          event.stopPropagation();
        }}
        onMouseOver={(event) => {
          event.stopPropagation();
        }}
      >
        <button onMouseDown={() => handleDelete(id)}>Delete</button>
      </ul>
    );
  }

  // const handleBlur = (event, index) => {
  //   setPopUpMenu(false);
  // };

  // on mouse up, if the target is not the whole div, then close the menu, but how do you get the whole div?

  // holy moly
  useEffect(() => {
    const listener = (event) => {
      console.log("too fast", indexRef.current);
      if (
        !buttonContainerRef.current[indexRef.current] ||
        buttonContainerRef.current[indexRef.current].contains(event.target)
      ) {
        return;
      } else {
        setPopUpMenu(false);
      }
    };

    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [indexRef.current]);

  // huh, i previously had this as onmousedown, but now it's working as onclick, which makes the stoppropagation work too.
  const handleMenu = (event, id, index) => {
    event.stopPropagation();
    indexRef.current = index;
    setThisFile(id);
    setPopUpMenu(!popUpMenu);
  };

  return (
    <div className="sidenav">
      <button className="collapse_button">Collapse</button>
      <h2>Files</h2>

      {files.map((file, index) => {
        return (
          <div className="file_group" onClick={() => renderBody(file)}>
            <div className="file_element">
              <p>{file.title}</p>
            </div>
            <div
              className="button_container"
              ref={(ref) => (buttonContainerRef.current[index] = ref)}
            >
              <button
                className="button_file_menu"
                onClick={(event) => handleMenu(event, file.file_id, index)}
              >
                ...
              </button>
              {popUpMenu && file.file_id == thisFile && PopUpMenu(file.file_id)}
            </div>
          </div>
        );
      })}
      <div className="file_element--new">
        <button onClick={addNewFile} className="button_add_map">
          + New Map
        </button>
      </div>
    </div>
  );
}

export default FileBar;
