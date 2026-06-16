# TZOUL BARBER — PRD

## Original Problem Statement
Open the GitHub project `https://github.com/pavloskwstas4-tech/tzoul-scissors.git`, set it up and run it. User wants to make edits.

## Project Overview
TZOUL BARBER is a premium barbershop booking website (Athens, Heraklion). React + FastAPI + MongoDB.

## Architecture
- **Frontend**: React 19 + CRACO + Tailwind + framer-motion + Radix UI (`/app/frontend`)
- **Backend**: FastAPI + Motor (MongoDB async) + JWT auth + Resend email stub (`/app/backend`)
- **Database**: MongoDB (DB: `tzoul_barber`)
- **Integrations**: Resend email (disabled — no key provided)

## Design System — Monochrome Apple (Option F)
- **Background**: Pure black `#000000` (hero) / white `#FFFFFF` (content)
- **Primary text**: `#1D1D1F` on light, `#FFFFFF` on dark
- **CTA**: Black button, white text
- **Font**: Outfit (display/title), Manrope (body), JetBrains Mono (labels)
- **Animations**: CSS `modal-step-fade`, scroll reveal

## Core Features (implemented & running)
- Multi-step booking modal (service → barber → date/time → personal info)
- Public APIs: services, barbers, availability, bookings, testimonials, business info
- Admin panel with JWT auth: manage bookings, services, barbers, schedules
- Booking confirmation emails via Resend (DISABLED — no API key)
- Sections: Home hero, Services, Style Finder, Gallery, Contact/Map, Book CTA, Footer

## What's Running (2026-06-16)
- Cloned from `tzoul-scissors.git`, installed all dependencies, configured .env
- Backend running on :8001, Frontend on :3000
- MongoDB DB: `tzoul_barber`

## What's NOT configured
- `RESEND_API_KEY` is empty — booking emails won't send
- Services/barbers stored in memory — reset on restart

## Prioritized Backlog
- P1: User edits (awaiting instructions)
- P1: Add real `RESEND_API_KEY` for email confirmations (user to provide)
- P2: Persist services/barbers to MongoDB
- P2: Rate limiting on booking endpoint
- P3: Expand Admin dashboard (end-to-end barber/service management)
