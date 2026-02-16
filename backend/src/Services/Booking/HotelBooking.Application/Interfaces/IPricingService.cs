namespace HotelBooking.Application.Interfaces;

public interface IPricingService
{
    Task<PricingResult> CalculatePriceAsync(string roomType, DateTime checkIn, DateTime checkOut, CancellationToken ct = default);
}

public record PricingResult(decimal PricePerNight, decimal TotalPrice, int Nights);
