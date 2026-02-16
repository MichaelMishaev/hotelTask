using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Application.Interfaces;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.ValueObjects;
using MediatR;

namespace HotelBooking.Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, BookingDto>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IGuestRepository _guestRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPricingService _pricingService;
    private readonly ICacheService? _cache;

    public CreateBookingCommandHandler(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository,
        IGuestRepository guestRepository,
        IUnitOfWork unitOfWork,
        IPricingService pricingService,
        ICacheService? cache = null)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
        _guestRepository = guestRepository;
        _unitOfWork = unitOfWork;
        _pricingService = pricingService;
        _cache = cache;
    }

    public async Task<BookingDto> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdAsync(request.RoomId, cancellationToken)
            ?? throw new NotFoundException("Room", request.RoomId);

        var guest = await _guestRepository.GetByIdAsync(request.GuestId, cancellationToken)
            ?? throw new NotFoundException("Guest", request.GuestId);

        var dateRange = new DateRange(request.CheckIn, request.CheckOut);

        var hasOverlap = await _bookingRepository.HasOverlappingBookingAsync(
            request.RoomId, dateRange, null, cancellationToken);

        if (hasOverlap)
            throw new ConflictException($"Room {room.RoomNumber} is not available for the requested dates.");

        var pricing = await _pricingService.CalculatePriceAsync(
            room.RoomType.ToString(), request.CheckIn, request.CheckOut, cancellationToken);

        var booking = Booking.Create(
            guest.Id, room.Id, dateRange, new Money(pricing.TotalPrice), guest.Email,
            guest.Email, guest.FullName, room.RoomNumber, room.RoomType.ToString());

        await _bookingRepository.AddAsync(booking, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Invalidate availability cache
        if (_cache is not null)
            await _cache.RemoveByPrefixAsync("availability:", cancellationToken);

        return new BookingDto(
            booking.Id,
            booking.GuestId,
            booking.RoomId,
            room.RoomNumber,
            room.RoomType.ToString(),
            booking.DateRange.CheckIn,
            booking.DateRange.CheckOut,
            booking.Status.ToString(),
            booking.TotalAmount.Amount,
            guest.FullName,
            guest.Email);
    }
}
