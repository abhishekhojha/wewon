export const getInvoiceFilename = (
  contentDisposition: string | undefined,
  fallbackName: string,
) => {
  if (!contentDisposition) return fallbackName;

  const filenameMatch =
    /filename\*=UTF-8''([^;]+)|filename=["']?([^"';]+)["']?/i.exec(
      contentDisposition,
    );

  const encodedFilename = filenameMatch?.[1];
  const plainFilename = filenameMatch?.[2];
  let filename = plainFilename;

  if (encodedFilename) {
    try {
      filename = decodeURIComponent(encodedFilename);
    } catch {
      filename = encodedFilename;
    }
  }

  return filename?.trim() || fallbackName;
};

export const downloadBlobAsFile = (blobData: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blobData);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const resolveApiErrorMessage = async (
  error: any,
  fallbackMessage: string,
): Promise<string> => {
  const responseData = error?.response?.data;

  if (typeof responseData?.message === "string" && responseData.message) {
    return responseData.message;
  }

  if (responseData instanceof Blob) {
    try {
      const text = await responseData.text();
      if (!text) return fallbackMessage;

      const parsed = JSON.parse(text);
      if (typeof parsed?.message === "string" && parsed.message) {
        return parsed.message;
      }
    } catch {
      // Ignore blob parsing issues and return fallback message.
    }
  }

  if (typeof error?.message === "string" && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
