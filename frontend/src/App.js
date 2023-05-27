import TextEditor from "./TextEditor";
import { Link } from "react-router-dom";
import LandingPage from "./LandingPage";
import React, { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import axios from "axios";
import "./app.css";

function App() {
  const mainUrl = process.env.REACT_APP_ENDPOINT;
  const url = `${mainUrl}/private`;
  const [loggedIn, setLoggedIn] = useState();
  const [loading, setLoading] = useState(true);

  function handleLogout() {
    const logoutUrl = `${mainUrl}/auth/logout`;
    axios.get(logoutUrl, { withCredentials: true }).then((response) => {
      setLoggedIn(false);
    });
  }
  useEffect(() => {
    axios
      .get(mainUrl)
      .then((response) => {
        // console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
    axios
      .get(url, {
        withCredentials: true,
      })
      .then((response) => {
        setLoggedIn(response.data.loggedIn);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <nav>
        <ul className="navbar">
          <li>
            <Link className="nav_item" to={`/explore`}>
              Explore
            </Link>
          </li>
          <li className="nav_item">Your Brain</li>
          <li>
            {loggedIn ? (
              <Link onClick={handleLogout} to={`#`}>
                Log out
              </Link>
            ) : (
              <Link to={`/login`}>Log in</Link>
            )}
          </li>
        </ul>
      </nav>
      {loggedIn ? (
        <ReactFlowProvider>
          <TextEditor />
        </ReactFlowProvider>
      ) : (
        <LandingPage />
      )}

      {/* <LandingPage /> */}
      {/* <Login /> */}
      {/* <TextEditor /> */}
    </>
  );
}

export default App;
