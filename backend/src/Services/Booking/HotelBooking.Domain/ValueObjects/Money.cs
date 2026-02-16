using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.ValueObjects;

public record Money
{
    public decimal Amount { get; }

    public Money(decimal amount)
    {
        if (amount < 0)
            throw new DomainException("Money amount cannot be negative.");
        Amount = amount;
    }

    // EF Core constructor
    private Money() { }

    public static Money operator +(Money a, Money b) => new(a.Amount + b.Amount);
    public static Money operator *(Money a, int multiplier) => new(a.Amount * multiplier);
    public Money Multiply(int multiplier) => new(Amount * multiplier);
}
