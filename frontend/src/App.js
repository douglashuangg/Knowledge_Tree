import TextEditor from "./TextEditor";
import { Outlet, Link } from "react-router-dom";
import LandingPage from "./LandingPage";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./app.css";

function App() {
  const url = "http://localhost:5000/private";
  const [loggedIn, setLoggedIn] = useState();
  useEffect(() => {
    axios
      .get(url)
      .then((response) => {
        setLoggedIn(response.data.loggedIn);
        console.log(response.data.loggedIn);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return (
    <>
      {loggedIn ? <TextEditor /> : <LandingPage />}
      <nav>
        <ul>
          <li className="navbar">
            <Link to={`/login`}>Login</Link>
          </li>
        </ul>
      </nav>
      {/* <LandingPage /> */}
      {/* <Login /> */}
      {/* <TextEditor /> */}
    </>
  );
}

export default App;
