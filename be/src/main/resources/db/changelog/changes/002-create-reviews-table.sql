-- liquibase formatted sql

-- changeset devduong:2
-- comment: Create reviews table and update courts table with rating fields
CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    court_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_review_court FOREIGN KEY (court_id) REFERENCES courts(id)
);

ALTER TABLE courts ADD COLUMN average_rating DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE courts ADD COLUMN total_reviews INTEGER DEFAULT 0;
