# Pricing Microservice

A standalone .NET 8 Minimal API that provides dynamic pricing calculations for the Hotel Booking Platform.

## Overview

This microservice calculates room prices based on dynamic pricing rules including seasonal variations and weekend surcharges.

## Pricing Rules

### Base Rates
- **Standard**: $100/night
- **Deluxe**: $150/night
- **Suite**: $250/night

### Multipliers

**Season Multipliers:**
- **Peak Season** (June-August, December): 1.25x
- **Off-Peak** (January-March): 0.85x
- **Regular Season** (April-May, September-November): 1.0x

**Weekend Surcharge:**
- Friday & Saturday nights: 1.15x
- Other nights: 1.0x

### Calculation Formula

For each night:
```
nightRate = baseRate × seasonMultiplier × weekendMultiplier
```

Total price is the sum of all night rates.

## API Endpoint

### Calculate Price

```http
GET /api/pricing/calculate?roomType={roomType}&checkin={checkin}&checkout={checkout}
```

**Query Parameters:**
- `roomType` (string, required): "Standard", "Deluxe", or "Suite"
- `checkin` (DateTime, required): Check-in date (ISO 8601 format)
- `checkout` (DateTime, required): Check-out date (ISO 8601 format)

**Response:**
```json
{
  "roomType": "Deluxe",
  "pricePerNight": 150.00,
  "totalPrice": 450.00,
  "nights": 3,
  "breakdown": [
    {
      "date": "2026-03-01",
      "rate": 150.00,
      "multiplier": 1.0
    },
    {
      "date": "2026-03-02",
      "rate": 150.00,
      "multiplier": 1.0
    },
    {
      "date": "2026-03-03",
      "rate": 150.00,
      "multiplier": 1.0
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Successful calculation
- `400 Bad Request`: Invalid parameters (missing room type, invalid dates)
- `500 Internal Server Error`: Unexpected error

## Running the Service

### Standalone (Local)

```bash
cd backend/src/Services/Pricing/HotelBooking.Pricing.Api
dotnet restore
dotnet run
```

The service will start on `http://localhost:5001`.

### Docker

```bash
# From project root
docker-compose up pricing-api
```

The service will be available at `http://localhost:5289` (host) which maps to `http://pricing-api:5001` (container).

### Docker Build Only

```bash
cd backend
docker build -f src/Services/Pricing/HotelBooking.Pricing.Api/Dockerfile -t pricing-api .
docker run -p 5289:5001 pricing-api
```

## Project Structure

```
HotelBooking.Pricing.Api/
├── Controllers/
│   └── PricingController.cs       # API endpoint
├── Models/
│   ├── PriceCalculationRequest.cs # Request DTO
│   └── PriceCalculationResponse.cs # Response DTO
├── Services/
│   ├── IPricingEngine.cs          # Pricing interface
│   └── PricingEngine.cs           # Core pricing logic
├── appsettings.json
├── appsettings.Development.json
├── Dockerfile
├── HotelBooking.Pricing.Api.csproj
└── Program.cs                      # Minimal API setup
```

## Swagger Documentation

When running in Development mode, Swagger UI is available at:
- Local: `http://localhost:5001/swagger`
- Docker: `http://localhost:5289/swagger`

## Health Check

```http
GET /health
```

Returns `200 OK` if the service is running.

## Dependencies

- .NET 8.0
- Swashbuckle.AspNetCore 7.0.0 (OpenAPI/Swagger)
- Serilog.AspNetCore 10.0.0 (Logging)

## Architecture

This is a **standalone microservice** with no project dependencies. It does not reference any other projects in the Hotel Booking solution.

## Example Usage

```bash
# Calculate price for a Deluxe room for 3 nights
curl "http://localhost:5289/api/pricing/calculate?roomType=Deluxe&checkin=2026-03-01&checkout=2026-03-04"

# Response
{
  "roomType": "Deluxe",
  "pricePerNight": 150.00,
  "totalPrice": 450.00,
  "nights": 3,
  "breakdown": [...]
}
```

## Integration with Booking Service

The Booking service can call this API to get dynamic pricing instead of using static $100/night rates. This enables:
- Seasonal price variations
- Weekend surcharges
- Per-night rate breakdowns
- Future pricing rule changes without modifying the Booking service

## Future Enhancements

Potential improvements:
- Special event pricing (holidays, conferences)
- Last-minute booking discounts
- Length-of-stay discounts
- Room occupancy-based dynamic pricing
- A/B testing different pricing strategies
- Price caching for performance
