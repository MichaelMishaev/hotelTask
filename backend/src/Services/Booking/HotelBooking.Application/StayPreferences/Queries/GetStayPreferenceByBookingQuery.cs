using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.StayPreferences.Queries;

public record GetStayPreferenceByBookingQuery(Guid BookingId) : IRequest<StayPreferenceDto?>;
