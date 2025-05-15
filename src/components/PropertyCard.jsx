import React, { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { db } from "../firebase";
import { useAuth } from "./hooks/useAuth";
import { collection, addDoc } from "firebase/firestore";
import DatePicker from "react-datepicker";
import { motion } from "motion/react";
import "react-datepicker/dist/react-datepicker.css";

const PropertyCard = ({
  id,
  title = "Untitled Property", // Add default values
  description = "",
  price = 0,
  amenities = [],
  rating,
  reviews = [],
  ownerContact = "",
  isSaved = false,
  onToggleSave,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const user = useAuth();

  const handleSaveListing = async () => {
    if (!user) {
      alert("Please log in to save listings");
      return;
    }
    if (!id) {
      alert("Property ID is missing");
      return;
    }

    if (typeof onToggleSave === "function") {
      onToggleSave();
    }
  };

  const handleRequestVisit = async () => {
    if (!user || !selectedDate) {
      alert("Select a date & log in first");
      return;
    }
    if (!id) {
      alert("Property ID is missing");
      return;
    }

    try {
      await addDoc(collection(db, "visitRequests"), {
        userId: user.uid,
        propertyId: id,
        requestedAt: selectedDate,
        status: "Pending",
      });
      alert("Visit requested!");
      setSelectedDate(null);
      setShowDatePicker(false);
    } catch (err) {
      console.error("Error requesting visit:", err);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0px 15px 30px rgba(0,0,0,0.4)" }}
      transition={{ ease: "linear" }}
      className="bg-mainbg p-6 border border-mainbg shadow-2xl hover:shadow-xl shadow-zinc-800/80 rounded-2xl space-y-5 max-w-md mx-auto relative transition-all duration-200 text-white font-inter"
    >
      <button
        onClick={handleSaveListing}
        className="absolute top-4 right-4 text-[--color-accent] text-2xl transition-transform duration-200 hover:scale-110"
        title={isSaved ? "Remove from Favorites" : "Save Listing"}
      >
        {isSaved ? <FaHeart /> : <FaRegHeart />}
      </button>

      <h3 className="font-semibold text-2xl text-[--color-accent] font-rubik">
        {title}
      </h3>

      <p className="text-slate-300 text-sm">{description}</p>

      {price > 0 && (
        <p className="text-lg font-semibold text-green-400">
          Price: PKR {price.toLocaleString()}
        </p>
      )}

      {amenities.length > 0 && (
        <div>
          <p className="font-medium text-white mb-1">Amenities:</p>
          <ul className="list-disc list-inside text-slate-400 text-sm">
            {amenities.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {rating && (
        <p className="text-sm font-medium text-yellow-400">
          Rating: {rating} ⭐
        </p>
      )}

      {reviews.length > 0 && (
        <div>
          <p className="font-medium text-white mb-1">Reviews:</p>
          <ul className="list-disc list-inside text-slate-400 text-sm">
            {reviews.map((review, idx) => (
              <li key={idx}>{review}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-3">
        {ownerContact && (
          <a
            href={`mailto:${ownerContact}`}
            className="inline-block cursor-pointer rounded-xl border-[1.5px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 text-center shadow-md transition-all duration-300 hover:translate-y-[-3px] hover:shadow-xl"
          >
            Contact Owner
          </a>
        )}

        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="inline-block cursor-pointer rounded-xl border-[1.5px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 text-center shadow-md transition-all duration-300 hover:translate-y-[-3px] hover:shadow-xl"
        >
          Request Visit
        </button>

        {showDatePicker && (
          <div className="flex flex-col items-start gap-2 mt-2 w-full">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full rounded-xl border-[1.5px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#596A95]"
              placeholderText="Select a date"
              dateFormat="MMMM d, yyyy"
              minDate={new Date()}
            />
            <button
              onClick={handleRequestVisit}
              className="inline-block cursor-pointer rounded-xl border-[1.5px] border-zinc-600 bg-zinc-950 px-5 py-2 font-medium text-slate-200 text-center shadow-md transition-all duration-300 hover:translate-y-[-3px] hover:shadow-xl"
            >
              Confirm Visit
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PropertyCard;
