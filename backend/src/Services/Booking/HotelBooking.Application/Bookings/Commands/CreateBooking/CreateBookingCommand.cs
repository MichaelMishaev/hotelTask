using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Bookings.Commands.CreateBooking;

public record CreateBookingCommand(
    Guid GuestId,
    Guid RoomId,
    DateTime CheckIn,
    DateTime CheckOut
) : IRequest<BookingDto>;
