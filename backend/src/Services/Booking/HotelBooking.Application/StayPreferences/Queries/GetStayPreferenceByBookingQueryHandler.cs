using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.StayPreferences.Queries;

public class GetStayPreferenceByBookingQueryHandler : IRequestHandler<GetStayPreferenceByBookingQuery, StayPreferenceDto?>
{
    private readonly IStayPreferenceRepository _repository;

    public GetStayPreferenceByBookingQueryHandler(IStayPreferenceRepository repository)
    {
        _repository = repository;
    }

    public async Task<StayPreferenceDto?> Handle(GetStayPreferenceByBookingQuery request, CancellationToken cancellationToken)
    {
        var pref = await _repository.GetByBookingIdAsync(request.BookingId, cancellationToken);
        if (pref == null) return null;

        return new StayPreferenceDto(
            pref.Id, pref.BookingId, pref.GuestId,
            pref.PillowType?.ToString(), pref.MinibarPreference?.ToString(),
            pref.ArrivalTime?.ToString("HH:mm"),
            pref.Amenities.Select(a => new StayPreferenceAmenityDto(
                a.Id, a.AmenityName, a.AmenityDescription, a.Price)).ToList(),
            pref.CreatedAt, pref.UpdatedAt);
    }
}
