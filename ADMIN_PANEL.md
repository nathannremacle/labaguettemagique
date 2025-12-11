# Admin Panel Documentation

## Overview

The admin panel provides a secure interface for managing menu items, categories, prices, and other content on the website.

## Access

- **URL**: `/admin/login`
- **Credentials**: Set via environment variables (see below)

⚠️ **IMPORTANT**: You MUST set `JWT_SECRET` and `ADMIN_PASSWORD_HASH` environment variables. There are no default credentials for security.

## Features

### Authentication
- Secure JWT-based authentication
- Session management with HTTP-only cookies
- Automatic logout after 24 hours

### Menu Management
- **View all menu categories and items**
- **Edit items**: Click the edit button on any menu item to modify:
  - Name
  - Description
  - Price
- **Add new items**: Use the "Add New Item" form in each category
- **Delete items**: Click the delete button (with confirmation)
- **Add new categories**: Use the "Add New Category" form at the top

### Data Storage
- Menu data is stored in SQLite database at `/data/menu.db`
- Changes are persisted immediately
- The file is automatically created on first use

## Environment Variables

Create a `.env.local` file with the required variables. See `.env.example` for a template.

### Required Variables

- **JWT_SECRET**: A strong random string for signing JWT tokens. Generate with: `openssl rand -base64 32`
- **ADMIN_PASSWORD_HASH**: A bcrypt hash of your admin password. Generate with:
  ```bash
  node -e "require('bcryptjs').hash('your-password', 10).then(console.log)"
  ```

### Optional Variables

- **ADMIN_USERNAME**: Admin username (defaults to "admin" if not set)
- **NODE_ENV**: Set to "production" for production deployments

### Security Notes

- **Never use plain text passwords** - always use bcrypt hashes
- **Use strong JWT_SECRET** - at least 32 random characters
- **Never commit `.env.local`** to version control
- **Rotate secrets regularly** in production

## API Endpoints

All API endpoints require authentication via JWT token in cookies.

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify authentication
- `GET /api/menu` - Get all menu data
- `PUT /api/menu` - Update entire menu
- `GET /api/menu/categories` - Get all categories
- `POST /api/menu/categories` - Create new category
- `GET /api/menu/categories/[id]` - Get category by ID
- `PUT /api/menu/categories/[id]` - Update category
- `DELETE /api/menu/categories/[id]` - Delete category
- `POST /api/menu/categories/[id]/items` - Add item to category
- `PUT /api/menu/categories/[id]/items/[index]` - Update item
- `DELETE /api/menu/categories/[id]/items/[index]` - Delete item

## Security Notes

1. **Required environment variables** - `JWT_SECRET` and `ADMIN_PASSWORD_HASH` must be set
2. **Use strong JWT_SECRET** - generate with `openssl rand -base64 32`
3. **Use bcrypt hashes only** - never store plain text passwords
4. **Enable HTTPS** in production for secure cookie transmission
5. **Consider rate limiting** for login attempts (see TODO in login route)
6. **Backup database regularly** - backup the `/data/menu.db` file
7. **Input validation** - all API endpoints validate and sanitize inputs
8. **SQL injection protection** - all queries use prepared statements

## Troubleshooting

### Can't log in
- Verify `JWT_SECRET` and `ADMIN_PASSWORD_HASH` are set in `.env.local`
- Check that `ADMIN_PASSWORD_HASH` is a valid bcrypt hash
- Verify the password you're using matches the hash
- Check browser console and server logs for errors
- Ensure the application was restarted after setting environment variables

### Changes not saving
- Verify you're authenticated (check `/api/auth/verify`)
- Check that the `/data` directory is writable
- Check server logs for errors
- Verify database file permissions

### Menu not loading
- Ensure `/data/menu.db` exists (created automatically on first run)
- Check database file permissions
- Verify the database schema is initialized correctly
- Check server logs for database errors

### Environment variable errors
- Ensure `.env.local` file exists in the project root
- Verify all required variables are set (no empty values)
- Restart the development server after changing environment variables
- Check that variable names match exactly (case-sensitive)

