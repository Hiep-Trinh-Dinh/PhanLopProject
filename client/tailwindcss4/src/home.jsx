import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import MessageModal from "./components/MessageModal";
import NotificationModal from "./components/NotificationModal";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
import UserProfile from "./pages/UserProfile";
import Videos from "./pages/Videos";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/videos" element={<Videos />} />
          </Routes>
        </div>
      </div>
      <MessageModal />
      <NotificationModal />
    </Router>
  );
}

export default App;

// Home Page Component
function Home() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <PostForm />
      <PostList />
    </div>
  );
}

export { Home };
