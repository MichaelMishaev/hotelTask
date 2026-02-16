using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Application.Interfaces;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.ValueObjects;
using MediatR;

namespace HotelBooking.Application.Bookings.Commands.UpdateBooking;

public class UpdateBookingCommandHandler : IRequestHandler<UpdateBookingCommand, BookingDto>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPricingService _pricingService;

    public UpdateBookingCommandHandler(IBookingRepository bookingRepository, IUnitOfWork unitOfWork, IPricingService pricingService)
    {
        _bookingRepository = bookingRepository;
        _unitOfWork = unitOfWork;
        _pricingService = pricingService;
    }

    public async Task<BookingDto> Handle(UpdateBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken)
            ?? throw new NotFoundException("Booking", request.BookingId);

        var newDateRange = new DateRange(request.CheckIn, request.CheckOut);

        // make sure the room is still available for the new dates
        var hasOverlap = await _bookingRepository.HasOverlappingBookingAsync(
            booking.RoomId, newDateRange, booking.Id, cancellationToken);

        if (hasOverlap)
            throw new ConflictException("Room is not available for the updated dates.");

        var pricing = await _pricingService.CalculatePriceAsync(
            booking.Room?.RoomType.ToString() ?? "Standard", request.CheckIn, request.CheckOut, cancellationToken);

        booking.UpdateDates(newDateRange, new Money(pricing.TotalPrice));
        _bookingRepository.Update(booking);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new BookingDto(
            booking.Id,
            booking.GuestId,
            booking.RoomId,
            booking.Room?.RoomNumber ?? "",
            booking.Room?.RoomType.ToString() ?? "",
            booking.DateRange.CheckIn,
            booking.DateRange.CheckOut,
            booking.Status.ToString(),
            booking.TotalAmount.Amount,
            booking.Guest?.FullName ?? "",
            booking.Guest?.Email ?? "");
    }
}
