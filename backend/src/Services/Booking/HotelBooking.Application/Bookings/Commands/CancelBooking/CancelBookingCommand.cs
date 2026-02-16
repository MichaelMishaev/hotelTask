using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Bookings.Commands.CancelBooking;

public record CancelBookingCommand(Guid BookingId, string CancelledBy) : IRequest<BookingDto>;
