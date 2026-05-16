-- liquibase formatted sql
-- changeset duong:6
ALTER TABLE reviews ADD COLUMN is_hide BOOLEAN DEFAULT FALSE;
