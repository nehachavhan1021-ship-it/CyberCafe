import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import App from "./App";
import UploadPage from "./pages/UploadPage";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />

                <Route
                    path="/upload/:qrCodeId"
                    element={<UploadPage />}
                />
                <Route
    path="/dashboard"
    element={<Dashboard />}
/>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);