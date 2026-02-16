using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Staff.Queries;

public class GetTodayCheckOutsQueryHandler : IRequestHandler<GetTodayCheckOutsQuery, IReadOnlyList<CheckInOutDto>>
{
    private readonly IBookingRepository _bookingRepository;

    public GetTodayCheckOutsQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<IReadOnlyList<CheckInOutDto>> Handle(GetTodayCheckOutsQuery request, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var bookings = await _bookingRepository.GetByCheckOutDateAsync(today, cancellationToken);

        return bookings.Select(b => new CheckInOutDto(
            b.Id,
            b.Guest?.FullName ?? "",
            b.Room?.RoomNumber ?? "",
            b.Room?.RoomType.ToString() ?? "",
            b.DateRange.CheckIn,
            b.DateRange.CheckOut,
            b.Status.ToString()
        )).ToList();
    }
}
