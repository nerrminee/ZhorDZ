# Backend structure

## Overview

The backend now runs with Express and Mongoose, with routes mounted under `/api` and shared middleware for auth, validation, and error handling.

## Main folders

- `api/config` — database connection setup.
- `api/middleware` — authentication, authorization, validation, and error handling.
- `api/models` — Mongoose schemas for products, users, comments, and orders.
- `api/routes` — REST route handlers for each resource.
- `api/utils` — shared helpers such as password hashing.

## Endpoints

- `GET /api/health` — health check.
- `GET/POST /api/clients` — client registration and login.
- `GET/POST /api/products` — list and create products.
- `PUT/DELETE /api/products?id=<id>` — update or delete a product.
- `GET/POST /api/comments` — list and create comments.
- `DELETE /api/comments?id=<id>` — delete a comment.
- `GET/POST /api/orders` — list and create orders.
- `DELETE /api/orders?id=<id>` — delete an order.
- `POST /api/auth/login` — admin login.

## Environment variables

Set these in `.env`:

- `MONGODB_URI`
- `MONGODB_DB`
- `JWT_SECRET`
- `PORT`
