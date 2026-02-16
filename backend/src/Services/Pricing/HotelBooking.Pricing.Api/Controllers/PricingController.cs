using Microsoft.AspNetCore.Mvc;
using HotelBooking.Pricing.Api.Models;
using HotelBooking.Pricing.Api.Services;

namespace HotelBooking.Pricing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PricingController : ControllerBase
{
    private readonly IPricingEngine _pricingEngine;
    private readonly ILogger<PricingController> _logger;

    public PricingController(IPricingEngine pricingEngine, ILogger<PricingController> logger)
    {
        _pricingEngine = pricingEngine;
        _logger = logger;
    }

    [HttpGet("calculate")]
    public IActionResult CalculatePrice([FromQuery] string roomType, [FromQuery] DateTime checkin, [FromQuery] DateTime checkout)
    {
        try
        {
            _logger.LogInformation("Calculating price for {RoomType} from {CheckIn} to {CheckOut}",
                roomType, checkin, checkout);

            if (string.IsNullOrWhiteSpace(roomType))
            {
                return BadRequest(new { error = "Room type is required" });
            }

            if (checkin >= checkout)
            {
                return BadRequest(new { error = "Check-out date must be after check-in date" });
            }

            var request = new PriceCalculationRequest
            {
                RoomType = roomType,
                CheckIn = checkin,
                CheckOut = checkout
            };

            var response = _pricingEngine.CalculatePrice(request);

            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid room type: {RoomType}", roomType);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating price");
            return StatusCode(500, new { error = "An error occurred while calculating price" });
        }
    }
}
