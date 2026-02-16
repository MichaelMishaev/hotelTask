using System.Text;
using System.Text.Json;
using HotelBooking.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;

namespace HotelBooking.Infrastructure.Messaging;

public class RabbitMqPublisher : IEventPublisher, IDisposable
{
    private readonly IModel _channel;
    private readonly ILogger<RabbitMqPublisher> _logger;

    public RabbitMqPublisher(IConnection connection, ILogger<RabbitMqPublisher> logger)
    {
        _channel = connection.CreateModel();
        _logger = logger;

        _channel.ExchangeDeclare("hotel.events", ExchangeType.Topic, durable: true);
    }

    public Task PublishAsync<T>(string exchange, string routingKey, T message, CancellationToken ct = default)
    {
        try
        {
            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);
            var props = _channel.CreateBasicProperties();
            props.Persistent = true;
            props.ContentType = "application/json";
            props.MessageId = Guid.NewGuid().ToString();
            props.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

            _channel.BasicPublish(exchange, routingKey, props, body);
            _logger.LogInformation("Published {RoutingKey} to {Exchange}", routingKey, exchange);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "RabbitMQ publish failed for {RoutingKey}", routingKey);
        }
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _channel?.Dispose();
    }
}
