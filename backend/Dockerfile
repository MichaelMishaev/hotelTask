FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files first for layer caching
COPY src/Services/Booking/HotelBooking.Domain/HotelBooking.Domain.csproj src/Services/Booking/HotelBooking.Domain/
COPY src/Services/Booking/HotelBooking.Application/HotelBooking.Application.csproj src/Services/Booking/HotelBooking.Application/
COPY src/Services/Booking/HotelBooking.Infrastructure/HotelBooking.Infrastructure.csproj src/Services/Booking/HotelBooking.Infrastructure/
COPY src/Services/Booking/HotelBooking.Api/HotelBooking.Api.csproj src/Services/Booking/HotelBooking.Api/
COPY src/Shared/HotelBooking.Shared/HotelBooking.Shared.csproj src/Shared/HotelBooking.Shared/
RUN dotnet restore src/Services/Booking/HotelBooking.Api/HotelBooking.Api.csproj

# Copy everything else and build
COPY . .
RUN dotnet publish src/Services/Booking/HotelBooking.Api/HotelBooking.Api.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "HotelBooking.Api.dll"]
