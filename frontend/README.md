# React Ant Design Frontend

## Prerequisites

- Node.js (v22.x)
- npm (v8 or above)

## Setup

1. Clone the repository:
```bash
git clone http://10.0.0.201/ldhan2110999/react-antd.git

cd react-antd
```
2. Install dependencies:
```bash
yarn install
```
## Environment Variables
Ensure your environment variables are set up correctly. You can create a `.env` file in the
root of your project to define environment variables. For example:
```
VITE_PORT=4000 #port to start the application
VITE_API_URL=http://localhost:8080/api #backend url
```
## Running the Application
To start the development server, run:
```bash
yarn dev
```
This will start the application on `http://localhost:4000`.
## Building the Application
To build the application for production, run:
```bash
yarn build
```
This will create a `build` directory with the production-ready files.
## Accessing the Application
Once the application is running, you can access it at:
```
http://localhost:4000
```
This will allow your React application to communicate with the backend API.
## Proxy Configuration
If your backend API is running on a different port (e.g., 8080), you
can set up a proxy in your `package.json` to avoid CORS issues:
```json
"proxy": "http://localhost:8080"
```
This will proxy API requests from the React app to the backend server.
## Troubleshooting
If you encounter issues, ensure that:
- Node.js and npm are installed correctly.
- All dependencies are installed without errors.
- The backend server is running if your React app depends on it.
- Check the console for any error messages and resolve them accordingly.