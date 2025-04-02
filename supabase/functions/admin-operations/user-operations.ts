
export const userOperations = {
  async getUserDetails({ userId }, adminClient) {
    const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
    
    if (getUserError) {
      throw getUserError;
    }
    
    return { user: userData };
  }
};
