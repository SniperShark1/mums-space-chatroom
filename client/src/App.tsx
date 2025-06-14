import React from "react";
import RoomSelector from "./components/RoomSelector";

function App() {
  return (
    <div className="min-h-screen bg-pink-100 text-center p-8">
      <h1 className="text-4xl font-bold text-pink-600 mb-6">
        Mum's Space Chatroom
      </h1>

      <RoomSelector />

      <p className="mt-10 text-gray-600">Chat content will go here.</p>
    </div>
  );
}

export default App;