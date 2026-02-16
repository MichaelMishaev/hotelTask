using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Concierge.Commands;

public class CreateConciergeReservationCommandHandler : IRequestHandler<CreateConciergeReservationCommand, ConciergeReservationDto>
{
    private readonly IConciergeReservationRepository _reservationRepository;
    private readonly IConciergeServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateConciergeReservationCommandHandler(
        IConciergeReservationRepository reservationRepository,
        IConciergeServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _reservationRepository = reservationRepository;
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ConciergeReservationDto> Handle(CreateConciergeReservationCommand request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken)
            ?? throw new NotFoundException("ConciergeService", request.ServiceId);

        if (!service.IsAvailable)
            throw new ConflictException($"Service '{service.Title}' is not currently available.");

        var reservation = ConciergeReservation.Create(
            request.ServiceId, request.GuestId, request.BookingId, request.ReservedAt);

        await _reservationRepository.AddAsync(reservation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ConciergeReservationDto(
            reservation.Id, reservation.ServiceId, service.Title,
            service.Category.ToString(), reservation.GuestId,
            reservation.BookingId, reservation.ReservedAt,
            reservation.Status.ToString(), service.Price);
    }
}
