using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Staff.Commands;

public record CheckOutBookingCommand(Guid BookingId, string StaffEmail) : IRequest<BookingDto>;
