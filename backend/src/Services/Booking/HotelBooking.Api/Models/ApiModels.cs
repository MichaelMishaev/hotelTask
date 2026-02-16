namespace HotelBooking.Api.Models;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string UserId, string Name, string Email, string Role);
public record UserInfo(string Id, string Name, string Email, string Role);
public record CreateBookingRequest(Guid GuestId, Guid RoomId, DateTime CheckIn, DateTime CheckOut);
public record UpdateBookingRequest(DateTime CheckIn, DateTime CheckOut);
public record UpdateStatusRequest(string Status);
public record UpdateRoomStatusRequest(string Status);
public record UpdateUserRequest(string Name, string Email, string Role);

// Profile
public record UpdateProfileRequest(
    string? FullName,
    string Phone,
    string Address,
    string? AvatarUrl,
    bool PushNotifications,
    string Language,
    string Currency);

// Digital Key
public record ActivateDigitalKeyRequest(Guid BookingId);

// Stay Preferences
public record SaveStayPreferenceRequest(
    Guid BookingId,
    string? PillowType,
    string? MinibarPreference,
    string? ArrivalTime,
    List<AmenityInputRequest>? Amenities);

public record AmenityInputRequest(
    string AmenityName,
    string AmenityDescription,
    decimal Price);

// Loyalty
public record RedeemRewardRequest(Guid RewardId);

// Concierge
public record CreateReservationRequest(
    Guid ServiceId,
    Guid? BookingId,
    DateTime ReservedAt);
