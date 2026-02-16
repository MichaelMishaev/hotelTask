using System.Text;
using System.Text.Json;
using HotelBooking.Shared.IntegrationEvents;
using MailKit.Net.Smtp;
using MimeKit;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace HotelBooking.Notification;

public class BookingEventConsumer : BackgroundService
{
    private readonly ILogger<BookingEventConsumer> _logger;
    private readonly IConfiguration _config;
    private IConnection? _connection;
    private IModel? _channel;

    public BookingEventConsumer(ILogger<BookingEventConsumer> logger, IConfiguration config)
    {
        _logger = logger;
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await WaitForRabbitMqAsync(stoppingToken);

        var factory = new ConnectionFactory
        {
            HostName = _config["RabbitMQ:Host"] ?? "rabbitmq",
            UserName = _config["RabbitMQ:UserName"] ?? "guest",
            Password = _config["RabbitMQ:Password"] ?? "guest",
            DispatchConsumersAsync = true
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        _channel.ExchangeDeclare("hotel.events", ExchangeType.Topic, durable: true);
        _channel.QueueDeclare("notification.bookings", durable: true, exclusive: false, autoDelete: false);
        _channel.QueueBind("notification.bookings", "hotel.events", "booking.*");

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.Received += async (_, ea) =>
        {
            var body = Encoding.UTF8.GetString(ea.Body.ToArray());
            var routingKey = ea.RoutingKey;

            _logger.LogInformation("Received {RoutingKey}: {Body}", routingKey, body);

            try
            {
                if (routingKey == "booking.created")
                {
                    var evt = JsonSerializer.Deserialize<BookingCreatedIntegrationEvent>(body);
                    if (evt is not null) await SendBookingConfirmationEmail(evt);
                }
                else if (routingKey == "booking.cancelled")
                {
                    var evt = JsonSerializer.Deserialize<BookingCancelledIntegrationEvent>(body);
                    if (evt is not null) await SendCancellationEmail(evt);
                }

                _channel.BasicAck(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing {RoutingKey}", routingKey);
                _channel.BasicNack(ea.DeliveryTag, false, true);
            }
        };

        _channel.BasicConsume("notification.bookings", autoAck: false, consumer);
        _logger.LogInformation("Listening on queue notification.bookings...");

        while (!stoppingToken.IsCancellationRequested)
            await Task.Delay(1000, stoppingToken);
    }

    private async Task SendBookingConfirmationEmail(BookingCreatedIntegrationEvent evt)
    {
        var nights = (evt.CheckOut - evt.CheckIn).Days;
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Grand Hotel", "noreply@grandhotel.com"));
        message.To.Add(new MailboxAddress(evt.GuestName, evt.GuestEmail));
        message.Subject = $"Booking Confirmed - {evt.RoomType} Room";
        message.Body = new TextPart("html")
        {
            Text = BuildConfirmationHtml(evt, nights)
        };

        await SendEmailAsync(message);
        _logger.LogInformation("Confirmation email sent to {Email} for booking {BookingId}", evt.GuestEmail, evt.BookingId);
    }

    private async Task SendCancellationEmail(BookingCancelledIntegrationEvent evt)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Grand Hotel", "noreply@grandhotel.com"));
        message.To.Add(new MailboxAddress(evt.GuestName, evt.GuestEmail));
        message.Subject = "Booking Cancelled - Grand Hotel";
        message.Body = new TextPart("html")
        {
            Text = BuildCancellationHtml(evt)
        };

        await SendEmailAsync(message);
        _logger.LogInformation("Cancellation email sent to {Email} for booking {BookingId}", evt.GuestEmail, evt.BookingId);
    }

    private static string BuildConfirmationHtml(BookingCreatedIntegrationEvent evt, int nights)
    {
        return $@"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"" />
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #1a365d, #2b6cb0); color: #ffffff; padding: 32px 24px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 28px; letter-spacing: 1px; }}
        .header p {{ margin: 8px 0 0; opacity: 0.85; font-size: 14px; }}
        .content {{ padding: 32px 24px; color: #2d3748; }}
        .content h2 {{ color: #2b6cb0; margin-top: 0; }}
        .details {{ background: #ebf8ff; border-left: 4px solid #2b6cb0; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }}
        .details table {{ width: 100%; border-collapse: collapse; }}
        .details td {{ padding: 8px 0; font-size: 15px; }}
        .details td:first-child {{ font-weight: 600; color: #1a365d; width: 120px; }}
        .total {{ background: #1a365d; color: #ffffff; border-radius: 6px; padding: 14px 20px; text-align: center; font-size: 20px; font-weight: 700; margin: 20px 0; }}
        .booking-id {{ text-align: center; color: #718096; font-size: 13px; margin-top: 16px; }}
        .footer {{ background: #f7fafc; padding: 20px 24px; text-align: center; color: #a0aec0; font-size: 12px; border-top: 1px solid #e2e8f0; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Grand Hotel</h1>
            <p>Your Booking is Confirmed</p>
        </div>
        <div class=""content"">
            <h2>Hello, {evt.GuestName}!</h2>
            <p>Thank you for choosing Grand Hotel. Your reservation has been confirmed. Here are your booking details:</p>
            <div class=""details"">
                <table>
                    <tr><td>Room</td><td>{evt.RoomNumber} ({evt.RoomType})</td></tr>
                    <tr><td>Check-in</td><td>{evt.CheckIn:dddd, MMMM dd, yyyy}</td></tr>
                    <tr><td>Check-out</td><td>{evt.CheckOut:dddd, MMMM dd, yyyy}</td></tr>
                    <tr><td>Duration</td><td>{nights} night(s)</td></tr>
                </table>
            </div>
            <div class=""total"">Total: ${evt.TotalAmount:N2}</div>
            <div class=""booking-id"">Booking ID: {evt.BookingId}</div>
            <p style=""margin-top: 24px;"">If you have any questions or need to modify your reservation, please do not hesitate to contact our front desk.</p>
        </div>
        <div class=""footer"">
            &copy; {DateTime.UtcNow.Year} Grand Hotel. All rights reserved.<br />
            This is an automated message. Please do not reply directly to this email.
        </div>
    </div>
</body>
</html>";
    }

    private static string BuildCancellationHtml(BookingCancelledIntegrationEvent evt)
    {
        return $@"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"" />
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #742a2a, #c53030); color: #ffffff; padding: 32px 24px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 28px; letter-spacing: 1px; }}
        .header p {{ margin: 8px 0 0; opacity: 0.85; font-size: 14px; }}
        .content {{ padding: 32px 24px; color: #2d3748; }}
        .content h2 {{ color: #c53030; margin-top: 0; }}
        .notice {{ background: #fff5f5; border-left: 4px solid #c53030; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }}
        .booking-id {{ text-align: center; color: #718096; font-size: 13px; margin-top: 16px; }}
        .footer {{ background: #f7fafc; padding: 20px 24px; text-align: center; color: #a0aec0; font-size: 12px; border-top: 1px solid #e2e8f0; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Grand Hotel</h1>
            <p>Booking Cancellation Notice</p>
        </div>
        <div class=""content"">
            <h2>Hello, {evt.GuestName}</h2>
            <div class=""notice"">
                <p style=""margin: 0;"">Your booking has been successfully cancelled. If this was a mistake or you would like to rebook, please contact our front desk or visit our website.</p>
            </div>
            <div class=""booking-id"">Cancelled Booking ID: {evt.BookingId}</div>
            <p style=""margin-top: 24px;"">We hope to welcome you at Grand Hotel in the future. If you have any questions regarding this cancellation, please do not hesitate to reach out.</p>
        </div>
        <div class=""footer"">
            &copy; {DateTime.UtcNow.Year} Grand Hotel. All rights reserved.<br />
            This is an automated message. Please do not reply directly to this email.
        </div>
    </div>
</body>
</html>";
    }

    private async Task SendEmailAsync(MimeMessage message)
    {
        var smtpHost = _config["Smtp:Host"] ?? "mailhog";
        var smtpPort = int.Parse(_config["Smtp:Port"] ?? "1025");

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, false);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private async Task WaitForRabbitMqAsync(CancellationToken ct)
    {
        var host = _config["RabbitMQ:Host"] ?? "rabbitmq";
        for (var i = 0; i < 30; i++)
        {
            try
            {
                var factory = new ConnectionFactory { HostName = host };
                using var conn = factory.CreateConnection();
                conn.Close();
                _logger.LogInformation("RabbitMQ is ready");
                return;
            }
            catch
            {
                _logger.LogInformation("Waiting for RabbitMQ... ({Attempt}/30)", i + 1);
                await Task.Delay(2000, ct);
            }
        }
        throw new Exception("RabbitMQ not available after 60 seconds");
    }

    public override void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
        base.Dispose();
    }
}
