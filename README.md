# Node-GoogleDrive-Test
Initialize the basic application on node js to test Google Drive functions and webhooks for Strac application.

## Functionalities

1. List all the files that are present in the specified folder.
2. Download all the files present in the specified parent folder.
3. List all the users along with their access controls to the folder.
4. Monitor real-time modification of user access to the folder. An event is generated which displays the list of new users and in case there is removal of access, the current list of users who have access to the file is displayed.


## How the program works

The program makes use of Google Drive API for the execution of all the mentioned functionalities.

After the setup of the Google service account, downloading all necessary API key Jsons and credentials and also giving the service account access to the target (parent) google drive folder. We downloaded the necessary packages to initialize the project.

We initialize all required libraries in our code and list the parent folder ID of the Google Drive folder required to be monitored. 
Start ngrok server so that your local host is mapped to an actual domain and then you can copy the "https" hyperlink to the global variable in the code. This will be used for consistent monitoring of the service while waiting for the 4th functionality.

The individually asynchronous functions are written which are called Google Drive APIs to complete the required functionality. Additionally, there is a function to upload files to the parent folder as an added feature. For the 4th functionality, API is written which is called from the function establishing watch (webhook) to monitor change in the folder resource. The API gets notified in case of the change and if the owner has changed it lists down all the current owners of the application. In case there is an error during any function, the error is logged causing minimal application crashes.

## How to run the program

### Step 1: Clone Repository

Navigate to the desired folder and then clone the GitHub repository to your local machine using the following command:

```
git clone https://github.com/agvidit1/Node-GoogleDrive-Test.git
```

### Step 2: Download Required Packages

Make sure you have the following dependencies installed:

- [Node.js](https://nodejs.org/en): Node.js is a JavaScript runtime that allows you to run JavaScript on the server-side. You can download and install it from the official website.
- [Ngrok](https://ngrok.com/): Ngrok is a tool that provides secure tunnels to localhost. You can download it from the official website for your specific operating system.

You should also have an integrated development environment (IDE) such as Visual Studio Code or a similar one to run the code.

### Step 3: Setting Up Google Service Account

To set up the Google Service Account, follow these steps:

- Navigate to [Google Cloud Console](https://console.cloud.google.com/).
- Create a new project or select an existing one.
- Navigate to the APIs & Services > Credentials tab.
- Click on Create credentials and select Service account key.
- Choose the service account you want to use or create a new one.
- Choose the role for the service account, typically Editor for full access.
- Select JSON as the key type and click Create. This will download the JSON file containing your credentials.
- Rename the downloaded JSON file to apikeys.json and place it in the cloned GitHub repository.

### Step 4: Grant Access to Google Drive Folder and get Parent Folder ID

- Navigate to the target Google Drive folder and give access to the Google Service Account email. Provide Editor access to the folder. 
- Additionally, copy the ID of the Google Drive folder. This is located towards the end of url.
eg. `https://drive.google.com/drive/u/0/folders/1StUsAxxxxxxxetdummy-urltocheck1M` So the id post folder/ is the ID of the parent folder.
- Open server.js file in the cloned GitHub repository. Paste the copied folder ID into the `parentFolderId` variable.

### Step 5: Run ngrok Session

- Open a terminal, run ngrok session for server.js using the following command:

```
ngrok http <port>  # Replace <port> with the port your server is running on - 3000 in our case
```


- Copy the generated ngrok redirecting link `starting with https://` and paste it in front of the `ngrokLinkListener` variable in server.js.

### Step 6: Create Destination Folder

- Create a destination folder where files will be downloaded.
- Paste the folder name in front of the `destinationDownloadFolder` variable in server.js.

### Step 7: Starting the Application
To start the application, open another terminal (other than ngrok session) and run the server using the following command:
```
node server.js
```

## Demo Video for application explanation:

https://www.loom.com/share/ab04d44bc01845539b17647b230fbbad?sid=a7377a2c-3dbe-450c-a288-5dab32b8377b

