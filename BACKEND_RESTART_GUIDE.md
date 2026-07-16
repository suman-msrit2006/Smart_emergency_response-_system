# Backend Restart Guide - Enhanced Logging

## I've added detailed error logging to catch the emergency request creation issue.

### Steps:

1. **Stop the current backend server** (Ctrl+C in the terminal where it's running)

2. **Start it again**:
   ```bash
   cd server
   npm start
   ```

3. **Try creating an emergency request from the frontend**

4. **Check the backend terminal** - You will see detailed logs like:
   ```
   === CREATE EMERGENCY REQUEST START ===
   Patient ID: ...
   Request Data: {...}
   Validating coordinates: ...
   Creating emergency request with data: ...
   ```

5. **If there's an error, you'll see**:
   ```
   === CREATE EMERGENCY REQUEST FAILED ===
   Error type: ...
   Error message: ...
   Validation errors: ...
   ```

6. **Share the exact error message** from the backend terminal with me

---

This will help us identify the exact root cause of the "Failed to create emergency request" error.
