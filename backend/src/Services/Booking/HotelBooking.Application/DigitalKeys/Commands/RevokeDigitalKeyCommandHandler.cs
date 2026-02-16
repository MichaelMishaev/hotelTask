using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.DigitalKeys.Commands;

public class RevokeDigitalKeyCommandHandler : IRequestHandler<RevokeDigitalKeyCommand, Unit>
{
    private readonly IDigitalKeyRepository _keyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RevokeDigitalKeyCommandHandler(
        IDigitalKeyRepository keyRepository,
        IUnitOfWork unitOfWork)
    {
        _keyRepository = keyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(RevokeDigitalKeyCommand request, CancellationToken cancellationToken)
    {
        var key = await _keyRepository.GetByIdAsync(request.KeyId, cancellationToken)
            ?? throw new NotFoundException("DigitalKey", request.KeyId);

        if (key.GuestId != request.GuestId)
            throw new NotFoundException("DigitalKey", request.KeyId);

        key.Revoke();
        _keyRepository.Update(key);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
