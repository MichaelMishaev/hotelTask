using System.Security.Claims;

namespace HotelBooking.Api.Middleware;

/// <summary>
/// Logs security-relevant events: auth failures, forbidden access, rate limiting.
/// Placed after ExceptionHandlingMiddleware to capture response status codes.
/// </summary>
public class SecurityAuditMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SecurityAuditMiddleware> _logger;

    public SecurityAuditMiddleware(RequestDelegate next, ILogger<SecurityAuditMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        await _next(context);

        var statusCode = context.Response.StatusCode;
        var path = context.Request.Path.Value;
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        switch (statusCode)
        {
            case 401:
                _logger.LogWarning(
                    "Security: Unauthorized access attempt. Path={Path}, IP={IP}, UserAgent={UserAgent}",
                    path, ip, context.Request.Headers.UserAgent.ToString());
                break;

            case 403:
                var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";
                _logger.LogWarning(
                    "Security: Forbidden access. UserId={UserId}, Path={Path}, IP={IP}",
                    userId, path, ip);
                break;

            case 429:
                _logger.LogWarning(
                    "Security: Rate limit exceeded. Path={Path}, IP={IP}",
                    path, ip);
                break;
        }
    }
}
