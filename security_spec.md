# Firebase Security Specification

## 1. Data Invariants
- Users can only edit their own profile (`users/{userId}` where `userId == request.auth.uid`).
- Equipment listings can be created or updated by authenticated users or owners.
- Bookings can be read or created by authenticated farmers and owners involved in the reservation.

## 2. Dirty Dozen Test Cases (Negative Validation Payloads)
1. Modifying someone else's user profile document
2. Setting fake ownerUid on equipment listings
3. Overwriting booking records without matching farmer or owner credentials
4. Setting non-string values for equipment IDs
5. Exceeding field length bounds in title strings
6. Omitting required fields on user creation
7. Setting invalid status values on bookings
8. Performing unauthorized list queries on user private fields
9. Injecting illegal characters into document path IDs
10. Spoofing authenticated UID on user creation
11. Modifying immutable fields like createdAt
12. Attempting anonymous writes when auth is strictly required
