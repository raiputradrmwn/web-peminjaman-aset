# FROM php:8.3-apache

# # Install dependensi sistem
# RUN apt-get update && apt-get install -y \
#     libpq-dev \
#     zip unzip \
#     git \
#     curl \
#     && docker-php-ext-install pdo_pgsql pgsql

# # Install Composer
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# # Set working directory
# WORKDIR /var/www/html

# # Copy semua file Laravel ke dalam container
# COPY . .

# # Beri permission
# RUN chown -R www-data:www-data /var/www/html

FROM php:8.3-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip unzip \
    git \
    curl \
    && docker-php-ext-install pdo_pgsql pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www

# Copy Laravel project
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www

# Copy Apache config
COPY apache.conf /etc/apache2/sites-available/000-default.conf
