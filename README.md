# BBallStats – Basketball Stats (Angular + Spring Boot)

Aplikacija za pregled košarkaških timova, igrača, utakmica, box score-ova i naprednih metrika (TS%, eFG%, USG%, pace, of/def rating, itd.).  
Frontend: **Angular**. Backend: **Spring Boot + JPA**. Baza: **PostgreSQL/MySQL** (po izboru).

## Sadržaj
- [Funkcionalnosti](#funkcionalnosti)
- [Tehnologije](#tehnologije)
- [Setup (dev)](#setup-dev)
- [Seeding podataka](#seeding-podataka)
- [Čišćenje baze](#čišćenje-baze)
- [Struktura podataka / CSV formati](#struktura-podataka--csv-formati)
- [Korisni saveti](#korisni-saveti)

## Funkcionalnosti
- **Teams / Players** – pregledi, detalji, slike (assets po ID-u).
- **Games** – lista sa filtriranjem po sezoni, detalj utakmice (Game Metrics + link u Box Scores).
- **Box Scores** – CRUD, filtriranje (All/Home/Away, search), totals po timu, **CSV export**.
- **Metrics** – Leaderboards (Top N), **Compare Players** (po sezoni).
- Autentikacija (login/register), autorizacija (admin akcije za box score CRUD).

## Tehnologije
- Frontend: Angular 17+, RxJS, SCSS.
- Backend: Spring Boot 3+, Spring Web, Spring Data JPA, Lombok.
- DB: PostgreSQL ili MySQL.
- Build: Maven.

## Setup (dev)

### Backend
1. Konfiguriši bazu u `application.properties` ili `application.yml`.
2. Pokreni:
   ```bash
   ./mvnw spring-boot:run
