import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import axios from "axios";
import "./fileBar.css";
import MenuIcon from "@mui/icons-material/Menu";

function FileBar({ quill, setPageId, files, setFiles, pageIdRef }) {
  const [popUpMenu, setPopUpMenu] = useState(false);
  const [thisFile, setThisFile] = useState();
  const [isSideBarVisible, setIsSideBarVisible] = useState(true);

  const buttonContainerRef = useRef([]);

  const indexRef = useRef(0);

  const fetchFilesUrl = "http://localhost:5000/private/fetchFiles";
  useEffect(() => {
    axios
      .get(fetchFilesUrl, {
        withCredentials: true,
      })
      .then((response) => {
        setFiles(response.data);
        // currently setting the first file to be the default page
        setPageId(response.data[0].file_id);
        renderBody(response.data[0]);
        console.log("success");
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const addNewFile = () => {
    console.log("adding new file");

    const newFile = {
      title: "New Page",
      body: "",
    };
    axios
      .post("http://localhost:5000/private/addFile", newFile, {
        withCredentials: true,
      })
      .then((response) => {
        setFiles((prevState) => [...prevState, response.data]);
        renderBody(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDelete = (id) => {
    console.log("deleted");
    const updatedItems = files.filter((file) => file.file_id !== id);
    axios
      .post(
        "http://localhost:5000/private/deleteFile",
        { id },
        { withCredentials: true }
      )
      .then((response) => {
        setFiles(updatedItems);
        setPopUpMenu(false);
      });
  };

  async function renderBody(file) {
    pageIdRef.current = file.file_id;
    setPageId(file.file_id);

    const editor = quill.current.getEditor();
    // await editor.setContents([{ insert: "\n" }]);
    editor.setText(file.body);
    editor.setSelection(editor.getLength(), 0);

    // editor.setText("");
    // editor.insertText(0, body);
    //   const delta = editor.clipboard.convert(body);
    //   editor.setContents(delta);
  }

  function PopUpMenu(id) {
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
        <button className="button_delete" onMouseDown={() => handleDelete(id)}>
          Delete
        </button>
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
    console.log("id", id);
    setThisFile(id);
    setPopUpMenu(!popUpMenu);
  };
  const collapseSideBar = () => {
    setIsSideBarVisible(!isSideBarVisible);
  };

  return (
    <>
      {isSideBarVisible ? (
        <div className="sidenav">
          <button onClick={collapseSideBar} className="collapse_button">
            <MenuIcon style={{ fontSize: "2rem" }} />
          </button>
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
                  {popUpMenu &&
                    file.file_id == thisFile &&
                    PopUpMenu(file.file_id)}
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
      ) : (
        <>
          <button className="uncollapse_button" onClick={collapseSideBar}>
            <MenuIcon style={{ fontSize: "2rem" }} />
          </button>
        </>
      )}
    </>
  );
}

export default FileBar;
