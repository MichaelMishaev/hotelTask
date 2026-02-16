using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.DigitalKeys.Commands;

public record ActivateDigitalKeyCommand(Guid BookingId, Guid GuestId) : IRequest<DigitalKeyDto>;
