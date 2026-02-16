using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public class GetBookingsByTypeQueryHandler : IRequestHandler<GetBookingsByTypeQuery, BookingsByTypeAnalyticsDto>
{
    private readonly IBookingRepository _bookingRepository;

    public GetBookingsByTypeQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<BookingsByTypeAnalyticsDto> Handle(GetBookingsByTypeQuery request, CancellationToken cancellationToken)
    {
        var allBookings = await _bookingRepository.GetAllAsync(cancellationToken);
        var activeBookings = allBookings
            .Where(b => b.Status != BookingStatus.Cancelled)
            .ToList();

        var bookingsByType = activeBookings
            .GroupBy(b => b.Room.RoomType.ToString())
            .Select(g => new BookingsByTypeDto(
                RoomType: g.Key,
                Count: g.Count(),
                Revenue: g.Sum(b => b.TotalAmount.Amount)
            ))
            .OrderBy(b => b.RoomType)
            .ToList();

        return new BookingsByTypeAnalyticsDto(bookingsByType);
    }
}
