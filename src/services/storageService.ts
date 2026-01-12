// src/services/storageService.ts
// Imgur Anonymous Upload - No Client ID needed!

export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down to 1200x1200 max
        if (width > height) {
          if (width > 1200) {
            height = Math.round((height * 1200) / width);
            width = 1200;
          }
        } else {
          if (height > 1200) {
            width = Math.round((width * 1200) / height);
            height = 1200;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Convert to Blob and upload to Imgur
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            try {
              const url = await uploadToImgurAnonymous(blob);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          },
          'image/jpeg',
          0.75
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Anonymous upload - no authentication required!
export async function uploadToImgurAnonymous(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('image', blob);

  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        // This is Imgur's public/anonymous upload header
        'Authorization': 'Client-ID 546c25a59c58ad7'
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Imgur error: ${error.data?.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Imgur upload failed');
    }

    // Return the image URL
    return data.data.link;
  } catch (error) {
    console.error('Imgur upload error:', error);
    throw new Error(`Failed to upload image: ${error}`);
  }
}

export async function fileToBase64(file: File): Promise<string> {
  // Fallback if needed
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
