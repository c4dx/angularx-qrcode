export interface QRCodeConfigType {
    color: {
        dark: string;
        light: string;
    };
    errorCorrectionLevel: QRCodeErrorCorrectionLevel;
    margin: number;
    scale: number;
    type: QRCodeElementType;
    version: QRCodeVersion | undefined;
    width: number;
}
export declare type QRCodeErrorCorrectionLevel = "L" | "M" | "Q" | "H" | "low" | "medium" | "quartile" | "high";
export declare type QRCodeElementType = "url" | "img" | "canvas" | "svg";
export declare type QRCodeVersion = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40;
export declare type RGBAColor = `#${string}`;
