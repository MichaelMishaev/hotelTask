using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.DigitalKeys.Queries;

public record GetDigitalKeyByBookingQuery(Guid BookingId) : IRequest<DigitalKeyDto?>;
