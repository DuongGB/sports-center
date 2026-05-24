-- liquibase formatted sql
-- changeset duong:9
ALTER TABLE booking_guests ALTER COLUMN email DROP NOT NULL;
