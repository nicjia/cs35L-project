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


