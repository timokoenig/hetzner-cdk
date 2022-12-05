export type HPrice = {
  location: string;
  price_hourly: {
    gross: string;
    net: string;
  };
  price_monthly: {
    gross: string;
    net: string;
  };
};
