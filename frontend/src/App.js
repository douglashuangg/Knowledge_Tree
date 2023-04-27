import TextEditor from "./TextEditor";
import { Outlet, Link } from "react-router-dom";
import LandingPage from "./LandingPage";
import React, { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import axios from "axios";
import "./app.css";

function App() {
  const url = "http://localhost:5000/private";
  const [loggedIn, setLoggedIn] = useState();
  function handleLogout() {
    const logoutUrl = "http://localhost:5000/auth/logout";
    axios.get(logoutUrl, { withCredentials: true }).then((response) => {
      setLoggedIn(false);
      console.log("logged out");
    });
  }
  useEffect(() => {
    axios
      .get(url, {
        withCredentials: true,
      })
      .then((response) => {
        setLoggedIn(response.data.loggedIn);
        console.log("logged in", response.data.loggedIn);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return (
    <>
      {loggedIn ? (
        <ReactFlowProvider>
          <TextEditor />
        </ReactFlowProvider>
      ) : (
        <LandingPage />
      )}
      <nav>
        <ul className="navbar">
          <li>
            {loggedIn ? (
              <Link onClick={handleLogout} to={`#`}>
                Log out
              </Link>
            ) : (
              <Link to={`/login`}>Log in</Link>
            )}
          </li>
          <li>
            <Link to={`/explore`}>Explore</Link>
          </li>
          <li>Your Brain</li>
        </ul>
      </nav>
      {/* <LandingPage /> */}
      {/* <Login /> */}
      {/* <TextEditor /> */}
    </>
  );
}

export default App;
