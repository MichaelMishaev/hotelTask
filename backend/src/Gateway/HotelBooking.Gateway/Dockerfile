FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5010

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY src/Gateway/HotelBooking.Gateway/HotelBooking.Gateway.csproj src/Gateway/HotelBooking.Gateway/
RUN dotnet restore src/Gateway/HotelBooking.Gateway/HotelBooking.Gateway.csproj
COPY . .
RUN dotnet publish src/Gateway/HotelBooking.Gateway/HotelBooking.Gateway.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5010
ENTRYPOINT ["dotnet", "HotelBooking.Gateway.dll"]
