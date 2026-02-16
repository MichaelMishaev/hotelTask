using HotelBooking.Notification;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSerilog();
builder.Services.AddHostedService<BookingEventConsumer>();

var host = builder.Build();
Log.Information("Notification Service starting...");
host.Run();
