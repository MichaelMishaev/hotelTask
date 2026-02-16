using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Staff.Commands;

public record CheckInBookingCommand(Guid BookingId, string StaffEmail) : IRequest<BookingDto>;
