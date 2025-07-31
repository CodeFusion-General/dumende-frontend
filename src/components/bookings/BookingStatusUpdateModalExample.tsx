import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import BookingStatusUpdateModal from "./BookingStatusUpdateModal";
import { BookingDTO, BookingStatus } from "@/types/booking.types";

// Example usage component for testing the modal
const BookingStatusUpdateModalExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock booking data for testing
  const mockBooking: BookingDTO = {
    id: 123,
    customerId: 456,
    boatId: 789,
    tourId: 101,
    startDate: "2024-02-15T14:30:00",
    endDate: "2024-02-15T18:30:00",
    status: "PENDING",
    totalPrice: 750,
    passengerCount: 6,
    notes: "Family trip to the islands",
    createdAt: "2024-01-15T10:00:00",
    updatedAt: "2024-01-15T10:00:00",
  };

  const handleStatusUpdate = async (
    bookingId: number,
    status: BookingStatus,
    reason?: string
  ) => {
    console.log("Updating booking status:", { bookingId, status, reason });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real implementation, this would call the booking service
    // await bookingService.updateBookingStatus(bookingId, status, reason);

    console.log("Status updated successfully");
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">
        Booking Status Update Modal Example
      </h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Mock Booking Details:</h3>
        <p>
          <strong>ID:</strong> #{mockBooking.id}
        </p>
        <p>
          <strong>Status:</strong> {mockBooking.status}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(mockBooking.startDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Passengers:</strong> {mockBooking.passengerCount}
        </p>
        <p>
          <strong>Price:</strong> ${mockBooking.totalPrice}
        </p>
      </div>

      <Button onClick={() => setIsModalOpen(true)}>
        Update Booking Status
      </Button>

      <BookingStatusUpdateModal
        booking={mockBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default BookingStatusUpdateModalExample;
