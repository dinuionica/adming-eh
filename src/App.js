import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  getDoc,
  increment,
  onSnapshot,
} from "firebase/firestore";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const firebaseConfig = {
  apiKey: "AIzaSyAKSYLu4d9EhynA3m_4HpGjBvcoVYT7q6k",
  authDomain: "eh-project-36321.firebaseapp.com",
  projectId: "eh-project-36321",
  storageBucket: "eh-project-36321.firebasestorage.app",
  messagingSenderId: "178577982698",
  appId: "1:178577982698:web:39a0523b61c1092f45c393",
  measurementId: "G-L610VQVHZ6",
};

// Initialize Firebase and Firestore
initializeApp(firebaseConfig);
const db = getFirestore();

// Event types constant
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

// Admin: Form to add new events
function AddEventForm() {
  const [formData, setFormData] = useState({
    name: "",
    organizer: "",
    location: "",
    time: "",
    type: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "events"), {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        createdAt: new Date().toISOString(),
      });
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Event added!",
        background: "#fff",
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
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add event",
        background: "#fff",
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
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {[
            "name",
            "organizer",
            "location",
            "time",
            "latitude",
            "longitude",
          ].map((field) => (
            <input
              key={field}
              name={field}
              type={
                field === "latitude" || field === "longitude"
                  ? "number"
                  : "text"
              }
              step={
                field === "latitude" || field === "longitude"
                  ? "any"
                  : undefined
              }
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#199A8E] text-[#199A8E]"
            />
          ))}

          <button
            type="submit"
            className="w-full py-3 bg-[#199A8E] text-white rounded-xl hover:opacity-90"
          >
            Submit Event
          </button>
        </form>
      </div>
    </div>
  );
}

// Confirmation: List events per user and allow individual confirm/cancel
function ConfirmationPage() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);

  // Real-time update of user's rating
  useEffect(() => {
    let unsubscribe;
    if (user) {
      const userRef = doc(db, "users", user.id);
      unsubscribe = onSnapshot(userRef, (snap) => {
        const data = snap.data();
        setUser((prev) => ({ ...prev, rating: data.rating }));
      });
    }
    return () => unsubscribe && unsubscribe();
  }, [user]);

  // Fetch user by email and their registered events
  const fetchUser = async (e) => {
    e.preventDefault();
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.empty) {
      return Swal.fire({
        icon: "error",
        title: "Not found",
        text: "No user with that email",
        background: "#fff",
        confirmButtonColor: "#199A8E",
      });
    }
    const docSnap = snap.docs[0];
    const userData = { id: docSnap.id, ...docSnap.data() };
    setUser(userData);

    const regs = userData.registeredEvents || [];
    const evtList = await Promise.all(
      regs.map(async (id) => {
        const eDoc = await getDoc(doc(db, "events", id));
        return eDoc.exists() ? { id: eDoc.id, ...eDoc.data() } : null;
      })
    );
    setEvents(evtList.filter(Boolean));
  };

  // Handle confirm/cancel per event
  const handleAction = (evId, confirm) => async () => {
    if (!user) return;
    const doUpdate = async () => {
      try {
        await updateDoc(doc(db, "users", user.id), {
          rating: increment(confirm ? 1 : -1),
        });
        setEvents((evts) => evts.filter((ev) => ev.id !== evId));
        Swal.fire({
          icon: "success",
          title: confirm ? "Confirmed" : "Cancelled",
          text: `Rating ${confirm ? "increased" : "decreased"}`,
          background: "#fff",
          confirmButtonColor: "#199A8E",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Could not update rating",
          background: "#fff",
          confirmButtonColor: "#199A8E",
        });
      }
    };

    if (!confirm) {
      const res = await Swal.fire({
        title: "Are you sure?",
        text: "This will decrease rating.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel",
        cancelButtonText: "No",
        background: "#fff",
        confirmButtonColor: "#199A8E",
        cancelButtonColor: "#6b7280",
      });
      if (res.isConfirmed) await doUpdate();
    } else {
      await doUpdate();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 space-y-6">
        <h2 className="text-center text-2xl font-bold text-[#199A8E]">
          Confirm Participation
        </h2>
        {user && (
          <p className="text-center text-lg text-[#199A8E]">
            Current Rating: {user.rating}
          </p>
        )}
        <form onSubmit={fetchUser} className="flex gap-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#199A8E] text-[#199A8E]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#199A8E] text-white rounded-xl hover:opacity-90"
          >
            Search
          </button>
        </form>

        {events.map((ev) => (
          <div
            key={ev.id}
            className="border p-4 rounded-xl space-y-4 text-center"
          >
            <p className="font-semibold text-[#199A8E]">{ev.name}</p>
            <p className="text-gray-600">{ev.time}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleAction(ev.id, true)}
                className="px-6 py-2 bg-[#199A8E] text-white rounded-xl hover:opacity-90"
              >
                Confirm
              </button>
              <button
                onClick={handleAction(ev.id, false)}
                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:opacity-90"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AddEventForm />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

// Render the App
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);

export default App;
