import { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [presetServiceId, setPresetServiceId] = useState("");
  const [presetBarberId, setPresetBarberId] = useState("");
  const [presetDate, setPresetDate] = useState("");
  const [presetTime, setPresetTime] = useState("");

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
