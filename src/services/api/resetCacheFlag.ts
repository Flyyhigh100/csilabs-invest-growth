
/**
 * This file exists to remind you to reset the FORCE_REFRESH_CACHE flag after successful testing.
 * 
 * To reset the flag:
 * 1. Open src/services/api/config.ts
 * 2. Change FORCE_REFRESH_CACHE from true to false
 * 
 * Do this after verifying that the token price is fetching correctly from the new pool.
 * Keeping this flag as true will prevent the system from using cached prices, which may
 * lead to more API calls than necessary.
 */

export const remindToResetCacheFlag = () => {
  console.warn(
    'REMINDER: Set FORCE_REFRESH_CACHE to false in config.ts after successful testing.'
  );
};

// Run the reminder when this file is imported
remindToResetCacheFlag();
