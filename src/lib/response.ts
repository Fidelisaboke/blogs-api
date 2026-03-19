export class ApiResponse<T> {
    public success: boolean;
    public message: string;
    public data: T | null;
    public errors: unknown | null;

    private constructor(success: boolean, message: string, data: T | null, errors: unknown | null = null) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }

    static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
        return new ApiResponse<T>(true, message, data, null);
    }

    static error(errors: unknown, message: string = 'Error'): ApiResponse<null> {
        return new ApiResponse(false, message, null, errors);
    }
}

