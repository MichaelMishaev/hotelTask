using System.Net;
using System.Text.Json;
using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, exception: ex, isDevelopment: _env.IsDevelopment());
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception, bool isDevelopment)
    {
        var (statusCode, title) = exception switch
        {
            ValidationException => (HttpStatusCode.BadRequest, "Validation Error"),
            NotFoundException => (HttpStatusCode.NotFound, "Not Found"),
            ConflictException => (HttpStatusCode.Conflict, "Conflict"),
            DomainException => (HttpStatusCode.BadRequest, "Domain Error"),
            _ => (HttpStatusCode.InternalServerError, "Internal Server Error")
        };

        // Security: hide internal error details in production
        var detail = exception switch
        {
            // User-facing errors: always show message
            ValidationException or NotFoundException or ConflictException or DomainException
                => exception.Message,
            // Internal errors: only show details in development
            _ => isDevelopment
                ? exception.Message
                : "An error occurred processing your request."
        };

        var problemDetails = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        // For validation errors, include the error dictionary
        if (exception is ValidationException validationEx)
        {
            problemDetails.Extensions["errors"] = validationEx.Errors;
        }

        // Add correlation ID for traceability
        problemDetails.Extensions["traceId"] = context.TraceIdentifier;

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/problem+json";

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
