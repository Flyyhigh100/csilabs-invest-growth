
/**
 * Hook to handle restarting verification
 */
export const useVerificationRestart = (
  refetch: () => Promise<any>,
  setActiveTab: (tab: string) => void
) => {
  // Handler for restarting verification
  const handleRestartVerification = async () => {
    // Simply navigate back to the personal info tab
    // The user will need to fill out the information again
    refetch();
    setActiveTab('personal-info');
  };

  return { handleRestartVerification };
};
