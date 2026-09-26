-- Fails without rewriting rows if legacy zero-length bookings exist; review them first.
-- Existing weaker date constraints can coexist with this strictly stronger condition.
ALTER TABLE bookings
  ADD CONSTRAINT chk_bookings_positive_duration CHECK (start_date < end_date),
  DROP FOREIGN KEY fk_bookings_listing,
  DROP FOREIGN KEY fk_bookings_renter,
  DROP FOREIGN KEY fk_bookings_owner,
  ADD CONSTRAINT fk_bookings_listing_retained FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT fk_bookings_renter_retained FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT fk_bookings_owner_retained FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;
