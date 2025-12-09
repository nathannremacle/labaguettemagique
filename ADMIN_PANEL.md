# Admin Panel Documentation

## Overview

The admin panel provides a secure interface for managing menu items, categories, prices, and other content on the website.

## Access

- **URL**: `/admin/login`
- **Default Credentials**:
  - Username: `admin`
  - Password: `changeme123`

⚠️ **IMPORTANT**: Change the default password in production by setting the `ADMIN_PASSWORD` environment variable.

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
- Menu data is stored in `/data/menu.json`
- Changes are persisted immediately
- The file is automatically created on first use

## Environment Variables

Create a `.env.local` file with:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

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

1. **Change default credentials** before deploying to production
2. **Use strong JWT_SECRET** - generate a random string
3. **Enable HTTPS** in production for secure cookie transmission
4. **Consider rate limiting** for login attempts
5. **Backup menu data** regularly (the `/data` folder)

## Troubleshooting

### Can't log in
- Check that environment variables are set correctly
- Verify the password matches `ADMIN_PASSWORD` or default `changeme123`
- Check browser console for errors

### Changes not saving
- Verify you're authenticated (check `/api/auth/verify`)
- Check that the `/data` directory is writable
- Check server logs for errors

### Menu not loading
- Ensure `/data/menu.json` exists
- Check file permissions
- Verify the file contains valid JSON

