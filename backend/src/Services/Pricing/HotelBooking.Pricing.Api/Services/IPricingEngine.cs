using HotelBooking.Pricing.Api.Models;

namespace HotelBooking.Pricing.Api.Services;

public interface IPricingEngine
{
    PriceCalculationResponse CalculatePrice(PriceCalculationRequest request);
}
