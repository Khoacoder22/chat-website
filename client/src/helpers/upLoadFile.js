const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`;

console.log('result', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME)
const upLoadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', "chat-app-file"); // Correct the key to 'upload_preset'

    const response = await fetch(url, {
        method: 'POST', // Add method
        body: formData, // Pass form data
    });

    const responseData = await response.json();

    return responseData;
};

export default upLoadFile