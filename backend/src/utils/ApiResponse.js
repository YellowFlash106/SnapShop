class ApiResponse {
    constructor(statusCode, message = "Request successful", data = null) {
        this.success = true;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

module.exports = ApiResponse;