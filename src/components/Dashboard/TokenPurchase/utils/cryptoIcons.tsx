
import React from "react";
import { Bitcoin, DollarSign } from "lucide-react";

// This function returns an icon component based on the currency code
export const getCryptoIcon = (currency: string) => {
  switch (currency?.toUpperCase()) {
    case "BTC":
      return (props: any) => <Bitcoin {...props} />;
    case "BNB":
      return (props: any) => (
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <path 
            d="M12 0L5.95 6.05L8.48 8.57L12 5.05L15.52 8.57L18.05 6.05L12 0Z" 
            fill="currentColor" 
          />
          <path 
            d="M5.95 17.95L12 24L18.05 17.95L15.52 15.43L12 18.95L8.48 15.43L5.95 17.95Z" 
            fill="currentColor" 
          />
          <path 
            d="M0 12L2.52 14.52L5.05 12L2.52 9.48L0 12Z" 
            fill="currentColor" 
          />
          <path 
            d="M18.95 9.48L16.43 12L18.95 14.52L21.48 12L18.95 9.48Z" 
            fill="currentColor" 
          />
          <path 
            d="M8.48 12L12 15.52L15.52 12L12 8.48L8.48 12Z" 
            fill="currentColor" 
          />
        </svg>
      );
    case "ETH":
      return (props: any) => (
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <path 
            d="M11.9982 3L11.8693 3.4315V15.454L11.9982 15.5821L17.6271 12.2891L11.9982 3Z" 
            fill="currentColor" 
          />
          <path 
            d="M11.9983 3L6.36938 12.2891L11.9983 15.5821V9.71832V3Z" 
            fill="currentColor" 
            fillOpacity="0.8" 
          />
          <path 
            d="M11.9983 16.719L11.9264 16.8067V21.2669L11.9983 21.4754L17.6312 13.428L11.9983 16.719Z" 
            fill="currentColor" 
          />
          <path 
            d="M11.9983 21.4754V16.719L6.36938 13.428L11.9983 21.4754Z" 
            fill="currentColor" 
            fillOpacity="0.8" 
          />
        </svg>
      );
    case "USDT":
      return (props: any) => (
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <path 
            d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" 
            fill="currentColor" 
            fillOpacity="0.1"
          />
          <path 
            d="M13.6682 11.9778V11.9762C13.611 11.9826 13.1435 12.0186 12.0186 12.0186C11.1044 12.0186 10.5013 11.9841 10.3301 11.9762V11.9794C7.39108 11.8883 5.14541 11.4389 5.14541 10.9029C5.14541 10.367 7.39108 9.91753 10.3301 9.82477V11.669C10.5045 11.68 11.1187 11.7224 12.0251 11.7224C13.1182 11.7224 13.6095 11.6751 13.6666 11.6706V9.82635C16.599 9.91911 18.8384 10.3685 18.8384 10.9029C18.8384 11.4373 16.6022 11.8867 13.6666 11.9778M13.6666 9.57765V7.92323H18.0665V5.27832H5.93345V7.92323H10.3317V9.57607C7.04444 9.68307 4.5 10.2232 4.5 10.8734C4.5 11.5236 7.04444 12.0637 10.3317 12.1723V17.9999H13.6682V12.1707C16.9458 12.0621 19.4839 11.522 19.4839 10.8734C19.4839 10.2248 16.9522 9.68465 13.6666 9.57765" 
            fill="currentColor"
          />
        </svg>
      );
    case "DOGE":
      return (props: any) => (
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <path 
            d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" 
            fill="currentColor" 
            fillOpacity="0.1"
          />
          <path 
            d="M9.11508 9.60345H13.4502C14.4228 9.60345 15.7537 9.58261 16.5625 11.0598C16.9243 11.7318 17.0868 12.6621 17.0868 13.3132C17.0868 13.9643 16.9243 14.8946 16.5625 15.5667C15.7537 17.0438 14.4228 17.023 13.4502 17.023H9.11508V9.60345ZM6 7.5V19.1264H13.4502C14.7811 19.1264 15.9028 18.9806 16.8761 18.5596C19.5582 17.1868 19.5373 13.9643 19.5373 13.3132C19.5373 12.662 19.5582 9.43957 16.8761 8.0668C15.9028 7.64588 14.7811 7.5 13.4502 7.5H6Z" 
            fill="currentColor"
          />
        </svg>
      );
    case "XRP":
      return (props: any) => (
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <path 
            d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" 
            fill="currentColor" 
            fillOpacity="0.1"
          />
          <path 
            d="M17.9172 6L14.7828 9.1344C13.4073 10.5099 11.1927 10.5099 9.81717 9.1344L6.68277 6H3.54837L8.04837 10.5C10.1828 12.6344 13.8172 12.6344 15.9516 10.5L20.4516 6H17.9172ZM6.68277 18L9.81717 14.8656C11.1927 13.4901 13.4073 13.4901 14.7828 14.8656L17.9172 18H20.4516L15.9516 13.5C13.8172 11.3656 10.1828 11.3656 8.04837 13.5L3.54837 18H6.68277Z" 
            fill="currentColor"
          />
        </svg>
      );
    default:
      return DollarSign;
  }
};
