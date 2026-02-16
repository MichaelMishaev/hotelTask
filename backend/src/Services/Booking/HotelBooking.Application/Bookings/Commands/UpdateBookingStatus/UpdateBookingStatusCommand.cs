using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Bookings.Commands.UpdateBookingStatus;

public record UpdateBookingStatusCommand(
    Guid BookingId,
    string NewStatus,
    string ChangedBy) : IRequest<BookingDto>;
