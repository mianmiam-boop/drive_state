export declare const createDetectionRecord: (userId: number, detectionType: "image" | "video", filePath: string, fileName: string) => Promise<any>;
export declare const callPythonDetectionService: (imagePath: string) => Promise<any>;
export declare const saveAnalysisResult: (detectionId: number, analysisData: any) => Promise<any>;
export declare const getUserDetectionHistory: (userId: number, limit?: number) => Promise<any>;
export declare const getDetectionDetails: (detectionId: number) => Promise<any>;
//# sourceMappingURL=detection.d.ts.map