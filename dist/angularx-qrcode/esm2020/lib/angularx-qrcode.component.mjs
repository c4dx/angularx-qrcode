import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, } from "@angular/core";
import * as QRCode from "@cordobo/qrcode";
import * as i0 from "@angular/core";
import * as i1 from "@angular/platform-browser";
export class QRCodeComponent {
    constructor(renderer, sanitizer) {
        this.renderer = renderer;
        this.sanitizer = sanitizer;
        this.allowEmptyString = false;
        this.colorDark = "#000000ff";
        this.colorLight = "#ffffffff";
        this.cssClass = "qrcode";
        this.elementType = "canvas";
        this.errorCorrectionLevel = "M";
        this.margin = 4;
        this.qrdata = "";
        this.scale = 4;
        this.width = 10;
        this.qrCodeURL = new EventEmitter();
        this.context = null;
    }
    async ngOnChanges() {
        await this.createQRCode();
    }
    isValidQrCodeText(data) {
        if (this.allowEmptyString === false) {
            return !(typeof data === "undefined" ||
                data === "" ||
                data === "null" ||
                data === null);
        }
        return !(typeof data === "undefined");
    }
    toDataURL(qrCodeConfig) {
        return new Promise((resolve, reject) => {
            QRCode.toDataURL(this.qrdata, qrCodeConfig, (err, url) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(url);
                }
            });
        });
    }
    toCanvas(canvas, qrCodeConfig) {
        return new Promise((resolve, reject) => {
            QRCode.toCanvas(canvas, this.qrdata, qrCodeConfig, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve("success");
                }
            });
        });
    }
    toSVG(qrCodeConfig) {
        return new Promise((resolve, reject) => {
            QRCode.toString(this.qrdata, qrCodeConfig, (err, url) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(url);
                }
            });
        });
    }
    renderElement(element) {
        for (const node of this.qrcElement.nativeElement.childNodes) {
            this.renderer.removeChild(this.qrcElement.nativeElement, node);
        }
        this.renderer.appendChild(this.qrcElement.nativeElement, element);
    }
    async createQRCode() {
        if (this.version && this.version > 40) {
            console.warn("[angularx-qrcode] max value for `version` is 40");
            this.version = 40;
        }
        else if (this.version && this.version < 1) {
            console.warn("[angularx-qrcode]`min value for `version` is 1");
            this.version = 1;
        }
        else if (this.version !== undefined && isNaN(this.version)) {
            console.warn("[angularx-qrcode] version should be a number, defaulting to auto.");
            this.version = undefined;
        }
        try {
            if (!this.isValidQrCodeText(this.qrdata)) {
                throw new Error("[angularx-qrcode] Field `qrdata` is empty, set 'allowEmptyString=\"true\"' to overwrite this behaviour.");
            }
            if (this.isValidQrCodeText(this.qrdata) && this.qrdata === "") {
                this.qrdata = " ";
            }
            const config = {
                color: {
                    dark: this.colorDark,
                    light: this.colorLight,
                },
                errorCorrectionLevel: this.errorCorrectionLevel,
                margin: this.margin,
                scale: this.scale,
                type: this.elementType,
                version: this.version,
                width: this.width,
            };
            const centerImageSrc = this.imageSrc;
            const centerImageHeight = this.imageHeight || 40;
            const centerImageWidth = this.imageWidth || 40;
            switch (this.elementType) {
                case "canvas":
                    const canvasElement = this.renderer.createElement("canvas");
                    this.context = canvasElement.getContext("2d");
                    this.toCanvas(canvasElement, config)
                        .then(() => {
                        if (this.ariaLabel) {
                            this.renderer.setAttribute(canvasElement, "aria-label", `${this.ariaLabel}`);
                        }
                        if (this.title) {
                            this.renderer.setAttribute(canvasElement, "title", `${this.title}`);
                        }
                        if (centerImageSrc && this.context) {
                            this.centerImage = new Image(centerImageWidth, centerImageHeight);
                            if (centerImageSrc !== this.centerImage.src) {
                                this.centerImage.src = centerImageSrc;
                            }
                            if (centerImageHeight !== this.centerImage.height) {
                                this.centerImage.height = centerImageHeight;
                            }
                            if (centerImageWidth !== this.centerImage.width) {
                                this.centerImage.width = centerImageWidth;
                            }
                            const centerImage = this.centerImage;
                            if (centerImage) {
                                centerImage.onload = () => {
                                    this.context?.drawImage(centerImage, canvasElement.width / 2 - centerImageWidth / 2, canvasElement.height / 2 - centerImageHeight / 2, centerImageWidth, centerImageHeight);
                                };
                            }
                        }
                        this.renderElement(canvasElement);
                        this.emitQRCodeURL(canvasElement);
                    })
                        .catch((e) => {
                        console.error("[angularx-qrcode] canvas error:", e);
                    });
                    break;
                case "svg":
                    const svgParentElement = this.renderer.createElement("div");
                    this.toSVG(config)
                        .then((svgString) => {
                        this.renderer.setProperty(svgParentElement, "innerHTML", svgString);
                        const svgElement = svgParentElement.firstChild;
                        this.renderer.setAttribute(svgElement, "height", `${this.width}`);
                        this.renderer.setAttribute(svgElement, "width", `${this.width}`);
                        this.renderElement(svgElement);
                        this.emitQRCodeURL(svgElement);
                    })
                        .catch((e) => {
                        console.error("[angularx-qrcode] svg error:", e);
                    });
                    break;
                case "url":
                case "img":
                default:
                    const imgElement = this.renderer.createElement("img");
                    this.toDataURL(config)
                        .then((dataUrl) => {
                        if (this.alt) {
                            imgElement.setAttribute("alt", this.alt);
                        }
                        if (this.ariaLabel) {
                            imgElement.setAttribute("aria-label", this.ariaLabel);
                        }
                        imgElement.setAttribute("src", dataUrl);
                        if (this.title) {
                            imgElement.setAttribute("title", this.title);
                        }
                        this.renderElement(imgElement);
                        this.emitQRCodeURL(imgElement);
                    })
                        .catch((e) => {
                        console.error("[angularx-qrcode] img/url error:", e);
                    });
            }
        }
        catch (e) {
            console.error("[angularx-qrcode] Error generating QR Code:", e.message);
        }
    }
    emitQRCodeURL(element) {
        const className = element.constructor.name;
        if (className === SVGSVGElement.name) {
            const svgHTML = element.outerHTML;
            const blob = new Blob([svgHTML], { type: "image/svg+xml" });
            const urlSvg = URL.createObjectURL(blob);
            const urlSanitized = this.sanitizer.bypassSecurityTrustUrl(urlSvg);
            this.qrCodeURL.emit(urlSanitized);
            return;
        }
        let urlImage = "";
        if (className === HTMLCanvasElement.name) {
            urlImage = element.toDataURL("image/png");
        }
        if (className === HTMLImageElement.name) {
            urlImage = element.src;
        }
        fetch(urlImage)
            .then((urlResponse) => urlResponse.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((url) => this.sanitizer.bypassSecurityTrustUrl(url))
            .then((urlSanitized) => {
            this.qrCodeURL.emit(urlSanitized);
        })
            .catch((error) => {
            console.error("[angularx-qrcode] Error when fetching image/png URL: " + error);
        });
    }
}
QRCodeComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: QRCodeComponent, deps: [{ token: i0.Renderer2 }, { token: i1.DomSanitizer }], target: i0.ɵɵFactoryTarget.Component });
QRCodeComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.1", type: QRCodeComponent, selector: "qrcode", inputs: { allowEmptyString: "allowEmptyString", colorDark: "colorDark", colorLight: "colorLight", cssClass: "cssClass", elementType: "elementType", errorCorrectionLevel: "errorCorrectionLevel", imageSrc: "imageSrc", imageHeight: "imageHeight", imageWidth: "imageWidth", margin: "margin", qrdata: "qrdata", scale: "scale", version: "version", width: "width", alt: "alt", ariaLabel: "ariaLabel", title: "title" }, outputs: { qrCodeURL: "qrCodeURL" }, viewQueries: [{ propertyName: "qrcElement", first: true, predicate: ["qrcElement"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: `<div #qrcElement [class]="cssClass"></div>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: QRCodeComponent, decorators: [{
            type: Component,
            args: [{
                    selector: "qrcode",
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `<div #qrcElement [class]="cssClass"></div>`,
                }]
        }], ctorParameters: function () { return [{ type: i0.Renderer2 }, { type: i1.DomSanitizer }]; }, propDecorators: { allowEmptyString: [{
                type: Input
            }], colorDark: [{
                type: Input
            }], colorLight: [{
                type: Input
            }], cssClass: [{
                type: Input
            }], elementType: [{
                type: Input
            }], errorCorrectionLevel: [{
                type: Input
            }], imageSrc: [{
                type: Input
            }], imageHeight: [{
                type: Input
            }], imageWidth: [{
                type: Input
            }], margin: [{
                type: Input
            }], qrdata: [{
                type: Input
            }], scale: [{
                type: Input
            }], version: [{
                type: Input
            }], width: [{
                type: Input
            }], alt: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], title: [{
                type: Input
            }], qrCodeURL: [{
                type: Output
            }], qrcElement: [{
                type: ViewChild,
                args: ["qrcElement", { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcngtcXJjb2RlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXJ4LXFyY29kZS9zcmMvbGliL2FuZ3VsYXJ4LXFyY29kZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBRVQsWUFBWSxFQUNaLEtBQUssRUFFTCxNQUFNLEVBRU4sU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFBO0FBSXRCLE9BQU8sS0FBSyxNQUFNLE1BQU0saUJBQWlCLENBQUE7OztBQWF6QyxNQUFNLE9BQU8sZUFBZTtJQTZCMUIsWUFBb0IsUUFBbUIsRUFBVSxTQUF1QjtRQUFwRCxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBYztRQTVCeEQscUJBQWdCLEdBQUcsS0FBSyxDQUFBO1FBQ3hCLGNBQVMsR0FBRyxXQUFXLENBQUE7UUFDdkIsZUFBVSxHQUFHLFdBQVcsQ0FBQTtRQUN4QixhQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ25CLGdCQUFXLEdBQXNCLFFBQVEsQ0FBQTtRQUVsRCx5QkFBb0IsR0FBK0IsR0FBRyxDQUFBO1FBSTdDLFdBQU0sR0FBRyxDQUFDLENBQUE7UUFDVixXQUFNLEdBQUcsRUFBRSxDQUFBO1FBQ1gsVUFBSyxHQUFHLENBQUMsQ0FBQTtRQUVULFVBQUssR0FBRyxFQUFFLENBQUE7UUFPaEIsY0FBUyxHQUFHLElBQUksWUFBWSxFQUFXLENBQUE7UUFJMUMsWUFBTyxHQUFvQyxJQUFJLENBQUE7SUFHcUIsQ0FBQztJQUVyRSxLQUFLLENBQUMsV0FBVztRQUN0QixNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtJQUMzQixDQUFDO0lBRVMsaUJBQWlCLENBQUMsSUFBbUI7UUFDN0MsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEtBQUssS0FBSyxFQUFFO1lBQ25DLE9BQU8sQ0FB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Q1UsS0FBSztzQkFBcEIsS0FBSztnQkFHVSxHQUFHO3NCQUFsQixLQUFLO2dCQUNVLFNBQVM7c0JBQXhCLEtBQUs7Z0JBQ1UsS0FBSztzQkFBcEIsS0FBSztnQkFFSSxTQUFTO3NCQUFsQixNQUFNO2dCQUUyQyxVQUFVO3NCQUEzRCxTQUFTO3VCQUFDLFlBQVksRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxyXG4gIENvbXBvbmVudCxcclxuICBFbGVtZW50UmVmLFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgT3V0cHV0LFxyXG4gIFJlbmRlcmVyMixcclxuICBWaWV3Q2hpbGQsXHJcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIlxyXG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIsIFNhZmVVcmwgfSBmcm9tIFwiQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3NlclwiXHJcbi8vIEB0cy1pZ25vcmVcclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxyXG5pbXBvcnQgKiBhcyBRUkNvZGUgZnJvbSBcIkBjb3Jkb2JvL3FyY29kZVwiXHJcbmltcG9ydCB7XHJcbiAgUVJDb2RlRXJyb3JDb3JyZWN0aW9uTGV2ZWwsXHJcbiAgUVJDb2RlVmVyc2lvbixcclxuICBRUkNvZGVFbGVtZW50VHlwZSxcclxuICBRUkNvZGVDb25maWdUeXBlLFxyXG59IGZyb20gXCIuL3R5cGVzXCJcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiBcInFyY29kZVwiLFxyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gIHRlbXBsYXRlOiBgPGRpdiAjcXJjRWxlbWVudCBbY2xhc3NdPVwiY3NzQ2xhc3NcIj48L2Rpdj5gLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgUVJDb2RlQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcclxuICBASW5wdXQoKSBwdWJsaWMgYWxsb3dFbXB0eVN0cmluZyA9IGZhbHNlXHJcbiAgQElucHV0KCkgcHVibGljIGNvbG9yRGFyayA9IFwiIzAwMDAwMGZmXCJcclxuICBASW5wdXQoKSBwdWJsaWMgY29sb3JMaWdodCA9IFwiI2ZmZmZmZmZmXCJcclxuICBASW5wdXQoKSBwdWJsaWMgY3NzQ2xhc3MgPSBcInFyY29kZVwiXHJcbiAgQElucHV0KCkgcHVibGljIGVsZW1lbnRUeXBlOiBRUkNvZGVFbGVtZW50VHlwZSA9IFwiY2FudmFzXCJcclxuICBASW5wdXQoKVxyXG4gIHB1YmxpYyBlcnJvckNvcnJlY3Rpb25MZXZlbDogUVJDb2RlRXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSBcIk1cIlxyXG4gIEBJbnB1dCgpIHB1YmxpYyBpbWFnZVNyYz86IHN0cmluZ1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBpbWFnZUhlaWdodD86IG51bWJlclxyXG4gIEBJbnB1dCgpIHB1YmxpYyBpbWFnZVdpZHRoPzogbnVtYmVyXHJcbiAgQElucHV0KCkgcHVibGljIG1hcmdpbiA9IDRcclxuICBASW5wdXQoKSBwdWJsaWMgcXJkYXRhID0gXCJcIlxyXG4gIEBJbnB1dCgpIHB1YmxpYyBzY2FsZSA9IDRcclxuICBASW5wdXQoKSBwdWJsaWMgdmVyc2lvbj86IFFSQ29kZVZlcnNpb25cclxuICBASW5wdXQoKSBwdWJsaWMgd2lkdGggPSAxMFxyXG5cclxuICAvLyBBY2Nlc3NpYmlsaXR5IGZlYXR1cmVzIGludHJvZHVjZWQgaW4gMTMuMC40K1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBhbHQ/OiBzdHJpbmdcclxuICBASW5wdXQoKSBwdWJsaWMgYXJpYUxhYmVsPzogc3RyaW5nXHJcbiAgQElucHV0KCkgcHVibGljIHRpdGxlPzogc3RyaW5nXHJcblxyXG4gIEBPdXRwdXQoKSBxckNvZGVVUkwgPSBuZXcgRXZlbnRFbWl0dGVyPFNhZmVVcmw+KClcclxuXHJcbiAgQFZpZXdDaGlsZChcInFyY0VsZW1lbnRcIiwgeyBzdGF0aWM6IHRydWUgfSkgcHVibGljIHFyY0VsZW1lbnQhOiBFbGVtZW50UmVmXHJcblxyXG4gIHB1YmxpYyBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsID0gbnVsbFxyXG4gIHByaXZhdGUgY2VudGVySW1hZ2U/OiBIVE1MSW1hZ2VFbGVtZW50XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMiwgcHJpdmF0ZSBzYW5pdGl6ZXI6IERvbVNhbml0aXplcikge31cclxuXHJcbiAgcHVibGljIGFzeW5jIG5nT25DaGFuZ2VzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVRUkNvZGUoKVxyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGlzVmFsaWRRckNvZGVUZXh0KGRhdGE6IHN0cmluZyB8IG51bGwpOiBib29sZWFuIHtcclxuICAgIGlmICh0aGlzLmFsbG93RW1wdHlTdHJpbmcgPT09IGZhbHNlKSB7XHJcbiAgICAgIHJldHVybiAhKFxyXG4gICAgICAgIHR5cGVvZiBkYXRhID09PSBcInVuZGVmaW5lZFwiIHx8XHJcbiAgICAgICAgZGF0YSA9PT0gXCJcIiB8fFxyXG4gICAgICAgIGRhdGEgPT09IFwibnVsbFwiIHx8XHJcbiAgICAgICAgZGF0YSA9PT0gbnVsbFxyXG4gICAgICApXHJcbiAgICB9XHJcbiAgICByZXR1cm4gISh0eXBlb2YgZGF0YSA9PT0gXCJ1bmRlZmluZWRcIilcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdG9EYXRhVVJMKHFyQ29kZUNvbmZpZzogUVJDb2RlQ29uZmlnVHlwZSk6IFByb21pc2U8YW55PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoXHJcbiAgICAgIChyZXNvbHZlOiAoYXJnOiBhbnkpID0+IGFueSwgcmVqZWN0OiAoYXJnOiBhbnkpID0+IGFueSkgPT4ge1xyXG4gICAgICAgIFFSQ29kZS50b0RhdGFVUkwoXHJcbiAgICAgICAgICB0aGlzLnFyZGF0YSxcclxuICAgICAgICAgIHFyQ29kZUNvbmZpZyxcclxuICAgICAgICAgIChlcnI6IEVycm9yLCB1cmw6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgcmVqZWN0KGVycilcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICByZXNvbHZlKHVybClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgICAgfVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0b0NhbnZhcyhcclxuICAgIGNhbnZhczogRWxlbWVudCxcclxuICAgIHFyQ29kZUNvbmZpZzogUVJDb2RlQ29uZmlnVHlwZVxyXG4gICk6IFByb21pc2U8YW55PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoXHJcbiAgICAgIChyZXNvbHZlOiAoYXJnOiBhbnkpID0+IGFueSwgcmVqZWN0OiAoYXJnOiBhbnkpID0+IGFueSkgPT4ge1xyXG4gICAgICAgIFFSQ29kZS50b0NhbnZhcyhjYW52YXMsIHRoaXMucXJkYXRhLCBxckNvZGVDb25maWcsIChlcnJvcjogRXJyb3IpID0+IHtcclxuICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICByZWplY3QoZXJyb3IpXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXNvbHZlKFwic3VjY2Vzc1wiKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdG9TVkcocXJDb2RlQ29uZmlnOiBRUkNvZGVDb25maWdUeXBlKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShcclxuICAgICAgKHJlc29sdmU6IChhcmc6IGFueSkgPT4gYW55LCByZWplY3Q6IChhcmc6IGFueSkgPT4gYW55KSA9PiB7XHJcbiAgICAgICAgUVJDb2RlLnRvU3RyaW5nKFxyXG4gICAgICAgICAgdGhpcy5xcmRhdGEsXHJcbiAgICAgICAgICBxckNvZGVDb25maWcsXHJcbiAgICAgICAgICAoZXJyOiBFcnJvciwgdXJsOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgIHJlamVjdChlcnIpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmVzb2x2ZSh1cmwpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICApXHJcbiAgICAgIH1cclxuICAgIClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVuZGVyRWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogdm9pZCB7XHJcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcy5xcmNFbGVtZW50Lm5hdGl2ZUVsZW1lbnQuY2hpbGROb2Rlcykge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNoaWxkKHRoaXMucXJjRWxlbWVudC5uYXRpdmVFbGVtZW50LCBub2RlKVxyXG4gICAgfVxyXG4gICAgdGhpcy5yZW5kZXJlci5hcHBlbmRDaGlsZCh0aGlzLnFyY0VsZW1lbnQubmF0aXZlRWxlbWVudCwgZWxlbWVudClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgY3JlYXRlUVJDb2RlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgLy8gU2V0IHNlbnNpdGl2ZSBkZWZhdWx0c1xyXG4gICAgaWYgKHRoaXMudmVyc2lvbiAmJiB0aGlzLnZlcnNpb24gPiA0MCkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJbYW5ndWxhcngtcXJjb2RlXSBtYXggdmFsdWUgZm9yIGB2ZXJzaW9uYCBpcyA0MFwiKVxyXG4gICAgICB0aGlzLnZlcnNpb24gPSA0MFxyXG4gICAgfSBlbHNlIGlmICh0aGlzLnZlcnNpb24gJiYgdGhpcy52ZXJzaW9uIDwgMSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJbYW5ndWxhcngtcXJjb2RlXWBtaW4gdmFsdWUgZm9yIGB2ZXJzaW9uYCBpcyAxXCIpXHJcbiAgICAgIHRoaXMudmVyc2lvbiA9IDFcclxuICAgIH0gZWxzZSBpZiAodGhpcy52ZXJzaW9uICE9PSB1bmRlZmluZWQgJiYgaXNOYU4odGhpcy52ZXJzaW9uKSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgXCJbYW5ndWxhcngtcXJjb2RlXSB2ZXJzaW9uIHNob3VsZCBiZSBhIG51bWJlciwgZGVmYXVsdGluZyB0byBhdXRvLlwiXHJcbiAgICAgIClcclxuICAgICAgdGhpcy52ZXJzaW9uID0gdW5kZWZpbmVkXHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKCF0aGlzLmlzVmFsaWRRckNvZGVUZXh0KHRoaXMucXJkYXRhKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgIFwiW2FuZ3VsYXJ4LXFyY29kZV0gRmllbGQgYHFyZGF0YWAgaXMgZW1wdHksIHNldCAnYWxsb3dFbXB0eVN0cmluZz1cXFwidHJ1ZVxcXCInIHRvIG92ZXJ3cml0ZSB0aGlzIGJlaGF2aW91ci5cIlxyXG4gICAgICAgIClcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgdG8gYWxsb3cgYW4gZW1wdHkgc3RyaW5nIGFzIHFyZGF0YVxyXG4gICAgICBpZiAodGhpcy5pc1ZhbGlkUXJDb2RlVGV4dCh0aGlzLnFyZGF0YSkgJiYgdGhpcy5xcmRhdGEgPT09IFwiXCIpIHtcclxuICAgICAgICB0aGlzLnFyZGF0YSA9IFwiIFwiXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGNvbmZpZzogUVJDb2RlQ29uZmlnVHlwZSA9IHtcclxuICAgICAgICBjb2xvcjoge1xyXG4gICAgICAgICAgZGFyazogdGhpcy5jb2xvckRhcmssXHJcbiAgICAgICAgICBsaWdodDogdGhpcy5jb2xvckxpZ2h0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWw6IHRoaXMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwsXHJcbiAgICAgICAgbWFyZ2luOiB0aGlzLm1hcmdpbixcclxuICAgICAgICBzY2FsZTogdGhpcy5zY2FsZSxcclxuICAgICAgICB0eXBlOiB0aGlzLmVsZW1lbnRUeXBlLFxyXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbixcclxuICAgICAgICB3aWR0aDogdGhpcy53aWR0aCxcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgY2VudGVySW1hZ2VTcmMgPSB0aGlzLmltYWdlU3JjXHJcbiAgICAgIGNvbnN0IGNlbnRlckltYWdlSGVpZ2h0ID0gdGhpcy5pbWFnZUhlaWdodCB8fCA0MFxyXG4gICAgICBjb25zdCBjZW50ZXJJbWFnZVdpZHRoID0gdGhpcy5pbWFnZVdpZHRoIHx8IDQwXHJcblxyXG4gICAgICBzd2l0Y2ggKHRoaXMuZWxlbWVudFR5cGUpIHtcclxuICAgICAgICBjYXNlIFwiY2FudmFzXCI6XHJcbiAgICAgICAgICBjb25zdCBjYW52YXNFbGVtZW50OiBIVE1MQ2FudmFzRWxlbWVudCA9XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKVxyXG4gICAgICAgICAgdGhpcy5jb250ZXh0ID0gY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIilcclxuICAgICAgICAgIHRoaXMudG9DYW52YXMoY2FudmFzRWxlbWVudCwgY29uZmlnKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMuYXJpYUxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZShcclxuICAgICAgICAgICAgICAgICAgY2FudmFzRWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCIsXHJcbiAgICAgICAgICAgICAgICAgIGAke3RoaXMuYXJpYUxhYmVsfWBcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMudGl0bGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKFxyXG4gICAgICAgICAgICAgICAgICBjYW52YXNFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICBcInRpdGxlXCIsXHJcbiAgICAgICAgICAgICAgICAgIGAke3RoaXMudGl0bGV9YFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKGNlbnRlckltYWdlU3JjICYmIHRoaXMuY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZW50ZXJJbWFnZSA9IG5ldyBJbWFnZShcclxuICAgICAgICAgICAgICAgICAgY2VudGVySW1hZ2VXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgY2VudGVySW1hZ2VIZWlnaHRcclxuICAgICAgICAgICAgICAgIClcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2VudGVySW1hZ2VTcmMgIT09IHRoaXMuY2VudGVySW1hZ2Uuc3JjKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuY2VudGVySW1hZ2Uuc3JjID0gY2VudGVySW1hZ2VTcmNcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2VudGVySW1hZ2VIZWlnaHQgIT09IHRoaXMuY2VudGVySW1hZ2UuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuY2VudGVySW1hZ2UuaGVpZ2h0ID0gY2VudGVySW1hZ2VIZWlnaHRcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2VudGVySW1hZ2VXaWR0aCAhPT0gdGhpcy5jZW50ZXJJbWFnZS53aWR0aCkge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmNlbnRlckltYWdlLndpZHRoID0gY2VudGVySW1hZ2VXaWR0aFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlckltYWdlID0gdGhpcy5jZW50ZXJJbWFnZVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjZW50ZXJJbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICBjZW50ZXJJbWFnZS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0Py5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJJbWFnZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGNhbnZhc0VsZW1lbnQud2lkdGggLyAyIC0gY2VudGVySW1hZ2VXaWR0aCAvIDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBjYW52YXNFbGVtZW50LmhlaWdodCAvIDIgLSBjZW50ZXJJbWFnZUhlaWdodCAvIDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJJbWFnZVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgY2VudGVySW1hZ2VIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHRoaXMucmVuZGVyRWxlbWVudChjYW52YXNFbGVtZW50KVxyXG4gICAgICAgICAgICAgIHRoaXMuZW1pdFFSQ29kZVVSTChjYW52YXNFbGVtZW50IGFzIEhUTUxDYW52YXNFbGVtZW50KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW2FuZ3VsYXJ4LXFyY29kZV0gY2FudmFzIGVycm9yOlwiLCBlKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlIFwic3ZnXCI6XHJcbiAgICAgICAgICBjb25zdCBzdmdQYXJlbnRFbGVtZW50OiBIVE1MRWxlbWVudCA9XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIuY3JlYXRlRWxlbWVudChcImRpdlwiKVxyXG4gICAgICAgICAgdGhpcy50b1NWRyhjb25maWcpXHJcbiAgICAgICAgICAgIC50aGVuKChzdmdTdHJpbmc6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucmVuZGVyZXIuc2V0UHJvcGVydHkoXHJcbiAgICAgICAgICAgICAgICBzdmdQYXJlbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgXCJpbm5lckhUTUxcIixcclxuICAgICAgICAgICAgICAgIHN2Z1N0cmluZ1xyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICBjb25zdCBzdmdFbGVtZW50ID0gc3ZnUGFyZW50RWxlbWVudC5maXJzdENoaWxkIGFzIFNWR1NWR0VsZW1lbnRcclxuICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZShzdmdFbGVtZW50LCBcImhlaWdodFwiLCBgJHt0aGlzLndpZHRofWApXHJcbiAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUoc3ZnRWxlbWVudCwgXCJ3aWR0aFwiLCBgJHt0aGlzLndpZHRofWApXHJcbiAgICAgICAgICAgICAgdGhpcy5yZW5kZXJFbGVtZW50KHN2Z0VsZW1lbnQpXHJcbiAgICAgICAgICAgICAgdGhpcy5lbWl0UVJDb2RlVVJMKHN2Z0VsZW1lbnQpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbYW5ndWxhcngtcXJjb2RlXSBzdmcgZXJyb3I6XCIsIGUpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgXCJ1cmxcIjpcclxuICAgICAgICBjYXNlIFwiaW1nXCI6XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGNvbnN0IGltZ0VsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQgPVxyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmNyZWF0ZUVsZW1lbnQoXCJpbWdcIilcclxuICAgICAgICAgIHRoaXMudG9EYXRhVVJMKGNvbmZpZylcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGFVcmw6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgIGlmICh0aGlzLmFsdCkge1xyXG4gICAgICAgICAgICAgICAgaW1nRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJhbHRcIiwgdGhpcy5hbHQpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmICh0aGlzLmFyaWFMYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgaW1nRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIHRoaXMuYXJpYUxhYmVsKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpbWdFbGVtZW50LnNldEF0dHJpYnV0ZShcInNyY1wiLCBkYXRhVXJsKVxyXG4gICAgICAgICAgICAgIGlmICh0aGlzLnRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICBpbWdFbGVtZW50LnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIHRoaXMudGl0bGUpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHRoaXMucmVuZGVyRWxlbWVudChpbWdFbGVtZW50KVxyXG4gICAgICAgICAgICAgIHRoaXMuZW1pdFFSQ29kZVVSTChpbWdFbGVtZW50KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW2FuZ3VsYXJ4LXFyY29kZV0gaW1nL3VybCBlcnJvcjpcIiwgZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJbYW5ndWxhcngtcXJjb2RlXSBFcnJvciBnZW5lcmF0aW5nIFFSIENvZGU6XCIsIGUubWVzc2FnZSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGVtaXRRUkNvZGVVUkwoZWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQgfCBIVE1MSW1hZ2VFbGVtZW50IHwgU1ZHU1ZHRWxlbWVudCkge1xyXG4gICAgY29uc3QgY2xhc3NOYW1lID0gZWxlbWVudC5jb25zdHJ1Y3Rvci5uYW1lXHJcbiAgICBpZiAoY2xhc3NOYW1lID09PSBTVkdTVkdFbGVtZW50Lm5hbWUpIHtcclxuICAgICAgY29uc3Qgc3ZnSFRNTCA9IGVsZW1lbnQub3V0ZXJIVE1MXHJcbiAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbc3ZnSFRNTF0sIHsgdHlwZTogXCJpbWFnZS9zdmcreG1sXCIgfSlcclxuICAgICAgY29uc3QgdXJsU3ZnID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxyXG4gICAgICBjb25zdCB1cmxTYW5pdGl6ZWQgPSB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0VXJsKHVybFN2ZylcclxuICAgICAgdGhpcy5xckNvZGVVUkwuZW1pdCh1cmxTYW5pdGl6ZWQpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGxldCB1cmxJbWFnZSA9IFwiXCJcclxuXHJcbiAgICBpZiAoY2xhc3NOYW1lID09PSBIVE1MQ2FudmFzRWxlbWVudC5uYW1lKSB7XHJcbiAgICAgIHVybEltYWdlID0gKGVsZW1lbnQgYXMgSFRNTENhbnZhc0VsZW1lbnQpLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChjbGFzc05hbWUgPT09IEhUTUxJbWFnZUVsZW1lbnQubmFtZSkge1xyXG4gICAgICB1cmxJbWFnZSA9IChlbGVtZW50IGFzIEhUTUxJbWFnZUVsZW1lbnQpLnNyY1xyXG4gICAgfVxyXG5cclxuICAgIGZldGNoKHVybEltYWdlKVxyXG4gICAgICAudGhlbigodXJsUmVzcG9uc2U6IFJlc3BvbnNlKSA9PiB1cmxSZXNwb25zZS5ibG9iKCkpXHJcbiAgICAgIC50aGVuKChibG9iOiBCbG9iKSA9PiBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKVxyXG4gICAgICAudGhlbigodXJsOiBzdHJpbmcpID0+IHRoaXMuc2FuaXRpemVyLmJ5cGFzc1NlY3VyaXR5VHJ1c3RVcmwodXJsKSlcclxuICAgICAgLnRoZW4oKHVybFNhbml0aXplZDogU2FmZVVybCkgPT4ge1xyXG4gICAgICAgIHRoaXMucXJDb2RlVVJMLmVtaXQodXJsU2FuaXRpemVkKVxyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgIFwiW2FuZ3VsYXJ4LXFyY29kZV0gRXJyb3Igd2hlbiBmZXRjaGluZyBpbWFnZS9wbmcgVVJMOiBcIiArIGVycm9yXHJcbiAgICAgICAgKVxyXG4gICAgICB9KVxyXG4gIH1cclxufVxyXG4iXX0=