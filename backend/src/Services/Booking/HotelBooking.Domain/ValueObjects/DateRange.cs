using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.ValueObjects;

public record DateRange
{
    public DateTime CheckIn { get; }
    public DateTime CheckOut { get; }
    public int Nights => (CheckOut - CheckIn).Days;

    public DateRange(DateTime checkIn, DateTime checkOut)
    {
        if (checkIn.Date < DateTime.UtcNow.Date)
            throw new DomainException("Check-in date cannot be in the past.");
        if (checkIn >= checkOut)
            throw new DomainException("Check-in date must be before check-out date.");

        CheckIn = DateTime.SpecifyKind(checkIn.Date, DateTimeKind.Utc);
        CheckOut = DateTime.SpecifyKind(checkOut.Date, DateTimeKind.Utc);
    }

    // EF Core constructor
    private DateRange() { }

    public bool Overlaps(DateRange other) =>
        CheckIn < other.CheckOut && CheckOut > other.CheckIn;
}
