const express = require('express');
const bodyParser = require('body-parser');
const readline = require('readline');

const app = express();
const fs = require('fs');
const { google }= require('googleapis');
const port = process.env.PORT || 3000;
const uuid = require('uuid'); 

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

const apikeys = require('./apikeys.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];
const parentFolderId = '1StUsAeN6ZhhCyetA5iGu-EkToUD1yKRM';
const vers = 'v3';
const ngrokLinkListener = `https://4313-52-124-42-52.ngrok-free.app/notification-handler`;
const destinationDownloadFolder = 'dd_folder';

// A Function that can provide access to google drive api
async function authorize(){
    const jwtClient = new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
    );

    await jwtClient.authorize();

    return jwtClient;
}

async function listFilesInFolder(folderId, authClient) {
    const drive = google.drive({ version: vers, auth: authClient });
    try {
        const res = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name)',
        });
        const files = res.data.files;
        if (files.length) {
            console.log('Files:');
            files.forEach(file => {
                console.log(`${file.name} (${file.id})`);
            });
            return files;
        } else {
            console.log('No files found in the folder.');
            return [];
        }
    } catch (error) {
        console.error('Error listing files:', error);
        throw error;
    }
}

async function downloadFile(fileId, destinationPath, authClient) {
    const drive = google.drive({ version: vers, auth: authClient });
    const dest = fs.createWriteStream(destinationPath);
    try {
        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        await new Promise((resolve, reject) => {
            response.data
                .on('end', () => {
                    console.log(`File ${fileId} downloaded to ${destinationPath}`);
                    resolve();
                })
                .on('error', err => {
                    console.error('Error downloading file:', err);
                    reject(err);
                })
                .pipe(dest);
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
}

async function downloadAllFilesInFolder(folderId, destinationFolder, authClient) {
    try {
        const files = await listFilesInFolder(folderId, authClient);
        if (files && files.length > 0) {
            for (const file of files) {
                await downloadFile(file.id, `${destinationFolder}/${file.name}`, authClient);
            }
            console.log('All files downloaded successfully.');
        } else {
            console.log('No files found in the folder.');
        }
    } catch (error) {
        console.error('Error downloading files:', error);
        throw error;
    }
}

// A Function that will upload the desired file to google drive folder
async function uploadFile(authClient){
    return new Promise((resolve,rejected)=>{
        const drive = google.drive({version:'v3',auth:authClient}); 

        var fileMetaData = {
            name:'test.txt',  //display name  
            parents:[parentFolderId]
        }

        drive.files.create({
            resource:fileMetaData,
            media:{
                 // files that will get uploaded
                body: fs.createReadStream('test.txt'),
                mimeType:'text/plain'
            },
            fields:'id'
        },function(error,file){
            if(error){
                return rejected(error)
            }
            resolve(file);
        })
    });
}

async function listUsersWithAccessToFile(fileId) {

    const authClient = await authorize();
    const drive = google.drive({ version: vers, auth: authClient });
    try {
        const res = await drive.permissions.list({
            fileId: fileId,
            fields: 'permissions(emailAddress, role)',
        });
        const permissions = res.data.permissions;
        if (permissions.length) {
            console.log('Users with access to the file:');
            permissions.forEach(permission => {
                console.log(`${permission.emailAddress} - ${permission.role}`);
            });
            return permissions.map(obj => obj.emailAddress);;
        } else {
            console.log('No users found with access to the file.');
            return [];
        }
    } catch (error) {
        console.error('Error listing users with access:', error);
        throw error;
    }
}

let prevUsers = [];
let isProcessingNotification = false;

// Set up webhook endpoint to receive notifications
app.post('/notification-handler', async (req, res) => {
    console.log('Received notification:', req.body);

    if (isProcessingNotification) {
        return res.status(200).send('Already processing notification');
    }
    isProcessingNotification = true;
    let currUsers=[];
    
    try {
        currUsers = await listUsersWithAccessToFile(parentFolderId);
        console.log('Current users:', currUsers);

        const addedUsers = currUsers.filter(user => !prevUsers.includes(user));
        const removedUsers = prevUsers.filter(user => !currUsers.includes(user));

        if (addedUsers.length > 0) {
            console.log('New owners added:', addedUsers);
        }
        
        if (removedUsers.length > 0) {
            console.log('Owners removed:', removedUsers);
        }
        
        prevUsers = prevUsers;

        res.status(200).send('Notification received');
    } 
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing notification');
    }
    finally {
        isProcessingNotification = false;
    }
});

async function setUpNotificationChannel(authClient) {
    const drive = google.drive({ version: 'v3', auth: authClient });
    const channelId = uuid.v4();
    const channel = {
        id: channelId,
        type: 'web_hook',
        address: ngrokLinkListener,
    };
    const res = await drive.files.watch({
        fileId: parentFolderId,
        resource: channel,
    });
    console.log('Notification channel set up:', res.data);
}

// function displayOptions() {
//     console.log('Options:');
//     console.log('1. Function to list all files in Folder');
//     console.log('2. Function to download all file in the folder');
//     console.log('3. Function to list all users with access to the folder.');
//     console.log('4. Function to  upload any file.');
//     console.log('5. Function to get real-time notification in case of change in user.');
//     console.log('9. Exit');
// }

// async function performAction(option) {
//     switch (option) {
//         case '1':
//             try {
//                 files = await listFilesInFolder(parentFolderId, authClient);
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//             break;
//         case '2':
//             try {
//                 await downloadAllFilesInFolder(parentFolderId, destinationDownloadFolder, authClient);
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//             break;
//         case '3':
//             try {
//                 await listUsersWithAccessToFile(parentFolderId);
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//             break;
//         case '4':
//             try {
//                 await listUsersWithAccessToFile(parentFolderId);
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//             break;
//         case '5':
//             try {
//                 await listUsersWithAccessToFile(parentFolderId);
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//             break;
//         case '9':
//             console.log('Exiting...');
//             rl.close();
//             process.exit(0);
//         default:
//             console.log('Invalid option. Please try again.');
//             break;
//     }
// }

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

async function main() {
    const authClient = await authorize(); 

    // while (true) {
    //     displayOptions();
    //     rl.question('Enter your choice: ', (option) => {
    //         performAction(option);
    //     });
    // }

    // Function to list all files in Folder
    try {
        files = await listFilesInFolder(parentFolderId, authClient);
    } catch (error) {
        console.error('Error:', error);
    }

    // Function to download all file in the folder
    try {
        await downloadAllFilesInFolder(parentFolderId, destinationDownloadFolder, authClient);
    } catch (error) {
        console.error('Error:', error);
    }

    // Function to list all users with access to the folder.
    try {
        await listUsersWithAccessToFile(parentFolderId);
    } catch (error) {
        console.error('Error:', error);
    }

    // Function to  upload any file.
    try {
        authorize().then(uploadFile).catch("error",console.error());
    } catch (error) {
        console.error('Error:', error);
    }

    // Setting up notification channel which will log if there are any realtime changes in users.
    setUpNotificationChannel(authClient)
    .catch(error => {
        console.error('Error setting up notification channel:', error);
    });

}

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    main();
});

