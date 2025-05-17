import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Menu from "./components/Menu";

const AppRouter = () => {
    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/menu" element={isLoggedIn ? <Menu /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
