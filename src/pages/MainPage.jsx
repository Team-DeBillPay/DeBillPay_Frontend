import React from "react";

export default function MainPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <h2 className="text-3xl font-bold text-indigo-600">Сторінка головна</h2>
      <img
        src="./src/assets/icons/tifteli.png"
        alt=""
        className="w-80 h-80 mx-auto"
      />
    </div>
  );
}
