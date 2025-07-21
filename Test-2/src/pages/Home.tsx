import React from "react";
import { useDispatch } from "react-redux";
import { logoutAndRedirect } from "../redux/auth/authActions";

const Home = () => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch<any>(logoutAndRedirect());
  };
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <h1>Welcome Home!</h1>
      <p>You are logged in.</p>
      <button className="btn btn-danger mt-3" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

export default Home; 