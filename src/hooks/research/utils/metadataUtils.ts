
/**
 * Utility functions for parsing and handling document metadata
 */

// Helper function to extract actual filename without params
export const getBaseFilename = (fullName: string): string => {
  return fullName.split('?')[0];
};

// Parse metadata from file name with URL parameters
export const parseFileMetadata = (fileName: string, baseFileName: string) => {
  // Default values (use filename as title if nothing else available)
  let title = baseFileName
    .split('.')[0]
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/^\d+\s*/, ''); // Remove any leading numbers and timestamp
        
  let category = "Research";
  let publishDate = new Date().toLocaleDateString();
  let authors = "";
  let description = "";
  let type = "pdf";
  let videoUrl = "";
  let thumbnailUrl = "";
  
  // Parse file name for metadata with URL parameters
  const fileNameParts = fileName.split('?');
  if (fileNameParts.length > 1) {
    try {
      const params = new URLSearchParams(fileNameParts[1]);
      title = params.get('title') || title;
      category = params.get('category') || category;
      description = params.get('description') || description;
      publishDate = params.get('publishDate') || publishDate;
      authors = params.get('authors') || authors;
      type = (params.get('type') === 'video') ? 'video' : 'pdf';
      videoUrl = params.get('videoUrl') || "";
      thumbnailUrl = params.get('thumbnailUrl') || "";
    } catch (e) {
      console.log("Could not parse metadata from filename");
    }
  }
  
  return { title, category, description, publishDate, authors, type, videoUrl, thumbnailUrl };
};
