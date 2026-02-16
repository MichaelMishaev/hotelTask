using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.StayPreferences.Commands;

public class SaveStayPreferenceCommandHandler : IRequestHandler<SaveStayPreferenceCommand, StayPreferenceDto>
{
    private readonly IStayPreferenceRepository _repository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SaveStayPreferenceCommandHandler(
        IStayPreferenceRepository repository,
        IBookingRepository bookingRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _bookingRepository = bookingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<StayPreferenceDto> Handle(SaveStayPreferenceCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken)
            ?? throw new NotFoundException("Booking", request.BookingId);

        if (booking.GuestId != request.GuestId)
            throw new NotFoundException("Booking", request.BookingId);

        var pillowType = string.IsNullOrEmpty(request.PillowType)
            ? (PillowType?)null
            : Enum.Parse<PillowType>(request.PillowType, ignoreCase: true);

        var minibarPref = string.IsNullOrEmpty(request.MinibarPreference)
            ? (MinibarPreference?)null
            : Enum.Parse<MinibarPreference>(request.MinibarPreference, ignoreCase: true);

        var arrivalTime = string.IsNullOrEmpty(request.ArrivalTime)
            ? (TimeOnly?)null
            : TimeOnly.Parse(request.ArrivalTime);

        var existing = await _repository.GetByBookingIdAsync(request.BookingId, cancellationToken);

        StayPreference pref;
        if (existing != null)
        {
            existing.Update(pillowType, minibarPref, arrivalTime);
            existing.ClearAmenities();
            pref = existing;
            _repository.Update(existing);
        }
        else
        {
            pref = StayPreference.Create(request.BookingId, request.GuestId, pillowType, minibarPref, arrivalTime);
            await _repository.AddAsync(pref, cancellationToken);
        }

        if (request.Amenities != null)
        {
            foreach (var amenity in request.Amenities)
            {
                pref.AddAmenity(StayPreferenceAmenity.Create(
                    pref.Id, amenity.AmenityName, amenity.AmenityDescription, amenity.Price));
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new StayPreferenceDto(
            pref.Id, pref.BookingId, pref.GuestId,
            pref.PillowType?.ToString(), pref.MinibarPreference?.ToString(),
            pref.ArrivalTime?.ToString("HH:mm"),
            pref.Amenities.Select(a => new StayPreferenceAmenityDto(
                a.Id, a.AmenityName, a.AmenityDescription, a.Price)).ToList(),
            pref.CreatedAt, pref.UpdatedAt);
    }
}
