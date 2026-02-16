namespace HotelBooking.Pricing.Api.Models;

public class PriceCalculationResponse
{
    public string RoomType { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public decimal TotalPrice { get; set; }
    public int Nights { get; set; }
    public List<PriceBreakdownItem> Breakdown { get; set; } = new();
}

public class PriceBreakdownItem
{
    public string Date { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public decimal Multiplier { get; set; }
}
