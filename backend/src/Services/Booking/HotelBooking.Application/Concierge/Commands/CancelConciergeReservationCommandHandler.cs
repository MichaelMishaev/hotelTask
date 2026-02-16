using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Concierge.Commands;

public class CancelConciergeReservationCommandHandler : IRequestHandler<CancelConciergeReservationCommand, Unit>
{
    private readonly IConciergeReservationRepository _reservationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelConciergeReservationCommandHandler(
        IConciergeReservationRepository reservationRepository,
        IUnitOfWork unitOfWork)
    {
        _reservationRepository = reservationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(CancelConciergeReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(request.ReservationId, cancellationToken)
            ?? throw new NotFoundException("ConciergeReservation", request.ReservationId);

        if (reservation.GuestId != request.GuestId)
            throw new NotFoundException("ConciergeReservation", request.ReservationId);

        reservation.Cancel();
        _reservationRepository.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
