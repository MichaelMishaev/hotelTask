using HotelBooking.Domain.Common;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Entities;

public class Guest : BaseEntity
{
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;

    // Navigation
    public ICollection<Booking> Bookings { get; private set; } = new List<Booking>();

    // EF Core constructor
    private Guest() { }

    public Guest(string firstName, string lastName, string email, string phone)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new DomainException("First name cannot be empty.");
        if (string.IsNullOrWhiteSpace(lastName))
            throw new DomainException("Last name cannot be empty.");
        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Email cannot be empty.");
        if (!email.Contains('@'))
            throw new DomainException("Email format is invalid.");

        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone ?? string.Empty;
    }

    public string FullName => $"{FirstName} {LastName}";

    public void UpdateName(string firstName, string lastName)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new DomainException("First name cannot be empty.");
        if (string.IsNullOrWhiteSpace(lastName))
            throw new DomainException("Last name cannot be empty.");

        FirstName = firstName;
        LastName = lastName;
    }

    // For seeding with known IDs (demo login)
    public static Guest Create(Guid id, string firstName, string lastName, string email, string phone)
    {
        var guest = new Guest(firstName, lastName, email, phone);
        guest.Id = id;
        return guest;
    }
}
