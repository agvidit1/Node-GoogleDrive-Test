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

We initialize all required libraries in our code and list the parent folder id of the Google Drive folder required to be monitored. 
Start ngrok server so that your local host is mapped to an actual domain and then you can copy the "https" hyperlink to the global variable in the code. This will be used for consistent monitoring of the serve while waiting for the 4th functionalities.


