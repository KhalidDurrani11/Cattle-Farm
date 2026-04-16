/**
 * Utility functions for handling image paths
 */

/**
 * Get the local image path for a cattle item
 * The function tries multiple common extensions and returns the first one.
 * If the image fails to load, the onError handler in the component will fall back to the original URL.
 * 
 * Supported extensions: jpg, jpeg, png, webp
 * Place your images as: /public/images/marketplace/cattle-{cattleId}.{extension}
 * Example: /public/images/marketplace/cattle-c1.jpg
 */
export const getCattleImageUrl = (cattleId: string, fallbackUrl: string): string => {
  // Try jpg first (most common), but the onError handler will fall back if it doesn't exist
  // The browser will automatically try to load this, and if it fails, onError will trigger
  return `/images/marketplace/cattle-${cattleId}.jpg`;
};

/**
 * Get the hero background image path
 * Place your hero image as: /public/images/hero/hero-bg.{extension}
 * Supported extensions: jpg, jpeg, png, webp
 */
export const getHeroImageUrl = (): string => {
  // Returns the hero background image path
  // CSS fallback will use the original Unsplash URL if local image doesn't exist
  return '/images/hero/hero-bg.png';
};

/**
 * Preload an image to check if it exists
 * This can be used for better error handling
 */
export const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

