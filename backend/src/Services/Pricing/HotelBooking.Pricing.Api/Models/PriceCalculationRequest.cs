namespace HotelBooking.Pricing.Api.Models;

public class PriceCalculationRequest
{
    public string RoomType { get; set; } = string.Empty;
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
}
