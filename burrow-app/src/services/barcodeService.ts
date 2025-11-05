/**
 * Service for looking up product information from barcodes
 * Uses Open Food Facts API (free tier)
 */

export interface BarcodeProduct {
  name: string;
  category?: string;
  imageUrl?: string;
  brand?: string;
}

export const lookupBarcode = async (barcode: string): Promise<BarcodeProduct | null> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v3/product/${barcode}.json`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status === 0 || !data.product) {
      return null;
    }

    const product = data.product;

    return {
      name: product.product_name || product.product_name_en || 'Unknown Product',
      category: product.categories || undefined,
      imageUrl: product.image_url || undefined,
      brand: product.brands || undefined,
    };
  } catch (error) {
    console.error('Error looking up barcode:', error);
    return null;
  }
};

/**
 * Validate if a string is a valid barcode format
 */
export const isValidBarcode = (barcode: string): boolean => {
  // Check for common barcode formats: UPC, EAN, etc.
  const barcodeRegex = /^[0-9]{8,14}$/;
  return barcodeRegex.test(barcode);
};
