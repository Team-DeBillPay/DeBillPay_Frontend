import React from "react";

export default function Loader({ text = "Завантаження сторінки..." }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#042860]"></div>
      <p className="mt-4 text-[#4B6C9A] text-[18px]">{text}</p>
    </div>
  );
}
