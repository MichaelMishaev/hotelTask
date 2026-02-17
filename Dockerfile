# =============================================================
# Stage 1: Build .NET Backend
# =============================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

# Copy csproj files first for layer caching
COPY backend/src/Services/Booking/HotelBooking.Domain/HotelBooking.Domain.csproj src/Services/Booking/HotelBooking.Domain/
COPY backend/src/Services/Booking/HotelBooking.Application/HotelBooking.Application.csproj src/Services/Booking/HotelBooking.Application/
COPY backend/src/Services/Booking/HotelBooking.Infrastructure/HotelBooking.Infrastructure.csproj src/Services/Booking/HotelBooking.Infrastructure/
COPY backend/src/Services/Booking/HotelBooking.Api/HotelBooking.Api.csproj src/Services/Booking/HotelBooking.Api/
COPY backend/src/Shared/HotelBooking.Shared/HotelBooking.Shared.csproj src/Shared/HotelBooking.Shared/
RUN dotnet restore src/Services/Booking/HotelBooking.Api/HotelBooking.Api.csproj

# Copy everything else and build
COPY backend/ .
RUN dotnet publish src/Services/Booking/HotelBooking.Api/HotelBooking.Api.csproj -c Release -o /app/publish --no-restore

# =============================================================
# Stage 2: Build React Frontend
# =============================================================
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
ENV VITE_API_URL=/api
RUN npm run build

# =============================================================
# Stage 3: Combined Runtime (nginx + .NET)
# =============================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Install nginx and supervisor
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx supervisor && \
    rm -rf /var/lib/apt/lists/*

# Copy .NET backend
WORKDIR /app
COPY --from=backend-build /app/publish .

# Copy React frontend static files
COPY --from=frontend-build /app/dist /var/www/html

# Copy config files (template stored outside nginx dirs to avoid auto-loading)
COPY deploy/nginx.conf /app/nginx.conf.template
COPY deploy/supervisord.conf /etc/supervisor/conf.d/app.conf
COPY deploy/start.sh /app/start.sh
RUN chmod +x /app/start.sh && \
    rm -f /etc/nginx/sites-enabled/default && \
    rm -f /etc/nginx/sites-available/default

# Backend listens on 3001 internally; nginx proxies to it
# nginx claims both PORT (5000) and 8080 to handle all Railway routing
ENV ASPNETCORE_URLS=http://+:3001
EXPOSE 80

CMD ["/app/start.sh"]
