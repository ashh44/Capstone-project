1. Project Overview
This application processes transcriptions from audio files and generates both consult letters and clinical notes. It leverages OpenAI’s API for content generation and is containerized using Docker for ease of deployment.

2. Features
Audio transcription using Deepgram API
Consult letter and clinical note generation with OpenAI API
Deployable Docker image for seamless setup and usage
AWS-hosted Docker image for easy retrieval and deployment

3. Prerequisites
Docker installed on your machine.
AWS CLI configured for access to your Docker image on AWS.
OpenAI API Key and Deepgram API Key for service integration.
Git for source control (optional, but recommended).

4. Setup Instructions
Step 1: Clone the Repository
bash
Copy code
git clone https://github.com/ashh44/Capstone-project.git
cd Capstone-project

Install Docker Desktop
Login with User Creds -  name -> capstone910 pwd -> capstone2024
Private Repo - capstone910/healthcare-workflow
To Retrieve and Run Existing images from dockerhub
Docker-Compose file has details about images(updated with latest version)
Use “docker compose pull” to pull images from docker hub
Use “docker compose up -d” to start services
Use “docker compose down” remove services 
To Create new images run below command respectively
Frontend(Dockerfile)
docker build -t capstone910/healthcare-workflow:webapp-v1.6.0 .
Backend(Dockerfileapi)
docker build -t capstone910/healthcare-workflow:api-v1.7.0 -f Dockerfileapi .
above command create the image in docker local. Navigate to docker app and select push to hub on the image to send the new image to docker hub.

Finally the application should run on http://3.106.13.250
