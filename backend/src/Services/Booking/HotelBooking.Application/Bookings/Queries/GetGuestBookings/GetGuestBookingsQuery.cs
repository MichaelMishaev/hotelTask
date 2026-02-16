using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Bookings.Queries.GetGuestBookings;

public record GetGuestBookingsQuery(Guid GuestId) : IRequest<IReadOnlyList<BookingDto>>;
