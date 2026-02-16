using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using HotelBooking.Application.Common.Behaviors;
using MediatR;
using Moq;
using ValidationException = HotelBooking.Application.Common.Exceptions.ValidationException;

namespace HotelBooking.Application.Tests.Behaviors;

public class ValidationBehaviorTests
{
    public record TestRequest(string Name) : IRequest<string>;

    private static RequestHandlerDelegate<string> CreateNext(string returnValue)
    {
        return (ct) => Task.FromResult(returnValue);
    }

    [Fact]
    public async Task Handle_NoValidators_CallsNext()
    {
        var validators = Enumerable.Empty<IValidator<TestRequest>>();
        var behavior = new ValidationBehavior<TestRequest, string>(validators);

        var result = await behavior.Handle(
            new TestRequest("test"),
            CreateNext("success"),
            CancellationToken.None);

        result.Should().Be("success");
    }

    [Fact]
    public async Task Handle_ValidRequest_CallsNext()
    {
        var validator = new Mock<IValidator<TestRequest>>();
        validator.Setup(v => v.ValidateAsync(It.IsAny<ValidationContext<TestRequest>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());

        var behavior = new ValidationBehavior<TestRequest, string>(new[] { validator.Object });

        var result = await behavior.Handle(
            new TestRequest("test"),
            CreateNext("success"),
            CancellationToken.None);

        result.Should().Be("success");
    }

    [Fact]
    public async Task Handle_InvalidRequest_ThrowsValidationException()
    {
        var validator = new Mock<IValidator<TestRequest>>();
        validator.Setup(v => v.ValidateAsync(It.IsAny<ValidationContext<TestRequest>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(new[]
            {
                new ValidationFailure("Name", "Name is required")
            }));

        var behavior = new ValidationBehavior<TestRequest, string>(new[] { validator.Object });

        var act = () => behavior.Handle(
            new TestRequest(""),
            CreateNext("success"),
            CancellationToken.None);

        var exception = await act.Should().ThrowAsync<ValidationException>();
        exception.Which.Errors.Should().ContainKey("Name");
    }
}
