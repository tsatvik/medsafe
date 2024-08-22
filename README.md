# MedSafe: Your Comprehensive Medical Portal

## Description

MedSafe is a comprehensive medical portal designed to securely store an individual's entire medical history, providing a convenient and organized solution for managing medical information. The application features Optical Character Recognition (OCR) capabilities, which enable the extraction of medical information from uploaded documents such as scans, receipts, and prescriptions. This all-in-one medical portal consolidates and organizes medical records, making them easily accessible and manageable for users.

MedSafe can be seen as an application that combines secure storage, data organization, and OCR technology to create a user-friendly platform for managing personal medical information. The application's use cases include:

1. Secure storage of medical records: MedSafe ensures that users' medical histories are stored securely, protecting sensitive information from unauthorized access.
2. Organization of medical information: The platform organizes medical records, making it easy for users to find and access the information they need.
3. OCR capabilities: MedSafe's OCR technology allows users to extract medical information from uploaded documents, streamlining the process of adding new records to the system.
4. Consolidation of medical data: By bringing together various types of medical records, MedSafe creates a comprehensive and easily accessible medical history for each user.

## Table of Contents
- [Description](#description)
- [Technologies](#technologies)
- [Security Features](#security-features)
- [Installation](#installation)
- [Usage](#usage)

## Technologies

- **Backend**: Node.js, Express
- **Frontend**: React.js
- **Database**: Custom Database Connection
- **State Management**: Redux
- **HTTP Client**: Axios

## Security Features

- **JWT (JSON Web Tokens)**: Used for secure and stateless authentication.
- **bcrypt**: Utilized for secure password hashing.
- **express-validator**: For server-side input validation.
- **CORS (Cross-Origin Resource Sharing)**: To restrict unauthorized domains.
- **Winston**: For secure logging.
- **Helmet**: For setting various HTTP headers to help secure the application.
- **DOMPurify**: To sanitize and clean HTML.
- **express-rate-limit**: To limit repeated requests to public APIs and endpoints.
- **HTTPS**: SSL/TLS encryption for data in transit.
- **Crypto**: For additional data encryption and decryption.
- **Cookie Parser**: For secure cookie handling.
- **Environment Variables**: For secure storage of sensitive information.

## Installation

1. Clone the repository to your local machine.
2. Navigate to the backend directory and run `npm install` to install backend dependencies.
3. Navigate to the frontend directory and run `npm install` to install frontend dependencies.
4. Create a `.env` file in the backend directory and add your environment variables (e.g., YOUR_PORT, YOUR_SECRET_KEY).
5. Start the backend server by running `node index.js` in the backend directory.
6. Start the frontend server by running `npm start` in the frontend directory.

## Usage

1. Open your browser and navigate to `https://localhost:3001`.
2. You can sign up for a new account or log in if you already have one.
3. Once logged in, you will be redirected to the portal where you can view and manage your medical records.