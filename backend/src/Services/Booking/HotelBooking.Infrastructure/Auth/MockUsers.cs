namespace HotelBooking.Infrastructure.Auth;

// hardcoded users for demo - in production you'd obviously use a real identity
// provider with hashed passwords, lockout policies, MFA, etc.
public static class MockUsers
{
    public static readonly Guid GuestUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid StaffUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid AdminUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    public record MockUser(Guid Id, string Email, string Password, string FirstName, string LastName, string Role);

    public static readonly MockUser[] Users =
    {
        new(GuestUserId, "john@example.com", "guest123", "John", "Doe", "Guest"),
        new(StaffUserId, "jane@example.com", "staff123", "Jane", "Smith", "Staff"),
        new(AdminUserId, "admin@example.com", "admin123", "Admin", "User", "Admin"),
    };

    public static MockUser? FindByEmail(string email) =>
        Users.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
}
