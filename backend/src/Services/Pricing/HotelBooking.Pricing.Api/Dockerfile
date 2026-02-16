FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5001

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY src/Services/Pricing/HotelBooking.Pricing.Api/HotelBooking.Pricing.Api.csproj src/Services/Pricing/HotelBooking.Pricing.Api/
RUN dotnet restore src/Services/Pricing/HotelBooking.Pricing.Api/HotelBooking.Pricing.Api.csproj
COPY . .
RUN dotnet publish src/Services/Pricing/HotelBooking.Pricing.Api/HotelBooking.Pricing.Api.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5001
ENTRYPOINT ["dotnet", "HotelBooking.Pricing.Api.dll"]
