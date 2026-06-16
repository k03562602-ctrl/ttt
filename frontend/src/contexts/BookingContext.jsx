import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [presetServiceId, setPresetServiceId] = useState("");
  const [presetBarberId, setPresetBarberId] = useState("");
  const [presetDate, setPresetDate] = useState("");
  const [presetTime, setPresetTime] = useState("");

  // Pre-fetch at app start so BookingModal has data the instant it opens
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    axios.get(`${API}/services`).then((r) => setServices(r.data)).catch(() => {});
    axios.get(`${API}/barbers`).then((r) => setBarbers(r.data)).catch(() => {});
  }, []);

  // Accepts either a string serviceId (legacy) or an object { serviceId, barberId, date, time }
  const openBooking = (arg) => {
    if (typeof arg === "string") {
      setPresetServiceId(arg);
      setPresetBarberId("");
      setPresetDate("");
      setPresetTime("");
    } else if (arg && typeof arg === "object" && !arg.nativeEvent) {
      setPresetServiceId(arg.serviceId || "");
      setPresetBarberId(arg.barberId || "");
      setPresetDate(arg.date || "");
      setPresetTime(arg.time || "");
    } else {
      // event passed in by onClick — clear presets
      setPresetServiceId("");
      setPresetBarberId("");
      setPresetDate("");
      setPresetTime("");
    }
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setPresetServiceId("");
    setPresetBarberId("");
    setPresetDate("");
    setPresetTime("");
  };

  return (
    <BookingContext.Provider
      value={{
        isBookingOpen,
        openBooking,
        closeBooking,
        presetServiceId,
        presetBarberId,
        presetDate,
        presetTime,
        services,
        barbers,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
}
