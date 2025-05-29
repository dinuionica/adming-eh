import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const firebaseConfig = {
  apiKey: "AIzaSyAKSYLu4d9EhynA3m_4HpGjBvcoVYT7q6k",
  authDomain: "eh-project-36321.firebaseapp.com",
  projectId: "eh-project-36321",
  storageBucket: "eh-project-36321.firebasestorage.app",
  messagingSenderId: "178577982698",
  appId: "1:178577982698:web:39a0523b61c1092f45c393",
  measurementId: "G-L610VQVHZ6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EVENT_TYPES = [
  "heart",
  "medkit",
  "ambulance",
  "happy",
  "water",
  "vaccine",
  "vaccine-needle",
  "eye",
  "mental",
  "nutrition",
  "exercise",
  "vaccine-shield",
];

const AddEventForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    organizer: "",
    location: "",
    time: "",
    type: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newEvent = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "events"), newEvent);
      Swal.fire({
        icon: "success",
        title: "Event Saved",
        text: "The event was successfully added!",
        confirmButtonColor: "#199A8E",
      });
      setFormData({
        name: "",
        organizer: "",
        location: "",
        time: "",
        type: "",
        latitude: "",
        longitude: "",
      });
    } catch (error) {
      console.error("Save error:", error);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "There was a problem saving the event.",
        confirmButtonColor: "#199A8E",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 space-y-6">
        <h2 className="text-center text-3xl font-bold text-[#199A8E]">
          Add Event
        </h2>
            {/* Select pentru type */}
          <div>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 appearance-none bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#199A8E] text-gray-700"
            >
              <option value="" disabled hidden>
                Select Event Type
              </option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type} className="text-gray-900">
                  {type}
                </option>
              ))}
            </select>
          </div>
          
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "name", label: "Event Name" },
            { name: "organizer", label: "Organizer" },
            { name: "location", label: "Location" },
            { name: "time", label: "Date & Time" },
            { name: "latitude", label: "Latitude", type: "number" },
            { name: "longitude", label: "Longitude", type: "number" },
          ].map(({ name, label, type = "text" }) => (
            <div key={name}>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
                type={type}
                step={type === "number" ? "any" : undefined}
                placeholder={label}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
              />
            </div>
          ))}

      

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#199A8E] text-white font-semibold hover:bg-teal-700 transition"
          >
            Submit Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;
