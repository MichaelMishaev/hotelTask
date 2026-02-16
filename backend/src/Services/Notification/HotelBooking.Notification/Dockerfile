FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY src/Shared/HotelBooking.Shared/HotelBooking.Shared.csproj src/Shared/HotelBooking.Shared/
COPY src/Services/Notification/HotelBooking.Notification/HotelBooking.Notification.csproj src/Services/Notification/HotelBooking.Notification/
RUN dotnet restore src/Services/Notification/HotelBooking.Notification/HotelBooking.Notification.csproj
COPY . .
RUN dotnet publish src/Services/Notification/HotelBooking.Notification/HotelBooking.Notification.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HotelBooking.Notification.dll"]
