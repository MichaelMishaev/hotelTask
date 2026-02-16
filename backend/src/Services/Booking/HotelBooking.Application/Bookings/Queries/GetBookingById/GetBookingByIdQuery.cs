using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Bookings.Queries.GetBookingById;

public record GetBookingByIdQuery(Guid BookingId) : IRequest<BookingDto>;
