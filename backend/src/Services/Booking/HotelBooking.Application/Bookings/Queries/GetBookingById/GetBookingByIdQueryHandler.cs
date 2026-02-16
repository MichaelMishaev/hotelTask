using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Bookings.Queries.GetBookingById;

public class GetBookingByIdQueryHandler : IRequestHandler<GetBookingByIdQuery, BookingDto>
{
    private readonly IBookingRepository _bookingRepository;

    public GetBookingByIdQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<BookingDto> Handle(GetBookingByIdQuery request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken)
            ?? throw new NotFoundException("Booking", request.BookingId);

        return new BookingDto(
            booking.Id,
            booking.GuestId,
            booking.RoomId,
            booking.Room?.RoomNumber ?? string.Empty,
            booking.Room?.RoomType.ToString() ?? string.Empty,
            booking.DateRange.CheckIn,
            booking.DateRange.CheckOut,
            booking.Status.ToString(),
            booking.TotalAmount.Amount,
            booking.Guest?.FullName ?? string.Empty,
            booking.Guest?.Email ?? string.Empty);
    }
}
