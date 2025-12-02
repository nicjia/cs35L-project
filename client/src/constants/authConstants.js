//Error Messages

//Standard error message for login, registter, and password reset

export const GENERIC_ERROR_MESSAGE ={
    //Server-side errors
    UNAUTHORIZED: "Invalid email or password.",
    SERVER_ERROR: "An error occurred. Please try again later.",
    NETWORK_ERROR: "Network error. Please check your connection and try again.",
    //client-side errors
    INVALID_EMAIL: "Please enter a valid email address.",
    EMAIL_REUQIRED: "Email is required.",
    PASSWORD_REQUIRED: "Password is required.",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
    PASSWORD_MISMATCH: "Passwords do not match.",
    //registration errors
    USERNAME_TAKEN: "Username is already in use.",
    EMAIL_TAKEN: "Email is already in use.",
    //Success messages
    REGISTRATION_SUCCESS: "Account created successfully. You can now log in.",
    LOGIN_SUCCESS: "Login successful.",
};

//Route paths
export const AUTH_ROUTES = {
    //Public routes
    LOGIN: "/",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",

    //Protected routes
    HOME: "/home",
    TASKS: "/tasks",
    PROFILE: "/profile",
};

//API Endpoints
export const API_ENDPOINTS = {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
};

//Validation Rules

export const VALIDATION_RULES = {  
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 100,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

//HTTP Status Codes

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,

};
