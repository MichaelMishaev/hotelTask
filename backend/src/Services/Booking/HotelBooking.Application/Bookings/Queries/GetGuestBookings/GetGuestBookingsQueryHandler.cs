using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Bookings.Queries.GetGuestBookings;

public class GetGuestBookingsQueryHandler : IRequestHandler<GetGuestBookingsQuery, IReadOnlyList<BookingDto>>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IGuestRepository _guestRepository;

    public GetGuestBookingsQueryHandler(IBookingRepository bookingRepository, IGuestRepository guestRepository)
    {
        _bookingRepository = bookingRepository;
        _guestRepository = guestRepository;
    }

    public async Task<IReadOnlyList<BookingDto>> Handle(GetGuestBookingsQuery request, CancellationToken cancellationToken)
    {
        var guest = await _guestRepository.GetByIdAsync(request.GuestId, cancellationToken)
            ?? throw new NotFoundException("Guest", request.GuestId);

        var bookings = await _bookingRepository.GetByGuestIdAsync(request.GuestId, cancellationToken);

        return bookings.Select(b => new BookingDto(
            b.Id,
            b.GuestId,
            b.RoomId,
            b.Room?.RoomNumber ?? string.Empty,
            b.Room?.RoomType.ToString() ?? string.Empty,
            b.DateRange.CheckIn,
            b.DateRange.CheckOut,
            b.Status.ToString(),
            b.TotalAmount.Amount,
            guest.FullName,
            guest.Email
        )).ToList().AsReadOnly();
    }
}
