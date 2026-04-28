# 🚀 CRUD Docker Laravel 12 + Angular 19

Complete CRUD application with Laravel 12 API (JWT), Angular 19 front-end and MySQL under Docker.

## ✨ What's New in v2.0

- **Laravel 12** with JWT API (migrated from Laravel 10)
- **PHP 8.4** (upgraded from PHP 8.1)
- **Angular 19 (Standalone)**: Independent front-end application.
- **Angular 19 (Blade-integrated)**: Hybrid integration via **Vite** inside `app.blade.php`.
- **Pest**: Modern automated testing suite.
- **Swagger/OpenAPI**: Interactive API documentation.
- **MySQL 8.0**: Optimized database.
- **Complete Docker architecture**: Ready-to-use Apache/MySQL/Redis environment.
- **Filament v4**: Elegant administration panel (Modern alternative to Laravel Nova).
- **Redis Cache**: Performance optimization with automatic caching via **Observers**.
- **GitHub Actions CI/CD**: Automated pipeline testing both Backend (Pest) and Frontend (Angular) using MySQL & Redis services.
- **Laravel Octane (Swoole)** : High-performance server integration to keep the application in RAM, delivering near-instantaneous response times by bypassing disk I/O.
- **Laravel Pulse** : Real-time performance monitoring dashboard to track system health, slow queries, and cache usage at a glance.
- **CORS** : Optimized Cross-Origin Resource Sharing management for secure communication between Laravel backend and Angular frontend.
- **Promotions**: Add of a promotion system (coupon, global, material) on the prices of materials.
- **PDF Invoice Generation (Groq AI)** : PDF invoice creation and download system, structured and optimized by Groq AI.

## 📋 Tech Stack

**Back-end:**
- Laravel 12 with REST API, Laravel Pulse/Octane/Filament/Cors
- PHP 8.4
- JWT Authentication
- Testing with Pest
- Swagger/OpenAPI Documentation
- Redis

**Front-end:**
- Angular 19
- JWT Authentication (login/register)

**Infrastructure:**
- Docker & Docker Compose
- Apache
- MySQL 8.0
- phpMyAdmin
- Redis

## 🔧 Prerequisites

- Docker
- Docker Compose

## 📦 Installation

1. **Clone and prepare the project:**
```bash
git clone https://github.com/ghyslain12/laravel-docker-apache-angular.git
sudo chmod -R 777 laravel-docker-apache-angular/
cd laravel-docker-apache-angular
```

2. **Build and start containers:**
```bash
docker-compose up --build -d
```

3. **Install Laravel dependencies:**
```bash
docker exec -it laravel_app sh -c "composer install"
# or (at the root of the project)
docker compose run --rm app composer install
```

4. **Environment configuration:**
```bash
docker exec -it laravel_app sh -c "cp .env.example .env"
docker exec -it laravel_app sh -c "php artisan key:generate"
docker exec -it laravel_app sh -c "php artisan migrate"
```

## 🎮 Docker Usage

**Start services:**
```bash
docker-compose up
# or in detached mode
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

## 🌐 Available Services

| Service            | URL                                     | Description                     |
|--------------------|-----------------------------------------|---------------------------------|
| **Angular**        | http://localhost:4200                   | User interface                  |
| **Laravel API**    | http://localhost:8741/api               | REST API                        |
| **Swagger**        | http://localhost:8741/api/documentation | Interactive API documentation   |
| **phpMyAdmin**     | http://localhost:8080                   | Database management             |
| **Redis**          | http://localhost:6379                   | High-performance caching server |
| **Filament Admin** | http://localhost:8741/admin             | Administration panel            |
| **Laravel Pulse**  | http://localhost:8741/pulse             | Pulse dashboard                 |

## 🔐 JWT Authentication

### Configuration

Enable/disable JWT in `.env` file:
```env
# Enable JWT
JWT_ENABLE=true

# Disable JWT
JWT_ENABLE=false
```

### Authentication Endpoints

![POST](https://img.shields.io/badge/POST-%23ff9800?style=flat-square&logo=git&logoColor=white) **`/api/login`** - Authentication and token generation

![POST](https://img.shields.io/badge/POST-%23ff9800?style=flat-square&logo=git&logoColor=white) **`/api/register`** - Register new user

![POST](https://img.shields.io/badge/POST-%23ff9800?style=flat-square&logo=git&logoColor=white) **`/api/logout`** - Logout and token invalidation

![GET](https://img.shields.io/badge/GET-%2300c853?style=flat-square&logo=git&logoColor=white) **`/api/me`** - Get authenticated user

## 📡 API Endpoints

### Users

![POST](https://img.shields.io/badge/POST-%23ff9800?style=flat-square) **`/api/utilisateur`** - Create a user

![GET](https://img.shields.io/badge/GET-%2300c853?style=flat-square) **`/api/utilisateur`** - List all users

![GET](https://img.shields.io/badge/GET-%2300c853?style=flat-square) **`/api/utilisateur/{id}`** - Get a user

![PUT](https://img.shields.io/badge/PUT-%23009688?style=flat-square) **`/api/utilisateur/{id}`** - Update a user

![DELETE](https://img.shields.io/badge/DELETE-%23f44336?style=flat-square) **`/api/utilisateur/{id}`** - Delete a user

### Other available resources
- Clients
- Materials
- Tickets
- Sales

> 📖 **Complete documentation**: [Swagger UI](http://localhost:8741/api/documentation)

## 🧪 Testing

Run tests with Pest:
```bash
docker exec -it laravel_app sh -c "php artisan test"
```

## 🛠️ Useful Commands

```bash
# Access Laravel container
docker exec -it laravel_app sh

# Run migrations
docker exec -it laravel_app sh -c "php artisan migrate"

# Create a controller
docker exec -it laravel_app sh -c "php artisan make:controller ControllerName"

# Clear cache
docker exec -it laravel_app sh -c "php artisan cache:clear"

# Generate Swagger documentation
docker exec -it laravel_app sh -c "php artisan l5-swagger:generate"
```

## 📸 Screenshots

![Angular Interface](ressources/preview-angular.png)
*Main application interface*

![Login](ressources/login.png)
*Login screen with JWT*

![Promotions](ressources/promotions.png)
*Promotions screen list*

![Sale](ressources/bill_pdf.png)
*Sale screen detail + PDF invoice*

![Swagger Documentation](ressources/swagger.png)
*Interactive API documentation*

![Valid JWT](ressources/jwt_ok.png)
*Successful authentication*

![Invalid JWT](ressources/jwt_nok.png)
*Expired or invalid token*

![Filament Admin](ressources/filament.png)
*Administration panel*

![Pulse Dashboard](ressources/pulse.png)
*Pulse Dashboard*

## 🐛 Troubleshooting

**Folder vendor backend missing issues:**
```bash
docker compose run --rm app composer install
docker exec -it laravel_app composer dump-autoload
```

**Permission issues:**
```bash
sudo chmod -R 777 project/storage project/bootstrap/cache
```

**Reinstall dependencies:**
```bash
docker exec -it laravel_app sh -c "composer install --no-cache"
# or (at the root of the project)
docker compose run --rm app composer install
```

**Rebuild containers:**
```bash
docker-compose down -v
docker-compose up --build -d
```

**Display problems (Vite):**
```bash
# /project
npm install --legacy-peer-deps
npm run build
```

## 📝 Migration Notes (v1.0 → v2.0)

- **PHP 8.1 → 8.4**: Check package compatibility
- **Laravel 10 → 12**: New features and performance improvements
- **Angular 19**: Support for latest standalone components features
