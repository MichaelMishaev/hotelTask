using MediatR;

namespace HotelBooking.Application.DigitalKeys.Commands;

public record RevokeDigitalKeyCommand(Guid KeyId, Guid GuestId) : IRequest<Unit>;
