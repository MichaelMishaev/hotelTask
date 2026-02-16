using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.DigitalKeys.Commands;

public class ActivateDigitalKeyCommandHandler : IRequestHandler<ActivateDigitalKeyCommand, DigitalKeyDto>
{
    private readonly IDigitalKeyRepository _keyRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ActivateDigitalKeyCommandHandler(
        IDigitalKeyRepository keyRepository,
        IBookingRepository bookingRepository,
        IUnitOfWork unitOfWork)
    {
        _keyRepository = keyRepository;
        _bookingRepository = bookingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DigitalKeyDto> Handle(ActivateDigitalKeyCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken)
            ?? throw new NotFoundException("Booking", request.BookingId);

        if (booking.GuestId != request.GuestId)
            throw new NotFoundException("Booking", request.BookingId);

        if (booking.Status != BookingStatus.Confirmed && booking.Status != BookingStatus.CheckedIn)
            throw new ConflictException($"Cannot activate digital key for booking with status {booking.Status}.");

        // Check if there's already an active key
        var existingKey = await _keyRepository.GetActiveByBookingIdAsync(request.BookingId, cancellationToken);
        if (existingKey != null)
        {
            return new DigitalKeyDto(
                existingKey.Id, existingKey.BookingId, existingKey.GuestId,
                existingKey.RoomNumber, existingKey.RoomType.ToString(), existingKey.Floor,
                existingKey.Status.ToString(), existingKey.ActivatedAt, existingKey.ExpiresAt, existingKey.IsValid);
        }

        var room = booking.Room;
        var floor = int.Parse(room.RoomNumber[..1]);
        var expiresAt = booking.DateRange.CheckOut;

        var key = DigitalKey.Create(
            booking.Id, request.GuestId,
            room.RoomNumber, room.RoomType, floor, expiresAt);

        await _keyRepository.AddAsync(key, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new DigitalKeyDto(
            key.Id, key.BookingId, key.GuestId,
            key.RoomNumber, key.RoomType.ToString(), key.Floor,
            key.Status.ToString(), key.ActivatedAt, key.ExpiresAt, key.IsValid);
    }
}
