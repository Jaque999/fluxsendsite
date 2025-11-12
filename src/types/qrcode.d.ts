declare module "qrcode" {
  export function toDataURL(
    text: string,
    options?: {
      margin?: number;
      color?: { dark?: string; light?: string };
      width?: number;
      scale?: number;
    }
  ): Promise<string>;
}


