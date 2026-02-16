namespace HotelBooking.Domain.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(string userId, string email, string name, string role);
}
