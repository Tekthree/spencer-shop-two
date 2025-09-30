declare module 'qrcode' {
  interface QRCodeColor {
    dark?: string;
    light?: string;
  }

  interface QRCodeOptions {
    margin?: number;
    scale?: number;
    width?: number;
    color?: QRCodeColor;
  }

  export function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
}
