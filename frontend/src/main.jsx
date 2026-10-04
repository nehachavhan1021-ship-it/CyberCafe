import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import App from "./App";
import UploadPage from "./pages/UploadPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pricing from "./pages/Pricing";
import QRCodePage from "./pages/QRCodePage";
import("./index.css")

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                

                <Route
                    path="/upload/:qrCodeId"
                    element={<UploadPage />}
                />
               <Route path="/pricing" element={<Pricing />} />
                <Route path="/login" element={<Login />} />
 <Route path="/register" element={<Register />} />
                <Route
    path="/dashboard"
    element={<Dashboard />}
/>
 <Route path="/qr-code" element={<QRCodePage />} />
            </Routes>
           
            
        </BrowserRouter>
    </React.StrictMode>
);