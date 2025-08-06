export const extractFileNameFromCloudinaryUrl = (url) => {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return fileName.split('.')[0];
};