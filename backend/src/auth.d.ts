export declare const generateToken: (userId: number) => string;
export declare const verifyToken: (token: string) => any;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const verifyPassword: (password: string, hash: string) => Promise<boolean>;
export declare const registerUser: (username: string, email: string, password: string, fullName: string) => Promise<{
    success: boolean;
    user: any;
    error?: never;
} | {
    success: boolean;
    error: string;
    user?: never;
}>;
export declare const loginUser: (email: string, password: string) => Promise<{
    success: boolean;
    error: string;
    token?: never;
    user?: never;
} | {
    success: boolean;
    token: string;
    user: {
        id: any;
        username: any;
        email: any;
        fullName: any;
    };
    error?: never;
}>;
//# sourceMappingURL=auth.d.ts.map