import React, { useState } from "react";
import { ChatHeader } from "@/components/boats/messaging";
import { Captain } from "@/types/captain.types";
import { BookingStatus } from "@/types/booking.types";

// Example usage of ChatHeader component
export const ChatHeaderExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const exampleCaptain: Captain = {
    id: 1,
    name: "Ahmet Yılmaz",
    experience: 10,
    bio: "Experienced boat captain with 10 years of sailing experience",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    available: true,
    certifications: ["Boat License", "First Aid"],
    languages: ["Turkish", "English"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const handleClose = () => {
    setIsOpen(false);
    console.log("Chat header closed");
  };

  if (!isOpen) {
    return (
      <div className="p-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show Chat Header
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white border rounded-lg overflow-hidden shadow-lg">
      <ChatHeader
        captain={exampleCaptain}
        bookingId={12345}
        bookingStatus={BookingStatus.CONFIRMED}
        onClose={handleClose}
      />

      {/* Mock chat content */}
      <div className="p-4 h-64 bg-gray-50 flex items-center justify-center text-gray-500">
        Chat messages would appear here...
      </div>
    </div>
  );
};

// Example with different booking statuses
export const ChatHeaderStatusExamples: React.FC = () => {
  const exampleCaptain: Captain = {
    id: 1,
    name: "Mehmet Demir",
    experience: 15,
    bio: "Professional captain",
    photo: "",
    rating: 4.9,
    available: true,
    certifications: ["Advanced License"],
    languages: ["Turkish"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const statuses = [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.CANCELLED,
    BookingStatus.REJECTED,
    BookingStatus.COMPLETED,
  ];

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold mb-4">
        Chat Header with Different Booking Statuses
      </h2>

      {statuses.map((status, index) => (
        <div
          key={status}
          className="max-w-md bg-white border rounded-lg overflow-hidden shadow"
        >
          <ChatHeader
            captain={exampleCaptain}
            bookingId={1000 + index}
            bookingStatus={status}
            onClose={() =>
              console.log(`Closed chat for booking ${1000 + index}`)
            }
          />
          <div className="p-2 text-sm text-gray-600 bg-gray-50">
            Status: {status}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHeaderExample;
