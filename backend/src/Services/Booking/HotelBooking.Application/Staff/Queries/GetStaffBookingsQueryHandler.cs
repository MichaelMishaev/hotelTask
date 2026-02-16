using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Staff.Queries;

public class GetStaffBookingsQueryHandler : IRequestHandler<GetStaffBookingsQuery, PagedResult<BookingDto>>
{
    private readonly IBookingRepository _bookingRepository;

    public GetStaffBookingsQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<PagedResult<BookingDto>> Handle(GetStaffBookingsQuery request, CancellationToken cancellationToken)
    {
        var all = await _bookingRepository.GetAllAsync(cancellationToken);

        // Filter by status
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            all = all
                .Where(b => b.Status.ToString().Equals(request.Status, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        // Filter by search (guest name, room number, or guest email)
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLowerInvariant();
            all = all.Where(b =>
                (b.Guest?.FullName?.ToLowerInvariant().Contains(search) ?? false) ||
                (b.Room?.RoomNumber?.ToLowerInvariant().Contains(search) ?? false) ||
                (b.Guest?.Email?.ToLowerInvariant().Contains(search) ?? false)
            ).ToList();
        }

        var total = all.Count;
        var items = all
            .Skip((request.Page - 1) * request.Limit)
            .Take(request.Limit)
            .Select(b => new BookingDto(
                b.Id,
                b.GuestId,
                b.RoomId,
                b.Room?.RoomNumber ?? "",
                b.Room?.RoomType.ToString() ?? "",
                b.DateRange.CheckIn,
                b.DateRange.CheckOut,
                b.Status.ToString(),
                b.TotalAmount.Amount,
                b.Guest?.FullName ?? "",
                b.Guest?.Email ?? ""
            )).ToList();

        return new PagedResult<BookingDto>(items, total, request.Page, request.Limit);
    }
}
