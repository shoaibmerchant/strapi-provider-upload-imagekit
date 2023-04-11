/* global strapi */

const ImageKit = require('imagekit');
// const path = require('path');

module.exports = {
    init: config => {
        const uploadFolder = config.params?.folder || '/';

        const imagekitProvider = new ImageKit({
            publicKey: config.publicKey,
            privateKey: config.privateKey,
            urlEndpoint: config.urlEndpoint,
        });

        return {
            upload: file => {
                return new Promise((resolve, reject) => {
                    imagekitProvider.upload({
                        file : file.buffer,
                        fileName : file.hash + file.ext,
                        folder: uploadFolder,
                        useUniqueFileName: false,
                    }).then(response => {
                        // const filepath = path.resolve(uploadFolder, file.hash+file.ext);
                        // Generate url using the url endpoint
                        const imageUrl = imagekitProvider.url({
                            path : response.filePath,
                        });
                        const { fileId, url } = response;
                        file.url = imageUrl;
                        file.provider_metadata = {
                            fileId: fileId,
                        };
                        strapi.log.info(`File uploaded. ID:${fileId}`);
                        return resolve();
                    }).catch(error => {
                        strapi.log.error(`Unable to upload file.`);
                        return reject(error);
                    });
                });
            },
            delete: file => {
                return new Promise((resolve, reject) => {
                    const { fileId } = file.provider_metadata;
                    imagekitProvider.deleteFile(fileId).then(response => {
                        strapi.log.info(`File deleted. ID:${fileId}`);
                        return resolve();
                    }).catch(error => {
                        strapi.log.error(`Unable to delete file.`);
                        return reject(error);
                    });
                });
            },
        };
    },
};
