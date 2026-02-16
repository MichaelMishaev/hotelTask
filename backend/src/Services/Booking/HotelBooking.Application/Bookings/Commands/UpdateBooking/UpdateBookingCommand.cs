using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Bookings.Commands.UpdateBooking;

public record UpdateBookingCommand(
    Guid BookingId,
    DateTime CheckIn,
    DateTime CheckOut,
    string UpdatedBy) : IRequest<BookingDto>;
